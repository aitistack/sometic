import {
    createQueryBuilderController,
    defaultOperatorsForFieldType,
    toDataTableFilters,
} from "@sometic/query-builder";

export function mountQueryBuilderSection(root: HTMLElement): () => void {
    const host = root.querySelector("[data-query-builder]");
    const out = root.querySelector("[data-query-builder-out]");
    if (!(host instanceof HTMLElement)) {
        return () => {};
    }

    const fields = [
        {
            id: "name",
            label: "Name",
            type: "string" as const,
            operators: defaultOperatorsForFieldType("string"),
        },
        {
            id: "role",
            label: "Role",
            type: "string" as const,
            operators: defaultOperatorsForFieldType("string"),
        },
    ];
    const builder = createQueryBuilderController({ fields });
    builder.addRule(undefined, { field: "name", operator: "contains", value: "Person" });

    const unsubscribe = builder.subscribe(() => {
        render();
    });

    const render = (): void => {
        host.replaceChildren();
        const value = builder.getValue();
        for (const child of value.children) {
            if (child.kind !== "rule") {
                continue;
            }
            const row = document.createElement("div");
            row.className = "pg-row";
            const input = document.createElement("input");
            input.className = "pg-input";
            input.value = String(child.value ?? "");
            input.addEventListener("input", () => {
                builder.updateRule(child.id, { value: input.value });
            });
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "pg-btn";
            remove.textContent = "Remove";
            remove.addEventListener("click", () => {
                builder.removeRule(child.id);
            });
            row.append(document.createTextNode(`${child.field} ${child.operator} `), input, remove);
            host.append(row);
        }
        const add = document.createElement("button");
        add.type = "button";
        add.className = "pg-btn";
        add.textContent = "Add rule";
        add.addEventListener("click", () => {
            builder.addRule(undefined, {
                field: "role",
                operator: "equals",
                value: "Admin",
            });
        });
        host.append(add);
        if (out instanceof HTMLElement) {
            out.textContent = JSON.stringify(toDataTableFilters(builder.getValue()), null, 2);
        }
    };

    render();
    return () => {
        unsubscribe();
        builder.dispose();
    };
}
