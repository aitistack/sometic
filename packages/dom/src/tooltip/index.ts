import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import { computePosition, type Placement, type ComputePositionResult } from "@sometic/positioning";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type { Placement };

export type ResolveTooltipOptions = StyleableProps<"root"> & {
    open?: boolean;
    placement?: Placement;
    x?: number;
    y?: number;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type TooltipViewModel = {
    open: boolean;
    placement: Placement;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveTooltip(options: ResolveTooltipOptions = {}): TooltipViewModel {
    const open = options.open === true;
    const placement = options.placement ?? "top";
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    const positionStyle: Record<string, string> = {
        ...styled.style,
        position: "absolute",
    };
    if (options.x !== undefined) {
        positionStyle.left = `${String(options.x)}px`;
    }
    if (options.y !== undefined) {
        positionStyle.top = `${String(options.y)}px`;
    }
    return {
        open,
        placement,
        className: styled.className,
        style: positionStyle,
        attributes: {
            role: "tooltip",
            "data-slot": "root",
            "data-state": open ? "open" : "closed",
            "data-placement": placement,
        },
    };
}

export type CreateTooltipControllerOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    offset?: number;
    openDelayMs?: number;
    closeDelayMs?: number;
};

export type TooltipController = Disposable & {
    readonly open: ControllableState<boolean>;
    placement: Placement;
    lastPosition: ComputePositionResult | undefined;
    resolve(
        options?: Omit<ResolveTooltipOptions, "open" | "x" | "y" | "placement">,
    ): TooltipViewModel;
    setOpen(open: boolean): void;
    scheduleOpen(): void;
    scheduleClose(): void;
    cancelTimers(): void;
    updatePosition(reference: Element, floating: Element): ComputePositionResult;
};

export function createTooltipController(
    options: CreateTooltipControllerOptions = {},
): TooltipController {
    let placement = options.placement ?? "top";
    let lastPosition: ComputePositionResult | undefined;
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let closeTimer: ReturnType<typeof setTimeout> | undefined;
    const openDelayMs = options.openDelayMs ?? 400;
    const closeDelayMs = options.closeDelayMs ?? 100;

    let disposedFlag = false;
    const open = createControllableState({
        defaultValue: options.defaultOpen ?? false,
        ...(options.open === undefined ? {} : { value: options.open }),
        ...(options.onOpenChange === undefined ? {} : { onChange: options.onOpenChange }),
    });

    const cancelTimers = (): void => {
        if (openTimer !== undefined) {
            clearTimeout(openTimer);
            openTimer = undefined;
        }
        if (closeTimer !== undefined) {
            clearTimeout(closeTimer);
            closeTimer = undefined;
        }
    };

    return {
        open,
        get placement() {
            return placement;
        },
        get lastPosition() {
            return lastPosition;
        },
        resolve(styleOptions = {}) {
            return resolveTooltip({
                ...styleOptions,
                open: open.get(),
                placement,
                ...(lastPosition === undefined ? {} : { x: lastPosition.x, y: lastPosition.y }),
            });
        },
        setOpen(next) {
            cancelTimers();
            open.set(next);
        },
        scheduleOpen() {
            cancelTimers();
            openTimer = setTimeout(() => {
                openTimer = undefined;
                open.set(true);
            }, openDelayMs);
        },
        scheduleClose() {
            cancelTimers();
            closeTimer = setTimeout(() => {
                closeTimer = undefined;
                open.set(false);
            }, closeDelayMs);
        },
        cancelTimers,
        updatePosition(reference, floating) {
            lastPosition = computePosition(reference, floating, {
                placement,
                ...(options.offset === undefined ? {} : { offset: options.offset }),
            });
            placement = lastPosition.placement;
            return lastPosition;
        },
        get disposed() {
            return disposedFlag;
        },
        dispose() {
            if (disposedFlag) {
                return;
            }
            disposedFlag = true;
            cancelTimers();
        },
    };
}
