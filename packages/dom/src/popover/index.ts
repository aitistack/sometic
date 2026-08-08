import type { ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import { computePosition, type Placement, type ComputePositionResult } from "@sometic/positioning";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";
import { createOverlayController, type OverlayController } from "../overlay/index.js";

export type { Placement };

export type ResolvePopoverOptions = StyleableProps<"root"> & {
    open?: boolean;
    placement?: Placement;
    x?: number;
    y?: number;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type PopoverViewModel = {
    open: boolean;
    placement: Placement;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolvePopover(options: ResolvePopoverOptions = {}): PopoverViewModel {
    const open = options.open === true;
    const placement = options.placement ?? "bottom";
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
            role: "dialog",
            "data-slot": "root",
            "data-state": open ? "open" : "closed",
            "data-placement": placement,
        },
    };
}

export type CreatePopoverControllerOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: Placement;
    offset?: number;
    portalId?: string;
    getContent: () => HTMLElement | null | undefined;
    getTrigger?: () => HTMLElement | null | undefined;
};

export type PopoverController = Disposable & {
    readonly open: ControllableState<boolean>;
    readonly overlay: OverlayController;
    placement: Placement;
    lastPosition: ComputePositionResult | undefined;
    resolve(
        options?: Omit<ResolvePopoverOptions, "open" | "x" | "y" | "placement">,
    ): PopoverViewModel;
    setOpen(open: boolean): void;
    updatePosition(reference: Element, floating: Element): ComputePositionResult;
};

export function createPopoverController(
    options: CreatePopoverControllerOptions,
): PopoverController {
    let placement = options.placement ?? "bottom";
    let lastPosition: ComputePositionResult | undefined;
    let disposedFlag = false;
    const overlay = createOverlayController({
        modal: false,
        getContent: options.getContent,
        ...(options.getTrigger === undefined ? {} : { getTrigger: options.getTrigger }),
        ...(options.portalId === undefined ? {} : { portalId: options.portalId }),
        ...(options.open === undefined ? {} : { open: options.open }),
        ...(options.defaultOpen === undefined ? {} : { defaultOpen: options.defaultOpen }),
        ...(options.onOpenChange === undefined ? {} : { onOpenChange: options.onOpenChange }),
    });

    return {
        open: overlay.open,
        overlay,
        get placement() {
            return placement;
        },
        get lastPosition() {
            return lastPosition;
        },
        resolve(styleOptions = {}) {
            return resolvePopover({
                ...styleOptions,
                open: overlay.open.get(),
                placement,
                ...(lastPosition === undefined ? {} : { x: lastPosition.x, y: lastPosition.y }),
            });
        },
        setOpen(next) {
            overlay.setOpen(next);
        },
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
            overlay.dispose();
        },
    };
}
