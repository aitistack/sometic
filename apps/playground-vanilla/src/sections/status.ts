import {
    bindOfflineRecovery,
    resolveConflictStatus,
    resolveStatus,
    resolveStatusAction,
} from "@sometic/dom/status";

function applyAttrs(el: HTMLElement, attributes: Record<string, string>): void {
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
}

export function mountStatusSection(root: HTMLElement): () => void {
    const gallery = root.querySelector("[data-status-gallery]");
    if (!(gallery instanceof HTMLElement)) {
        return () => {};
    }

    const kinds = ["empty", "error", "offline", "conflict"] as const;
    const disposers: Array<() => void> = [];

    for (const kind of kinds) {
        const card = document.createElement("div");
        card.className = "pg-status-card";
        const view =
            kind === "conflict"
                ? resolveConflictStatus({ kind: "conflict", hasAction: true })
                : resolveStatus({ kind, hasAction: true });
        applyAttrs(card, view.attributes);
        card.className = `pg-status-card ${view.className}`.trim();

        const title = document.createElement("h3");
        title.textContent = view.title ?? kind;
        const description = document.createElement("p");
        description.textContent =
            view.description ??
            (kind === "conflict"
                ? `${"localLabel" in view ? view.localLabel : "Local"} vs ${"remoteLabel" in view ? view.remoteLabel : "Remote"}`
                : `Demo ${kind} surface`);
        const action = document.createElement("button");
        const actionView = resolveStatusAction();
        applyAttrs(action, actionView.attributes);
        action.className = `pg-btn ${actionView.className}`.trim();
        action.textContent = kind === "offline" ? "Retry when online" : "Primary action";
        card.append(title, description, action);
        gallery.append(card);

        if (kind === "offline") {
            disposers.push(
                bindOfflineRecovery({
                    onOnline: () => {
                        description.textContent = "Back online (recovery fired)";
                    },
                }),
            );
        }
    }

    return () => {
        for (const dispose of disposers) {
            dispose();
        }
        gallery.replaceChildren();
    };
}
