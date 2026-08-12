import { createSchemaForm } from "@sometic/forms/schema-form";

export function mountSchemaFormSection(root: HTMLElement): () => void {
    const formHost = root.querySelector("[data-schema-form]");
    const out = root.querySelector("[data-schema-form-out]");
    if (!(formHost instanceof HTMLElement)) {
        return () => {};
    }

    const form = createSchemaForm({
        fields: [
            { name: "title", type: "text", defaultValue: "" },
            { name: "count", type: "number", defaultValue: 1 },
            { name: "published", type: "checkbox", defaultValue: false },
        ],
    });

    const sync = (): void => {
        if (out instanceof HTMLElement) {
            out.textContent = JSON.stringify(form.getValues(), null, 2);
        }
    };

    formHost.replaceChildren();
    for (const field of form.getFields()) {
        const label = document.createElement("label");
        label.className = "pg-control";
        const span = document.createElement("span");
        span.textContent = field.label ?? field.name;
        const input = document.createElement("input");
        input.className = "pg-input";
        const registration = form.registerField(field.name);
        if (field.type === "checkbox") {
            input.type = "checkbox";
            input.checked = Boolean(registration.value);
            input.addEventListener("change", () => {
                registration.onChange(input.checked);
                sync();
            });
        } else if (field.type === "number") {
            input.type = "number";
            input.value = String(registration.value ?? "");
            input.addEventListener("input", () => {
                registration.onChange(Number(input.value));
                sync();
            });
        } else {
            input.type = "text";
            input.value = String(registration.value ?? "");
            input.addEventListener("input", () => {
                registration.onChange(input.value);
                sync();
            });
        }
        label.append(span, input);
        formHost.append(label);
    }

    sync();
    return () => form.dispose();
}
