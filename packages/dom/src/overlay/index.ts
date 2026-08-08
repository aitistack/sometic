import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { Disposable } from "@sometic/core/disposable";
import { createDismissableLayer } from "@sometic/accessibility/dismissable";
import { createFocusTrap } from "@sometic/accessibility/focus";
import { createPortalRoot } from "@sometic/accessibility/portal";
import { lockBodyScroll } from "@sometic/accessibility/scroll-lock";

export type CreateOverlayControllerOptions = {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
    portalId?: string;
    getContent: () => HTMLElement | null | undefined;
    getTrigger?: () => HTMLElement | null | undefined;
};

export type OverlayController = Disposable & {
    readonly open: ControllableState<boolean>;
    readonly modal: boolean;
    setOpen(open: boolean): void;
    openOverlay(): void;
    closeOverlay(): void;
    sync(): void;
    getPortalElement(): HTMLElement | undefined;
};

export function createOverlayController(
    options: CreateOverlayControllerOptions,
): OverlayController {
    const modal = options.modal !== false;
    const portal = createPortalRoot({
        ...(options.portalId === undefined ? {} : { id: options.portalId }),
    });

    let trap: ReturnType<typeof createFocusTrap> | undefined;
    let dismissable: ReturnType<typeof createDismissableLayer> | undefined;
    let scrollLock: Disposable | undefined;
    let active = false;
    let disposedFlag = false;
    const openBox: { current: ControllableState<boolean> | null } = { current: null };

    const deactivateChrome = (): void => {
        trap?.deactivate();
        trap?.dispose();
        trap = undefined;
        dismissable?.deactivate();
        dismissable?.dispose();
        dismissable = undefined;
        scrollLock?.dispose();
        scrollLock = undefined;
        active = false;
    };

    const activateChrome = (): void => {
        if (active) {
            return;
        }
        const content = options.getContent();
        if (!content) {
            return;
        }
        active = true;
        if (modal) {
            scrollLock = lockBodyScroll();
            trap = createFocusTrap({
                container: () => options.getContent(),
                returnFocus: true,
                initialFocus: "first",
            });
            trap.activate();
        }
        dismissable = createDismissableLayer({
            getElement: () => options.getContent(),
            escapeDeactivates: true,
            outsidePress: !modal,
            onDismiss: () => {
                openBox.current?.set(false);
            },
        });
        dismissable.activate();
    };

    const syncFromOpen = (isOpen: boolean): void => {
        if (isOpen) {
            portal.ensure();
            activateChrome();
        } else {
            deactivateChrome();
        }
    };

    const openRef = createControllableState({
        defaultValue: options.defaultOpen ?? false,
        ...(options.open === undefined ? {} : { value: options.open }),
        onChange: (next) => {
            syncFromOpen(next);
            options.onOpenChange?.(next);
        },
    });
    openBox.current = openRef;

    if (openRef.get()) {
        syncFromOpen(true);
    }

    return {
        open: openRef,
        modal,
        setOpen(next) {
            openRef.set(next);
        },
        openOverlay() {
            openRef.set(true);
        },
        closeOverlay() {
            openRef.set(false);
        },
        sync() {
            syncFromOpen(openRef.get());
        },
        getPortalElement() {
            return portal.getElement() ?? portal.ensure();
        },
        get disposed() {
            return disposedFlag;
        },
        dispose() {
            if (disposedFlag) {
                return;
            }
            disposedFlag = true;
            deactivateChrome();
            portal.dispose();
        },
    };
}
