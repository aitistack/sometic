import { createDrawerController } from "@sometic/dom/drawer";
import { createMenuController, resolveMenuItem } from "@sometic/dom/menu";
import "@sometic/elements/overlay";

function applyAttributes(el: HTMLElement, attributes: Record<string, string>): void {
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
}

function applyStyles(el: HTMLElement, style: Record<string, string>): void {
    for (const [key, value] of Object.entries(style)) {
        el.style.setProperty(key, value);
    }
}

export function mountOverlaySection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-overlay-status]");
    const log = (message: string): void => {
        if (status) {
            status.textContent = message;
        }
    };

    const openDialog = root.querySelector<HTMLButtonElement>("[data-open-dialog]");
    const dialog = root.querySelector<HTMLElement>("sometic-dialog");
    const closeDialog = root.querySelector<HTMLButtonElement>("[data-close-dialog]");
    const onOpenDialog = (): void => {
        dialog?.setAttribute("open", "");
        log("dialog open");
    };
    const onCloseDialog = (): void => {
        dialog?.removeAttribute("open");
        log("dialog closed");
    };
    openDialog?.addEventListener("click", onOpenDialog);
    closeDialog?.addEventListener("click", onCloseDialog);

    const toastRegion = root.querySelector("sometic-toast-region") as
        | (HTMLElement & {
              push: (input: { title: string; description?: string }) => unknown;
          })
        | null;
    const pushToast = root.querySelector<HTMLButtonElement>("[data-push-toast]");
    const onPushToast = (): void => {
        toastRegion?.push({ title: "Saved", description: "Overlay toast queue" });
        log("toast pushed");
    };
    pushToast?.addEventListener("click", onPushToast);

    const alert = root.querySelector("sometic-alert");
    if (alert && !alert.textContent?.trim()) {
        alert.textContent = "Heads up — alert status surface.";
    }

    const drawerPanel = root.querySelector<HTMLElement>("[data-drawer-panel]");
    const openDrawer = root.querySelector<HTMLButtonElement>("[data-open-drawer]");
    const closeDrawer = root.querySelector<HTMLButtonElement>("[data-close-drawer]");

    const syncDrawer = (open: boolean): void => {
        if (!drawerPanel) {
            return;
        }
        const view = drawer.resolve({ titleId: "pg-drawer-title" });
        applyAttributes(drawerPanel, view.attributes);
        drawerPanel.dataset.side = view.side;
        drawerPanel.hidden = !open;
        log(open ? `drawer open side=${view.side}` : "drawer closed");
    };

    const drawer = createDrawerController({
        side: "right",
        defaultOpen: false,
        getContent: () => drawerPanel,
        getTrigger: () => openDrawer,
        onOpenChange: syncDrawer,
    });

    const onOpenDrawer = (): void => {
        drawer.setOpen(true);
    };
    const onCloseDrawer = (): void => {
        drawer.setOpen(false);
    };
    openDrawer?.addEventListener("click", onOpenDrawer);
    closeDrawer?.addEventListener("click", onCloseDrawer);
    syncDrawer(false);

    const menuPanel = root.querySelector<HTMLElement>("[data-menu-panel]");
    const menuTrigger = root.querySelector<HTMLButtonElement>("[data-menu-trigger]");
    const menuItems = [...root.querySelectorAll<HTMLElement>("[data-menu-item]")];

    const syncMenu = (open: boolean): void => {
        if (!menuPanel) {
            return;
        }
        if (open && menuTrigger) {
            menu.updatePosition(menuTrigger, menuPanel);
        }
        const view = menu.resolve();
        applyAttributes(menuPanel, view.attributes);
        applyStyles(menuPanel, { ...view.style, position: "fixed" });
        menuPanel.hidden = !open;
        for (const item of menuItems) {
            const itemView = resolveMenuItem({
                disabled: item.hasAttribute("data-disabled"),
            });
            applyAttributes(item, itemView.attributes);
        }
        log(open ? "menu open" : "menu closed");
    };

    const menu = createMenuController({
        defaultOpen: false,
        placement: "bottom-start",
        offset: 8,
        getContent: () => menuPanel,
        getTrigger: () => menuTrigger,
        onOpenChange: syncMenu,
    });

    const onMenuTrigger = (): void => {
        menu.setOpen(!menu.open.get());
    };
    const onMenuItem = (event: Event): void => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLElement) || target.hasAttribute("data-disabled")) {
            return;
        }
        log(`menu item=${target.textContent?.trim() ?? ""}`);
        menu.setOpen(false);
    };
    menuTrigger?.addEventListener("click", onMenuTrigger);
    for (const item of menuItems) {
        item.addEventListener("click", onMenuItem);
    }
    syncMenu(false);

    log("Overlay ready · dialog / toast / alert / drawer / menu");

    return () => {
        openDialog?.removeEventListener("click", onOpenDialog);
        closeDialog?.removeEventListener("click", onCloseDialog);
        pushToast?.removeEventListener("click", onPushToast);
        openDrawer?.removeEventListener("click", onOpenDrawer);
        closeDrawer?.removeEventListener("click", onCloseDrawer);
        menuTrigger?.removeEventListener("click", onMenuTrigger);
        for (const item of menuItems) {
            item.removeEventListener("click", onMenuItem);
        }
        drawer.dispose();
        menu.dispose();
    };
}
