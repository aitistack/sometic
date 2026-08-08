import { resolveCheckbox } from "@sometic/dom/checkbox";
import { resolveRadio } from "@sometic/dom/radio";
import { resolveSelect, type SelectOption } from "@sometic/dom/select";
import { resolveSwitch } from "@sometic/dom/switch";
import { boolAttr } from "../shared/attrs.js";
import { dispatchSometicEvent, type SometicValueChangeDetail } from "../shared/events.js";
import { canUseCustomElements, defineElement } from "../shared/register.js";
import { getElementMountRoot } from "../shared/shadow.js";

export type SometicCheckedChangeDetail = {
    checked: boolean;
};

class SometicCheckbox extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["checked", "indeterminate", "disabled", "name", "value", "shadow"];
    }

    #input = document.createElement("input");
    #mounted = false;

    constructor() {
        super();
        this.#input.addEventListener("change", () => {
            if (this.#input.checked) {
                this.setAttribute("checked", "");
            } else {
                this.removeAttribute("checked");
            }
            this.removeAttribute("indeterminate");
            dispatchSometicEvent<SometicCheckedChangeDetail>(this, "checked-change", {
                checked: this.#input.checked,
            });
            this.#render();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input);
            this.#mounted = true;
        }
        this.#render();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#render();
        }
    }

    #render(): void {
        const view = resolveCheckbox({
            checked: boolAttr(this.getAttribute("checked")),
            indeterminate: boolAttr(this.getAttribute("indeterminate")),
            disabled: boolAttr(this.getAttribute("disabled")),
            ...(this.getAttribute("name") ? { name: this.getAttribute("name")! } : {}),
            ...(this.getAttribute("value") ? { value: this.getAttribute("value")! } : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            this.#input.setAttribute(key, value);
        }
        this.#input.checked = view.checked;
        this.#input.indeterminate = view.indeterminate;
        this.#input.disabled = view.disabled;
        this.#input.className = view.className;
    }
}

class SometicSwitch extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["checked", "disabled", "name", "value", "shadow"];
    }

    #input = document.createElement("input");
    #mounted = false;

    constructor() {
        super();
        this.#input.addEventListener("change", () => {
            if (this.#input.checked) {
                this.setAttribute("checked", "");
            } else {
                this.removeAttribute("checked");
            }
            dispatchSometicEvent<SometicCheckedChangeDetail>(this, "checked-change", {
                checked: this.#input.checked,
            });
            this.#render();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input);
            this.#mounted = true;
        }
        this.#render();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#render();
        }
    }

    #render(): void {
        const view = resolveSwitch({
            checked: boolAttr(this.getAttribute("checked")),
            disabled: boolAttr(this.getAttribute("disabled")),
            ...(this.getAttribute("name") ? { name: this.getAttribute("name")! } : {}),
            ...(this.getAttribute("value") ? { value: this.getAttribute("value")! } : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            this.#input.setAttribute(key, value);
        }
        this.#input.checked = view.checked;
        this.#input.disabled = view.disabled;
        this.#input.className = view.className;
    }
}

class SometicRadio extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["checked", "disabled", "name", "value", "shadow"];
    }

    #input = document.createElement("input");
    #mounted = false;

    constructor() {
        super();
        this.#input.addEventListener("change", () => {
            if (this.#input.checked) {
                this.setAttribute("checked", "");
            }
            dispatchSometicEvent<SometicValueChangeDetail>(this, "value-change", {
                value: this.#input.value,
            });
            this.#render();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input);
            this.#mounted = true;
        }
        this.#render();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#render();
        }
    }

    #render(): void {
        const value = this.getAttribute("value") ?? "";
        const view = resolveRadio({
            value,
            checked: boolAttr(this.getAttribute("checked")),
            disabled: boolAttr(this.getAttribute("disabled")),
            ...(this.getAttribute("name") ? { name: this.getAttribute("name")! } : {}),
        });
        for (const [key, valueAttr] of Object.entries(view.attributes)) {
            this.setAttribute(key, valueAttr);
        }
        for (const [key, valueAttr] of Object.entries(view.nativeAttributes)) {
            this.#input.setAttribute(key, valueAttr);
        }
        this.#input.checked = view.checked;
        this.#input.disabled = view.disabled;
        this.#input.className = view.className;
    }
}

class SometicSelect extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["value", "disabled", "name", "shadow"];
    }

    #select = document.createElement("select");
    #options: SelectOption[] = [];
    #mounted = false;

    constructor() {
        super();
        this.#select.addEventListener("change", () => {
            this.setAttribute("value", this.#select.value);
            dispatchSometicEvent<SometicValueChangeDetail>(this, "value-change", {
                value: this.#select.value,
            });
            this.#render();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#select);
            this.#mounted = true;
        }
        this.#render();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#render();
        }
    }

    get options(): SelectOption[] {
        return this.#options;
    }

    set options(value: SelectOption[]) {
        this.#options = value;
        if (this.isConnected) {
            this.#render();
        }
    }

    #render(): void {
        const view = resolveSelect({
            value: this.getAttribute("value"),
            options: this.#options,
            disabled: boolAttr(this.getAttribute("disabled")),
            ...(this.getAttribute("name") ? { name: this.getAttribute("name")! } : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            this.#select.setAttribute(key, value);
        }
        this.#select.disabled = view.disabled;
        this.#select.className = view.className;
        this.#select.replaceChildren(
            ...view.options.map((option) => {
                const node = document.createElement("option");
                node.value = option.value;
                node.textContent = option.label;
                node.disabled = option.disabled === true;
                return node;
            }),
        );
        if (view.value !== null) {
            this.#select.value = view.value;
        }
    }
}

export function registerSelectionElements(registry: CustomElementRegistry = customElements): void {
    defineElement("sometic-checkbox", SometicCheckbox, registry);
    defineElement("sometic-switch", SometicSwitch, registry);
    defineElement("sometic-radio", SometicRadio, registry);
    defineElement("sometic-select", SometicSelect, registry);
}

if (canUseCustomElements()) {
    registerSelectionElements();
}

declare global {
    interface HTMLElementTagNameMap {
        "sometic-checkbox": SometicCheckbox;
        "sometic-switch": SometicSwitch;
        "sometic-radio": SometicRadio;
        "sometic-select": SometicSelect;
    }
}

export { SometicCheckbox, SometicRadio, SometicSelect, SometicSwitch };
