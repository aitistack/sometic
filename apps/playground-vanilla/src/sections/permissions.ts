import {
    createPermissionMatrixController,
    resolvePermissionMatrix,
    resolvePermissionMatrixCell,
} from "@sometic/dom/permission-matrix";

export function mountPermissionsSection(root: HTMLElement): () => void {
    const host = root.querySelector("[data-permission-matrix]");
    if (!(host instanceof HTMLElement)) {
        return () => {};
    }

    const matrix = createPermissionMatrixController({
        resources: [
            { id: "posts", label: "Posts" },
            { id: "users", label: "Users" },
            { id: "billing", label: "Billing" },
        ],
        actions: [
            { id: "read", label: "Read" },
            { id: "write", label: "Write" },
            { id: "admin", label: "Admin" },
        ],
        can: (resourceId, actionId) => {
            if (actionId === "admin") {
                return false;
            }
            if (resourceId === "billing" && actionId === "write") {
                return false;
            }
            return actionId === "read" || resourceId === "posts";
        },
        onValueChange: () => {
            render();
        },
    });

    const render = (): void => {
        const resources = matrix.getResources();
        const actions = matrix.getActions();
        const rootView = resolvePermissionMatrix({
            resourceCount: resources.length,
            actionCount: actions.length,
        });
        host.replaceChildren();
        for (const [key, value] of Object.entries(rootView.attributes)) {
            host.setAttribute(key, value);
        }

        const table = document.createElement("table");
        table.className = "pg-permission-table";
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        const corner = document.createElement("th");
        corner.scope = "col";
        corner.textContent = "Resource";
        headRow.append(corner);
        for (const action of actions) {
            const th = document.createElement("th");
            th.scope = "col";
            th.textContent = action.label ?? action.id;
            headRow.append(th);
        }
        thead.append(headRow);

        const tbody = document.createElement("tbody");
        for (const resource of resources) {
            const row = document.createElement("tr");
            const label = document.createElement("th");
            label.scope = "row";
            label.textContent = resource.label ?? resource.id;
            row.append(label);
            for (const action of actions) {
                const cell = document.createElement("td");
                const state = matrix.getCellState(resource.id, action.id);
                const button = document.createElement("button");
                button.type = "button";
                button.className = "pg-btn";
                const view = resolvePermissionMatrixCell({
                    resourceId: resource.id,
                    actionId: action.id,
                    state,
                });
                for (const [key, value] of Object.entries(view.attributes)) {
                    button.setAttribute(key, value);
                }
                button.textContent = state;
                button.addEventListener("click", () => {
                    matrix.toggleCell(resource.id, action.id);
                });
                cell.append(button);
                row.append(cell);
            }
            tbody.append(row);
        }

        table.append(thead, tbody);
        host.append(table);
    };

    render();
    return () => matrix.dispose();
}
