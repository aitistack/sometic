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
        ],
        actions: [
            { id: "read", label: "Read" },
            { id: "write", label: "Write" },
        ],
        can: (resourceId, actionId) =>
            resourceId === "posts" && actionId === "read"
                ? true
                : resourceId === "users" && actionId === "read"
                  ? true
                  : false,
        onValueChange: () => {
            render();
        },
    });

    const render = (): void => {
        const rootView = resolvePermissionMatrix({
            resourceCount: matrix.getResources().length,
            actionCount: matrix.getActions().length,
        });
        host.replaceChildren();
        for (const [key, value] of Object.entries(rootView.attributes)) {
            host.setAttribute(key, value);
        }
        for (const resource of matrix.getResources()) {
            const row = document.createElement("div");
            row.className = "pg-row";
            row.append(document.createTextNode(`${resource.label ?? resource.id}: `));
            for (const action of matrix.getActions()) {
                const state = matrix.getCellState(resource.id, action.id);
                const button = document.createElement("button");
                button.type = "button";
                button.className = "pg-btn";
                const cell = resolvePermissionMatrixCell({
                    resourceId: resource.id,
                    actionId: action.id,
                    state,
                });
                for (const [key, value] of Object.entries(cell.attributes)) {
                    button.setAttribute(key, value);
                }
                button.textContent = `${action.id}:${state}`;
                button.addEventListener("click", () => {
                    matrix.toggleCell(resource.id, action.id);
                });
                row.append(button);
            }
            host.append(row);
        }
    };

    render();
    return () => matrix.dispose();
}
