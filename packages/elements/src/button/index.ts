import {
    handleButtonPress,
    resolveButton,
    resolveButtonGroup,
    resolveIconButton,
    resolveToggleButton,
    type ButtonType,
} from "@sometic/dom";
import { createAsyncButtonController } from "@sometic/dom/async-button";
import { boolAttr } from "../shared/attrs.js";
import {
    dispatchSometicEvent,
    type SometicAsyncCompleteDetail,
    type SometicAsyncErrorDetail,
    type SometicPressedChangeDetail,
} from "../shared/events.js";
import { canUseCustomElements, defineElement } from "../shared/register.js";
import { getElementMountRoot } from "../shared/shadow.js";

class SometicButton extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["type", "disabled", "loading", "size", "variant", "shadow"];
    }

    #button: HTMLButtonElement;
    #content: HTMLSpanElement;
    #loader: HTMLSpanElement;
    #mounted = false;

    constructor() {
        super();
        this.#button = document.createElement("button");
        this.#content = document.createElement("span");
        this.#loader = document.createElement("span");
        this.#button.append(this.#content, this.#loader);
        this.#button.addEventListener("click", (event) => {
            const view = this.#resolve();
            handleButtonPress(view, event);
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            while (this.firstChild) {
                this.#content.append(this.firstChild);
            }
            getElementMountRoot(this).append(this.#button);
            this.#mounted = true;
        }
        this.#render();
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#render();
        }
    }

    #resolve() {
        const typeAttr = this.getAttribute("type");
        const type: ButtonType =
            typeAttr === "submit" || typeAttr === "reset" || typeAttr === "button"
                ? typeAttr
                : "button";
        return resolveButton({
            type,
            disabled: boolAttr(this.getAttribute("disabled")),
            loading: boolAttr(this.getAttribute("loading")),
            ...(this.getAttribute("size") ? { size: this.getAttribute("size")! } : {}),
            ...(this.getAttribute("variant") ? { variant: this.getAttribute("variant")! } : {}),
        });
    }

    #render(): void {
        const view = this.#resolve();
        this.#button.type = view.type;
        this.#button.disabled = view.nativeDisabled;
        this.#button.className = view.className;
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#button.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.slots.content.attributes)) {
            this.#content.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.slots.loader.attributes)) {
            this.#loader.setAttribute(key, value);
        }
        this.#loader.hidden = !view.loading;
    }
}

class SometicIconButton extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["aria-label", "disabled", "shadow"];
    }

    #button = document.createElement("button");
    #mounted = false;

    constructor() {
        super();
        this.#button.addEventListener("click", (event) => {
            const label = this.getAttribute("aria-label") ?? "";
            const view = resolveIconButton({
                "aria-label": label,
                disabled: boolAttr(this.getAttribute("disabled")),
            });
            handleButtonPress(view, event);
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            while (this.firstChild) {
                this.#button.append(this.firstChild);
            }
            getElementMountRoot(this).append(this.#button);
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
        const label = this.getAttribute("aria-label") ?? "";
        const view = resolveIconButton({
            "aria-label": label.length > 0 ? label : "button",
            disabled: boolAttr(this.getAttribute("disabled")),
        });
        this.#button.type = view.type;
        this.#button.disabled = view.nativeDisabled;
        this.#button.className = view.className;
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#button.setAttribute(key, value);
        }
    }
}

class SometicToggleButton extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["pressed", "disabled", "shadow"];
    }

    #button = document.createElement("button");
    #pressed = false;
    #mounted = false;

    constructor() {
        super();
        this.#button.addEventListener("click", (event) => {
            const view = resolveToggleButton({
                pressed: this.#pressed,
                disabled: boolAttr(this.getAttribute("disabled")),
            });
            handleButtonPress(view, event, () => {
                this.#pressed = !this.#pressed;
                this.setAttribute("pressed", this.#pressed ? "true" : "false");
                dispatchSometicEvent<SometicPressedChangeDetail>(this, "pressed-change", {
                    pressed: this.#pressed,
                });
                this.#render();
            });
        });
    }

    connectedCallback(): void {
        this.#pressed = boolAttr(this.getAttribute("pressed"));
        if (!this.#mounted) {
            while (this.firstChild) {
                this.#button.append(this.firstChild);
            }
            getElementMountRoot(this).append(this.#button);
            this.#mounted = true;
        }
        this.#render();
    }

    attributeChangedCallback(name: string): void {
        if (name === "pressed") {
            this.#pressed = boolAttr(this.getAttribute("pressed"));
        }
        if (this.isConnected) {
            this.#render();
        }
    }

    #render(): void {
        const view = resolveToggleButton({
            pressed: this.#pressed,
            disabled: boolAttr(this.getAttribute("disabled")),
        });
        this.#button.type = view.type;
        this.#button.disabled = view.nativeDisabled;
        this.#button.className = view.className;
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#button.setAttribute(key, value);
        }
    }
}

class SometicButtonGroup extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["orientation", "disabled"];
    }

    connectedCallback(): void {
        this.#render();
    }

    attributeChangedCallback(): void {
        this.#render();
    }

    #render(): void {
        const orientationAttr = this.getAttribute("orientation");
        const orientation = orientationAttr === "vertical" ? "vertical" : "horizontal";
        const view = resolveButtonGroup({
            orientation,
            disabled: boolAttr(this.getAttribute("disabled")),
        });
        this.className = view.className;
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
    }
}

