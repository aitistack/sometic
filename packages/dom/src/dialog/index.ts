import type { ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";
import { createOverlayController, type OverlayController } from "../overlay/index.js";

export type ResolveDialogOptions = StyleableProps<"root"> & {
    open?: boolean;
    disabled?: boolean;
    titleId?: string;
    descriptionId?: string;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type DialogViewModel = {
    open: boolean;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveDialog(options: ResolveDialogOptions = {}): DialogViewModel {
    const open = options.open === true;
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
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "dialog",
            "data-slot": "root",
            "data-state": open ? "open" : "closed",
            ...(open ? { "aria-modal": "true" } : {}),
            ...(options.titleId ? { "aria-labelledby": options.titleId } : {}),
            ...(options.descriptionId ? { "aria-describedby": options.descriptionId } : {}),
            ...(disabled ? { "aria-disabled": "true" } : {}),
        },
    };
}

export type CreateDialogControllerOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    portalId?: string;
    getContent: () => HTMLElement | null | undefined;
    getTrigger?: () => HTMLElement | null | undefined;
};

export type DialogController = Disposable & {
    readonly open: ControllableState<boolean>;
    readonly overlay: OverlayController;
    resolve(options?: Omit<ResolveDialogOptions, "open">): DialogViewModel;
    setOpen(open: boolean): void;
};

export function createDialogController(options: CreateDialogControllerOptions): DialogController {
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
        resolve(styleOptions = {}) {
            return resolveDialog({
                ...styleOptions,
                open: overlay.open.get(),
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
