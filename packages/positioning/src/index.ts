export type Side = "top" | "bottom" | "left" | "right";

export type Alignment = "start" | "center" | "end";

export type Placement = Side | `${Side}-${Alignment}`;

export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type ViewportSize = {
    width: number;
    height: number;
};

export type ComputePositionOptions = {
    placement?: Placement;
    offset?: number;
    padding?: number;
    flip?: boolean;
    shift?: boolean;
    strategy?: "absolute";
};

export type ComputePositionResult = {
    x: number;
    y: number;
    placement: Placement;
    middlewareData: {
        flipped: boolean;
        shifted: boolean;
    };
};

export type PositioningAdapter = {
    computePosition: typeof computePosition;
};

const DEFAULT_OFFSET = 8;
const DEFAULT_PADDING = 8;
const DEFAULT_PLACEMENT: Placement = "bottom";
const SSR_VIEWPORT: ViewportSize = {
    width: Number.MAX_SAFE_INTEGER / 2,
    height: Number.MAX_SAFE_INTEGER / 2,
};

const OPPOSITE_SIDE: Record<Side, Side> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
};

function isElementTarget(value: Element | Rect): value is Element {
    return typeof (value as Element).getBoundingClientRect === "function";
}

export function getElementRect(el: Element): Rect {
    const rect = el.getBoundingClientRect();
    return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
    };
}

function resolveRect(target: Element | Rect): Rect {
    if (isElementTarget(target)) {
        return getElementRect(target);
    }
    return {
        x: target.x,
        y: target.y,
        width: target.width,
        height: target.height,
    };
}

function resolveViewport(viewport: ViewportSize | undefined): ViewportSize {
    if (viewport !== undefined) {
        return viewport;
    }
    const globalWindow = globalThis as typeof globalThis & {
        window?: { innerWidth: number; innerHeight: number };
    };
    if (globalWindow.window !== undefined) {
        return {
            width: globalWindow.window.innerWidth,
            height: globalWindow.window.innerHeight,
        };
    }
    return SSR_VIEWPORT;
}

function parsePlacement(placement: Placement): { side: Side; alignment: Alignment } {
    const separatorIndex = placement.indexOf("-");
    if (separatorIndex === -1) {
        return {
            side: placement as Side,
            alignment: "center",
        };
    }
    return {
        side: placement.slice(0, separatorIndex) as Side,
        alignment: placement.slice(separatorIndex + 1) as Alignment,
    };
}

function formatPlacement(side: Side, alignment: Alignment): Placement {
    if (alignment === "center") {
        return side;
    }
    return `${side}-${alignment}`;
}

function computeAlignedAxis(
    referenceStart: number,
    referenceSize: number,
    floatingSize: number,
    alignment: Alignment,
): number {
    if (alignment === "start") {
        return referenceStart;
    }
    if (alignment === "end") {
        return referenceStart + referenceSize - floatingSize;
    }
    return referenceStart + (referenceSize - floatingSize) / 2;
}

function computeCoords(
    reference: Rect,
    floating: Rect,
    side: Side,
    alignment: Alignment,
    offset: number,
): { x: number; y: number } {
    if (side === "top") {
        return {
            x: computeAlignedAxis(reference.x, reference.width, floating.width, alignment),
            y: reference.y - floating.height - offset,
        };
    }
    if (side === "bottom") {
        return {
            x: computeAlignedAxis(reference.x, reference.width, floating.width, alignment),
            y: reference.y + reference.height + offset,
        };
    }
    if (side === "left") {
        return {
            x: reference.x - floating.width - offset,
            y: computeAlignedAxis(reference.y, reference.height, floating.height, alignment),
        };
    }
    return {
        x: reference.x + reference.width + offset,
        y: computeAlignedAxis(reference.y, reference.height, floating.height, alignment),
    };
}

function overflowsPreferredSide(
    coords: { x: number; y: number },
    floating: Rect,
    side: Side,
    viewport: ViewportSize,
): boolean {
    if (side === "top") {
        return coords.y < 0;
    }
    if (side === "bottom") {
        return coords.y + floating.height > viewport.height;
    }
    if (side === "left") {
        return coords.x < 0;
    }
    return coords.x + floating.width > viewport.width;
}

function shiftCoords(
    coords: { x: number; y: number },
    floating: Rect,
    viewport: ViewportSize,
    padding: number,
): { x: number; y: number; shifted: boolean } {
    const minX = padding;
    const minY = padding;
    const maxX = Math.max(padding, viewport.width - floating.width - padding);
    const maxY = Math.max(padding, viewport.height - floating.height - padding);
    const x = Math.min(Math.max(coords.x, minX), maxX);
    const y = Math.min(Math.max(coords.y, minY), maxY);
    return {
        x,
        y,
        shifted: x !== coords.x || y !== coords.y,
    };
}

export function computePosition(
    reference: Element | Rect,
    floating: Element | Rect,
    options: ComputePositionOptions = {},
    viewport?: ViewportSize,
): ComputePositionResult {
    const referenceRect = resolveRect(reference);
    const floatingRect = resolveRect(floating);
    const resolvedViewport = resolveViewport(viewport);
    const offset = options.offset ?? DEFAULT_OFFSET;
    const padding = options.padding ?? DEFAULT_PADDING;
    const flipEnabled = options.flip !== false;
    const shiftEnabled = options.shift !== false;
    const initialPlacement = options.placement ?? DEFAULT_PLACEMENT;
    const { side: preferredSide, alignment } = parsePlacement(initialPlacement);

    let side = preferredSide;
    let coords = computeCoords(referenceRect, floatingRect, side, alignment, offset);
    let flipped = false;

    if (flipEnabled && overflowsPreferredSide(coords, floatingRect, side, resolvedViewport)) {
        const opposite = OPPOSITE_SIDE[side];
        const oppositeCoords = computeCoords(
            referenceRect,
            floatingRect,
            opposite,
            alignment,
            offset,
        );
        side = opposite;
        coords = oppositeCoords;
        flipped = true;
    }

    let shifted = false;
    if (shiftEnabled) {
        const shiftedResult = shiftCoords(coords, floatingRect, resolvedViewport, padding);
        coords = { x: shiftedResult.x, y: shiftedResult.y };
        shifted = shiftedResult.shifted;
    }

    return {
        x: coords.x,
        y: coords.y,
        placement: formatPlacement(side, alignment),
        middlewareData: {
            flipped,
            shifted,
        },
    };
}

export function createDefaultPositioningAdapter(): PositioningAdapter {
    return {
        computePosition,
    };
}
