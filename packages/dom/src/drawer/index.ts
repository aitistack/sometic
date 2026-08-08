import type { ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";
import { createOverlayController, type OverlayController } from "../overlay/index.js";

export type DrawerSide = "left" | "right" | "top" | "bottom";

export type ResolveDrawerOptions = StyleableProps<"root"> & {
    open?: boolean;
    side?: DrawerSide;
    disabled?: boolean;
    titleId?: string;
    descriptionId?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type DrawerViewModel = {
    open: boolean;
    side: DrawerSide;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveDrawer(options: ResolveDrawerOptions = {}): DrawerViewModel {
    const open = options.open === true;
    const side = options.side ?? "right";
    const disabled = options.disabled === true;
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
        side,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "dialog",
            "data-slot": "root",
            "data-state": open ? "open" : "closed",
            "data-side": side,
            ...(open ? { "aria-modal": "true" } : {}),
            ...(options.titleId ? { "aria-labelledby": options.titleId } : {}),
            ...(options.descriptionId ? { "aria-describedby": options.descriptionId } : {}),
            ...(disabled ? { "aria-disabled": "true" } : {}),
        },
    };
}

export type CreateDrawerControllerOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: DrawerSide;
    portalId?: string;
    getContent: () => HTMLElement | null | undefined;
    getTrigger?: () => HTMLElement | null | undefined;
};

export type DrawerController = Disposable & {
    readonly open: ControllableState<boolean>;
    readonly overlay: OverlayController;
    side: DrawerSide;
    resolve(options?: Omit<ResolveDrawerOptions, "open">): DrawerViewModel;
    setOpen(open: boolean): void;
};

export function createDrawerController(options: CreateDrawerControllerOptions): DrawerController {
    let side = options.side ?? "right";
    const overlay = createOverlayController({
        modal: true,
        getContent: options.getContent,
        ...(options.getTrigger === undefined ? {} : { getTrigger: options.getTrigger }),
        ...(options.portalId === undefined ? {} : { portalId: options.portalId }),
        ...(options.open === undefined ? {} : { open: options.open }),
        ...(options.defaultOpen === undefined ? {} : { defaultOpen: options.defaultOpen }),
        ...(options.onOpenChange === undefined ? {} : { onOpenChange: options.onOpenChange }),
    });
    let disposedFlag = false;
    return {
        open: overlay.open,
        overlay,
        get side() {
            return side;
        },
        set side(next) {
            side = next;
        },
        resolve(styleOptions = {}) {
            return resolveDrawer({
                ...styleOptions,
                open: overlay.open.get(),
                side,
            });
        },
        setOpen(next) {
            overlay.setOpen(next);
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
