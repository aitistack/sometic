import {
    createDismissableLayer,
    createFocusTrap,
    createLiveAnnouncer,
    lockBodyScroll,
} from "@sometic/accessibility";

export function mountA11ySection(root: HTMLElement): () => void {
    const dialog = root.querySelector<HTMLElement>("[data-a11y-dialog]");
    const dialogCard = root.querySelector<HTMLElement>("[data-a11y-dialog-card]");
    const openBtn = root.querySelector<HTMLButtonElement>("[data-a11y-open]");
    const closeBtn = root.querySelector<HTMLButtonElement>("[data-a11y-close]");
    const nestBtn = root.querySelector<HTMLButtonElement>("[data-a11y-nest]");
    const lockBtn = root.querySelector<HTMLButtonElement>("[data-a11y-lock]");
    const announceBtn = root.querySelector<HTMLButtonElement>("[data-a11y-announce]");
    const status = root.querySelector<HTMLElement>("[data-a11y-status]");

    if (!dialog || !dialogCard || !openBtn || !closeBtn) {
        return () => undefined;
    }

    const announcer = createLiveAnnouncer();
    let scrollLock: ReturnType<typeof lockBodyScroll> | undefined;
    let nestedLayer: ReturnType<typeof createDismissableLayer> | undefined;

    const trap = createFocusTrap({
        container: dialogCard,
        initialFocus: "first",
        returnFocus: true,
    });

    const layer = createDismissableLayer({
        getElement: () => dialogCard,
        onDismiss: () => {
            closeDialog();
        },
    });

    const setStatus = (text: string): void => {
        if (status) {
            status.textContent = text;
        }
    };

    const openDialog = (): void => {
        dialog.dataset.open = "true";
        layer.activate();
        trap.activate();
        setStatus("Dialog open · focus trapped · Escape/outside dismisses");
    };

    const closeDialog = (): void => {
        nestedLayer?.dispose();
        nestedLayer = undefined;
        trap.deactivate();
        layer.deactivate();
        dialog.dataset.open = "false";
        setStatus("Dialog closed · focus restored");
    };

    const onOpen = (): void => {
        openDialog();
    };
    const onClose = (): void => {
        closeDialog();
    };
    const onNest = (): void => {
        if (nestedLayer?.active) {
            nestedLayer.dispose();
            nestedLayer = undefined;
            setStatus("Nested dismissable layer removed");
            return;
        }
        const nested = document.createElement("div");
        nested.textContent = "Nested layer (Escape hits this first)";
        nested.style.cssText =
            "margin-top:0.75rem;padding:0.75rem;border:1px solid rgba(61,214,198,0.4);border-radius:8px;";
        dialogCard.append(nested);
        nestedLayer = createDismissableLayer({
            getElement: () => nested,
            onDismiss: () => {
                nested.remove();
                nestedLayer?.dispose();
                nestedLayer = undefined;
                setStatus("Nested layer dismissed · outer dialog still open");
            },
        });
        nestedLayer.activate();
        setStatus("Nested layer active · Escape dismisses nested first");
    };
    const onLock = (): void => {
        if (scrollLock && !scrollLock.disposed) {
            scrollLock.dispose();
            scrollLock = undefined;
            lockBtn && (lockBtn.textContent = "Lock body scroll");
            setStatus("Scroll unlocked");
            return;
        }
        scrollLock = lockBodyScroll();
        if (lockBtn) {
            lockBtn.textContent = "Unlock body scroll";
        }
        setStatus("Body scroll locked (try the box below + page)");
    };
    const onAnnounce = (): void => {
        const message = `Saved at ${new Date().toLocaleTimeString()}`;
        announcer.announce(message);
        setStatus(`Announced: ${message}`);
    };

    openBtn.addEventListener("click", onOpen);
    closeBtn.addEventListener("click", onClose);
    nestBtn?.addEventListener("click", onNest);
    lockBtn?.addEventListener("click", onLock);
    announceBtn?.addEventListener("click", onAnnounce);

    setStatus("Ready · open dialog to try focus trap + dismissable");

    return () => {
        closeDialog();
        scrollLock?.dispose();
        announcer.dispose();
        openBtn.removeEventListener("click", onOpen);
        closeBtn.removeEventListener("click", onClose);
        nestBtn?.removeEventListener("click", onNest);
        lockBtn?.removeEventListener("click", onLock);
        announceBtn?.removeEventListener("click", onAnnounce);
    };
}
