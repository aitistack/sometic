import { createActivityController } from "@sometic/activity";

export function mountActivitySection(root: HTMLElement): () => void {
    const list = root.querySelector("[data-activity-list]");
    const add = root.querySelector("[data-activity-add]");
    if (!(list instanceof HTMLElement)) {
        return () => {};
    }
    const activity = createActivityController({ pageSize: 10 });
    const render = (): void => {
        list.replaceChildren();
        for (const entry of activity.getEntries()) {
            const item = document.createElement("li");
            item.textContent = `${entry.type}: ${entry.message}`;
            list.append(item);
        }
    };
    if (add instanceof HTMLButtonElement) {
        add.addEventListener("click", () => {
            activity.append({
                type: "update",
                message: `Event ${activity.getEntries().length + 1}`,
                actorId: "demo",
            });
            render();
        });
    }
    render();
    return () => activity.dispose();
}
