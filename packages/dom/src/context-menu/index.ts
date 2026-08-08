import type { ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";
import { createOverlayController, type OverlayController } from "../overlay/index.js";

export type ResolveContextMenuOptions = StyleableProps<"root"> & {
    open?: boolean;
    x?: number;
    y?: number;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type ContextMenuViewModel = {
    open: boolean;
    x: number;
    y: number;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveContextMenu(options: ResolveContextMenuOptions = {}): ContextMenuViewModel {
    const open = options.open === true;
    const x = options.x ?? 0;
    const y = options.y ?? 0;
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
    return {
        open,
        x,
        y,
        className: styled.className,
        style: {
            ...styled.style,
            position: "fixed",
            left: `${String(x)}px`,
            top: `${String(y)}px`,
        },
        attributes: {
            role: "menu",
            "data-slot": "root",
            "data-state": open ? "open" : "closed",
        },
    };
}

export type CreateContextMenuControllerOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    portalId?: string;
    getContent: () => HTMLElement | null | undefined;
};

export type ContextMenuController = Disposable & {
    readonly open: ControllableState<boolean>;
    readonly overlay: OverlayController;
    x: number;
    y: number;
    resolve(options?: Omit<ResolveContextMenuOptions, "open" | "x" | "y">): ContextMenuViewModel;
    setOpen(open: boolean): void;
    openAt(x: number, y: number): void;
};

export function createContextMenuController(
    options: CreateContextMenuControllerOptions,
): ContextMenuController {
    let x = 0;
    let y = 0;
    let disposedFlag = false;
    const overlay = createOverlayController({
        modal: false,
        getContent: options.getContent,
        ...(options.portalId === undefined ? {} : { portalId: options.portalId }),
        ...(options.open === undefined ? {} : { open: options.open }),
        ...(options.defaultOpen === undefined ? {} : { defaultOpen: options.defaultOpen }),
        ...(options.onOpenChange === undefined ? {} : { onOpenChange: options.onOpenChange }),
    });
    return {
        open: overlay.open,
        overlay,
        get x() {
            return x;
        },
        get y() {
            return y;
        },
        resolve(styleOptions = {}) {
            return resolveContextMenu({
                ...styleOptions,
                open: overlay.open.get(),
                x,
                y,
            });
        },
        setOpen(next) {
            overlay.setOpen(next);
        },
        openAt(nextX, nextY) {
            x = nextX;
            y = nextY;
            overlay.setOpen(true);
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
