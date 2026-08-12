import {
    createNotificationsController,
    resolveNotificationCenter,
    resolveNotificationItem,
} from "@sometic/dom/notification-center";

export function mountNotificationsSection(root: HTMLElement): () => void {
    const host = root.querySelector("[data-notifications]");
    const add = root.querySelector("[data-notifications-add]");
    if (!(host instanceof HTMLElement)) {
        return () => {};
    }
    const controller = createNotificationsController();
    const render = (): void => {
        const center = resolveNotificationCenter({ open: true });
        host.replaceChildren();
        for (const [key, value] of Object.entries(center.attributes)) {
            host.setAttribute(key, value);
        }
        for (const item of controller.getItems()) {
            const node = document.createElement("div");
            const view = resolveNotificationItem({
                id: item.id,
                read: item.read,
                priority: item.priority,
                title: item.title,
            });
            for (const [key, value] of Object.entries(view.attributes)) {
                node.setAttribute(key, value);
            }
            node.textContent = `${item.title}${item.read ? " (read)" : ""}`;
            node.addEventListener("click", () => {
                controller.markRead(item.id);
                render();
            });
            const dismiss = document.createElement("button");
            dismiss.type = "button";
            dismiss.className = "pg-btn";
            dismiss.textContent = "Dismiss";
            dismiss.addEventListener("click", (event) => {
                event.stopPropagation();
                controller.dismiss(item.id);
                render();
            });
            node.append(dismiss);
            host.append(node);
        }
    };
    if (add instanceof HTMLButtonElement) {
        add.addEventListener("click", () => {
            controller.push({
                title: `Notification ${controller.getItems().length + 1}`,
                source: "playground",
            });
            render();
        });
    }
    render();
    return () => controller.dispose();
}