class SometicAsyncButton extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["type", "disabled", "size", "variant", "shadow"];
    }

    #button: HTMLButtonElement;
    #content: HTMLSpanElement;
    #loader: HTMLSpanElement;
    #mounted = false;
    #action: ((signal: AbortSignal) => Promise<unknown>) | null = null;
    #unsubscribe: (() => void) | null = null;

    constructor() {
        super();
        this.#button = document.createElement("button");
        this.#content = document.createElement("span");
        this.#loader = document.createElement("span");
        this.#button.append(this.#content, this.#loader);
        this.#button.addEventListener("click", () => {
            void this.#press();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            while (this.firstChild) {
                this.#content.append(this.firstChild);
            }
            getElementMountRoot(this).append(this.#button);
            this.#mounted = true;
        }
        this.#render();
    }

    disconnectedCallback(): void {
        this.#unsubscribe?.();
        this.#unsubscribe = null;
    }

    attributeChangedCallback(): void {
        if (this.isConnected) {
            this.#render();
        }
    }

    get action(): ((signal: AbortSignal) => Promise<unknown>) | null {
        return this.#action;
    }

    set action(value: ((signal: AbortSignal) => Promise<unknown>) | null) {
        this.#action = value;
    }

    async #press(): Promise<void> {
        if (!this.#action) {
            return;
        }
        const controller = createAsyncButtonController({
            action: this.#action,
            disabled: boolAttr(this.getAttribute("disabled")),
            ...(this.getAttribute("size") ? { size: this.getAttribute("size")! } : {}),
            ...(this.getAttribute("variant") ? { variant: this.getAttribute("variant")! } : {}),
        });
        this.#unsubscribe?.();
        const subscription = controller.subscribe(() => {
            this.#renderFrom(controller);
        });
        this.#unsubscribe = () => {
            subscription.dispose();
        };
        this.#renderFrom(controller);
        try {
            const data = await controller.press({ preventDefault() {} });
            if (data !== undefined) {
                dispatchSometicEvent<SometicAsyncCompleteDetail>(this, "async-complete", { data });
            }
        } catch (error) {
            dispatchSometicEvent<SometicAsyncErrorDetail>(this, "async-error", { error });
        } finally {
            this.#renderFrom(controller);
        }
    }

    #renderFrom(controller: ReturnType<typeof createAsyncButtonController<unknown>>): void {
        const typeAttr = this.getAttribute("type");
        const type: ButtonType =
            typeAttr === "submit" || typeAttr === "reset" || typeAttr === "button"
                ? typeAttr
                : "button";
        const view = controller.resolve({
            type,
            disabled: boolAttr(this.getAttribute("disabled")),
            ...(this.getAttribute("size") ? { size: this.getAttribute("size")! } : {}),
            ...(this.getAttribute("variant") ? { variant: this.getAttribute("variant")! } : {}),
        });
        this.#button.type = view.type;
        this.#button.disabled = view.nativeDisabled;
        this.#button.className = view.className;
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#button.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.slots.content.attributes)) {
            this.#content.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.slots.loader.attributes)) {
            this.#loader.setAttribute(key, value);
        }
        this.#loader.hidden = !view.loading;
    }

    #render(): void {
        const typeAttr = this.getAttribute("type");
        const type: ButtonType =
            typeAttr === "submit" || typeAttr === "reset" || typeAttr === "button"
                ? typeAttr
                : "button";
        const view = resolveButton({
            type,
            disabled: boolAttr(this.getAttribute("disabled")),
            loading: false,
            ...(this.getAttribute("size") ? { size: this.getAttribute("size")! } : {}),
            ...(this.getAttribute("variant") ? { variant: this.getAttribute("variant")! } : {}),
        });
        this.#button.type = view.type;
        this.#button.disabled = view.nativeDisabled;
        this.#button.className = view.className;
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#button.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.slots.content.attributes)) {
            this.#content.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.slots.loader.attributes)) {
            this.#loader.setAttribute(key, value);
        }
        this.#loader.hidden = !view.loading;
    }
}

export function registerButtonElements(registry: CustomElementRegistry = customElements): void {
    defineElement("sometic-button", SometicButton, registry);
    defineElement("sometic-icon-button", SometicIconButton, registry);
    defineElement("sometic-toggle-button", SometicToggleButton, registry);
    defineElement("sometic-button-group", SometicButtonGroup, registry);
    defineElement("sometic-async-button", SometicAsyncButton, registry);
}

if (canUseCustomElements()) {
    registerButtonElements();
}

declare global {
    interface HTMLElementTagNameMap {
        "sometic-button": SometicButton;
        "sometic-icon-button": SometicIconButton;
        "sometic-toggle-button": SometicToggleButton;
        "sometic-button-group": SometicButtonGroup;
        "sometic-async-button": SometicAsyncButton;
    }
}

export { SometicAsyncButton, SometicButton, SometicButtonGroup, SometicIconButton, SometicToggleButton };
