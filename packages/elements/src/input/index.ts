import type { DateAdapter } from "@sometic/date-core";
import { createNativeDateAdapter } from "@sometic/date-native";
import { createFieldIds, resolveField, type FieldIds } from "@sometic/dom/field";
import { resolveInput, type NativeInputType } from "@sometic/dom/input";
import { createCurrencyInputController } from "@sometic/dom/input-currency";
import { createDateInputController } from "@sometic/dom/input-date";
import { createFileInputController } from "@sometic/dom/input-file";
import { fileKindSvg, resolveFileKind } from "./file-kind.js";
import { createMaskedInputController } from "@sometic/dom/input-masked";
import { createNumberInputController } from "@sometic/dom/input-number";
import { resolveOtpInput } from "@sometic/dom/input-otp";
import { resolvePasswordInput } from "@sometic/dom/input-password";
import { boolAttr } from "../shared/attrs.js";
import {
    dispatchSometicEvent,
    type SometicDateChangeDetail,
    type SometicFilesChangeDetail,
    type SometicNumberChangeDetail,
    type SometicRevealedChangeDetail,
    type SometicValueChangeDetail,
} from "../shared/events.js";
import { canUseCustomElements, defineElement } from "../shared/register.js";
import { getElementMountRoot } from "../shared/shadow.js";

class SometicField extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["disabled", "invalid", "readonly", "required", "shadow"];
    }

    #ids: FieldIds = createFieldIds();
    #root = document.createElement("div");
    #label = document.createElement("label");
    #description = document.createElement("div");
    #control = document.createElement("div");
    #error = document.createElement("div");
    #mounted = false;

    connectedCallback(): void {
        if (!this.#mounted) {
            while (this.firstChild) {
                this.#control.append(this.firstChild);
            }
            this.#root.append(this.#label, this.#description, this.#control, this.#error);
            getElementMountRoot(this).append(this.#root);
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
        const hasDescription = this.#description.textContent.trim().length > 0;
        const hasError = this.#error.textContent.trim().length > 0;
        const view = resolveField({
            ids: this.#ids,
            disabled: boolAttr(this.getAttribute("disabled")),
            invalid: boolAttr(this.getAttribute("invalid")),
            readonly: boolAttr(this.getAttribute("readonly")),
            required: boolAttr(this.getAttribute("required")),
            hasDescription,
            hasError,
        });
        this.#root.className = view.className;
        for (const [key, value] of Object.entries(view.attributes)) {
            this.#root.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.labelAttributes)) {
            this.#label.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.descriptionAttributes)) {
            this.#description.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.errorAttributes)) {
            this.#error.setAttribute(key, value);
        }
        this.#description.hidden = !hasDescription;
        this.#error.hidden = !hasError;
    }
}

class SometicInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return [
            "type",
            "value",
            "disabled",
            "readonly",
            "required",
            "invalid",
            "name",
            "placeholder",
            "shadow",
        ];
    }

    #input = document.createElement("input");
    #mounted = false;

    constructor() {
        super();
        this.#input.addEventListener("input", () => {
            dispatchSometicEvent<SometicValueChangeDetail>(this, "value-change", {
                value: this.#input.value,
            });
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
        const typeAttr = this.getAttribute("type");
        const type = (typeAttr as NativeInputType | null) ?? "text";
        const view = resolveInput({
            type,
            value: this.getAttribute("value") ?? "",
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            required: boolAttr(this.getAttribute("required")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("name") ? { name: this.getAttribute("name")! } : {}),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (this.#input.value !== value) {
                    this.#input.value = value;
                }
                continue;
            }
            this.#input.setAttribute(key, value);
        }
    }
}

class SometicPasswordInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["value", "revealed", "disabled", "readonly", "invalid", "placeholder", "shadow"];
    }

    #input = document.createElement("input");
    #toggle = document.createElement("button");
    #mounted = false;

    constructor() {
        super();
        this.#toggle.type = "button";
        this.#toggle.setAttribute("data-reveal", "");
        this.#toggle.addEventListener("click", (event) => {
            event.preventDefault();
            const next = !boolAttr(this.getAttribute("revealed"));
            if (next) {
                this.setAttribute("revealed", "");
            } else {
                this.removeAttribute("revealed");
            }
            dispatchSometicEvent<SometicRevealedChangeDetail>(this, "revealed-change", {
                revealed: next,
            });
            this.#input.focus();
        });
        this.#input.addEventListener("input", () => {
            dispatchSometicEvent<SometicValueChangeDetail>(this, "value-change", {
                value: this.#input.value,
            });
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input, this.#toggle);
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
        const revealed = boolAttr(this.getAttribute("revealed"));
        const view = resolvePasswordInput({
            value: this.getAttribute("value") ?? "",
            revealed,
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (this.#input.value !== value) {
                    this.#input.value = value;
                }
                continue;
            }
            this.#input.setAttribute(key, value);
        }
        this.#toggle.textContent = revealed ? "Hide" : "Show";
        this.#toggle.setAttribute("aria-pressed", revealed ? "true" : "false");
        this.#toggle.setAttribute("aria-label", revealed ? "Hide password" : "Show password");
        this.#toggle.disabled = boolAttr(this.getAttribute("disabled"));
    }
}

class SometicOtpInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["value", "length", "disabled", "readonly", "shadow"];
    }

    #input = document.createElement("input");
    #mounted = false;

    constructor() {
        super();
        this.#input.addEventListener("input", () => {
            const length = Number(this.getAttribute("length") ?? "6");
            const next = this.#input.value.replace(/\D/g, "").slice(0, length);
            dispatchSometicEvent<SometicValueChangeDetail>(this, "value-change", { value: next });
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
        const length = Number(this.getAttribute("length") ?? "6");
        const view = resolveOtpInput({
            value: this.getAttribute("value") ?? "",
            length,
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        this.#input.maxLength = length;
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (this.#input.value !== value) {
                    this.#input.value = value;
                }
                continue;
            }
            this.#input.setAttribute(key, value);
        }
    }
}

class SometicNumberInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["value", "min", "max", "disabled", "readonly", "invalid", "placeholder", "shadow"];
    }

    #input = document.createElement("input");
    #mounted = false;
    #controller = createNumberInputController({
        onValueChange: (value) => {
            dispatchSometicEvent<SometicNumberChangeDetail>(this, "value-change", { value });
        },
    });

    constructor() {
        super();
        this.#input.addEventListener("input", () => {
            this.#controller.setFromString(this.#input.value);
            this.#syncDisplay();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input);
            this.#mounted = true;
        }
        this.#rebuildController();
        this.#render();
    }

    attributeChangedCallback(name: string): void {
        if (name === "value" || name === "min" || name === "max") {
            this.#rebuildController();
        }
        if (this.isConnected) {
            this.#render();
        }
    }

    #rebuildController(): void {
        const raw = this.getAttribute("value");
        const parsed = raw === null || raw === "" ? null : Number(raw);
        const minAttr = this.getAttribute("min");
        const maxAttr = this.getAttribute("max");
        this.#controller = createNumberInputController({
            value: parsed !== null && !Number.isNaN(parsed) ? parsed : null,
            ...(minAttr !== null ? { min: Number(minAttr) } : {}),
            ...(maxAttr !== null ? { max: Number(maxAttr) } : {}),
            onValueChange: (value) => {
                dispatchSometicEvent<SometicNumberChangeDetail>(this, "value-change", { value });
            },
        });
    }

    #syncDisplay(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (this.#input.value !== value) {
                    this.#input.value = value;
                }
                continue;
            }
            this.#input.setAttribute(key, value);
        }
    }

    #render(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        this.#syncDisplay();
    }
}

class SometicFileInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["multiple", "accept", "disabled", "invalid", "shadow"];
    }

    #input = document.createElement("input");
    #face = document.createElement("div");
    #icon = document.createElement("span");
    #title = document.createElement("span");
    #hint = document.createElement("span");
    #mounted = false;
    #controller = createFileInputController({
        onValueChange: (files) => {
            this.#syncFace(files);
            dispatchSometicEvent<SometicFilesChangeDetail>(this, "value-change", { files });
        },
    });

    constructor() {
        super();
        this.#face.setAttribute("data-slot", "face");
        this.#icon.setAttribute("data-slot", "icon");
        this.#icon.setAttribute("aria-hidden", "true");
        this.#title.setAttribute("data-slot", "title");
        this.#hint.setAttribute("data-slot", "hint");
        const copy = document.createElement("span");
        copy.setAttribute("data-slot", "copy");
        copy.append(this.#title, this.#hint);
        this.#face.append(this.#icon, copy);
        this.#input.addEventListener("change", () => {
            this.#controller.setFromList(this.#input.files);
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#face, this.#input);
            this.#mounted = true;
        }
        this.#rebuildController();
        this.#render();
        this.#syncFace(this.#controller.value.get());
    }

    attributeChangedCallback(): void {
        this.#rebuildController();
        if (this.isConnected) {
            this.#render();
            this.#syncFace(this.#controller.value.get());
        }
    }

    #rebuildController(): void {
        this.#controller = createFileInputController({
            multiple: boolAttr(this.getAttribute("multiple")),
            ...(this.getAttribute("accept") ? { accept: this.getAttribute("accept")! } : {}),
            onValueChange: (files) => {
                this.#syncFace(files);
                dispatchSometicEvent<SometicFilesChangeDetail>(this, "value-change", { files });
            },
        });
    }

    #syncFace(files: File[]): void {
        const first = files[0];
        const kind = resolveFileKind(first);
        this.setAttribute("data-file-kind", kind);
        this.#icon.innerHTML = fileKindSvg(kind);
        this.#hint.textContent = "";
        if (first) {
            const extra = files.length > 1 ? ` (+${String(files.length - 1)})` : "";
            this.#title.textContent = `${first.name}${extra}`;
        } else {
            this.#title.textContent = boolAttr(this.getAttribute("multiple"))
                ? "Choose files"
                : "Choose file";
        }
    }

    #render(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            invalid: boolAttr(this.getAttribute("invalid")),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                continue;
            }
            this.#input.setAttribute(key, value);
        }
        this.#input.type = "file";
        this.#input.multiple = boolAttr(this.getAttribute("multiple"));
        const accept = this.getAttribute("accept");
        if (accept) {
            this.#input.accept = accept;
        } else {
            this.#input.removeAttribute("accept");
        }
        this.#input.disabled = boolAttr(this.getAttribute("disabled"));
    }
}

class SometicMaskedInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["mask", "value", "disabled", "readonly", "invalid", "placeholder", "shadow"];
    }

    #input = document.createElement("input");
    #mounted = false;
    #controller = createMaskedInputController({
        mask: "##########",
        onValueChange: (value) => {
            dispatchSometicEvent<SometicValueChangeDetail>(this, "value-change", { value });
        },
    });

    constructor() {
        super();
        this.#input.addEventListener("input", () => {
            this.#controller.applyInput(this.#input.value);
            this.#syncDisplay();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input);
            this.#mounted = true;
        }
        this.#rebuildController();
        this.#render();
    }

    attributeChangedCallback(name: string): void {
        if (name === "mask" || name === "value") {
            this.#rebuildController();
        }
        if (this.isConnected) {
            this.#render();
        }
    }

    #rebuildController(): void {
        this.#controller = createMaskedInputController({
            mask: this.getAttribute("mask") ?? "##########",
            value: this.getAttribute("value") ?? "",
            onValueChange: (value) => {
                dispatchSometicEvent<SometicValueChangeDetail>(this, "value-change", { value });
            },
        });
    }

    #syncDisplay(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (this.#input.value !== value) {
                    this.#input.value = value;
                }
                continue;
            }
            this.#input.setAttribute(key, value);
        }
    }

    #render(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        this.#syncDisplay();
    }
}

class SometicCurrencyInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return [
            "value",
            "currency",
            "locale",
            "fraction-digits",
            "disabled",
            "readonly",
            "invalid",
            "placeholder",
            "shadow",
        ];
    }

    #input = document.createElement("input");
    #mounted = false;
    #controller = createCurrencyInputController({
        onValueChange: (value) => {
            dispatchSometicEvent<SometicNumberChangeDetail>(this, "value-change", { value });
        },
    });

    constructor() {
        super();
        this.#input.addEventListener("change", () => {
            this.#controller.setFromDisplay(this.#input.value);
            this.#syncDisplay();
        });
        this.#input.addEventListener("blur", () => {
            this.#controller.setFromDisplay(this.#input.value);
            this.#syncDisplay();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input);
            this.#mounted = true;
        }
        this.#rebuildController();
        this.#render();
    }

    attributeChangedCallback(): void {
        this.#rebuildController();
        if (this.isConnected) {
            this.#render();
        }
    }

    #rebuildController(): void {
        const raw = this.getAttribute("value");
        const parsed = raw === null || raw === "" ? null : Number(raw);
        const fraction = this.getAttribute("fraction-digits");
        this.#controller = createCurrencyInputController({
            value: parsed !== null && !Number.isNaN(parsed) ? parsed : null,
            ...(this.getAttribute("currency") ? { currency: this.getAttribute("currency")! } : {}),
            ...(this.getAttribute("locale") ? { locale: this.getAttribute("locale")! } : {}),
            ...(fraction !== null ? { fractionDigits: Number(fraction) } : {}),
            onValueChange: (value) => {
                dispatchSometicEvent<SometicNumberChangeDetail>(this, "value-change", { value });
            },
        });
    }

    #syncDisplay(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (this.#input.value !== value) {
                    this.#input.value = value;
                }
                continue;
            }
            this.#input.setAttribute(key, value);
        }
    }

    #render(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
            ...(this.getAttribute("placeholder")
                ? { placeholder: this.getAttribute("placeholder")! }
                : {}),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        this.#syncDisplay();
    }
}

class SometicDateInput extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["value", "disabled", "readonly", "invalid", "shadow"];
    }

    #input = document.createElement("input");
    #mounted = false;
    #adapter: DateAdapter = createNativeDateAdapter();
    #controller = createDateInputController({
        adapter: createNativeDateAdapter(),
        onValueChange: (value) => {
            dispatchSometicEvent<SometicDateChangeDetail>(this, "value-change", { value });
        },
    });

    constructor() {
        super();
        this.#input.addEventListener("change", () => {
            this.#controller.setFromNativeValue(this.#input.value);
            this.#syncDisplay();
        });
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            getElementMountRoot(this).append(this.#input);
            this.#mounted = true;
        }
        this.#rebuildController();
        this.#render();
    }

    attributeChangedCallback(name: string): void {
        if (name === "value") {
            this.#rebuildController();
        }
        if (this.isConnected) {
            this.#render();
        }
    }

    get adapter(): DateAdapter {
        return this.#adapter;
    }

    set adapter(value: DateAdapter) {
        this.#adapter = value;
        this.#rebuildController();
        if (this.isConnected) {
            this.#render();
        }
    }

    #rebuildController(): void {
        const raw = this.getAttribute("value");
        let initial: Date | null = null;
        if (raw) {
            const parsed = this.#adapter.deserialize(raw);
            initial = parsed.valid ? parsed.date : null;
        }
        this.#controller = createDateInputController({
            adapter: this.#adapter,
            value: initial,
            onValueChange: (value) => {
                dispatchSometicEvent<SometicDateChangeDetail>(this, "value-change", { value });
            },
        });
    }

    #syncDisplay(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
        });
        for (const [key, value] of Object.entries(view.nativeAttributes)) {
            if (key === "value") {
                if (this.#input.value !== value) {
                    this.#input.value = value;
                }
                continue;
            }
            this.#input.setAttribute(key, value);
        }
    }

    #render(): void {
        const view = this.#controller.resolve({
            disabled: boolAttr(this.getAttribute("disabled")),
            readonly: boolAttr(this.getAttribute("readonly")),
            invalid: boolAttr(this.getAttribute("invalid")),
        });
        for (const [key, value] of Object.entries(view.attributes)) {
            this.setAttribute(key, value);
        }
        this.#syncDisplay();
    }
}

export function registerInputElements(registry: CustomElementRegistry = customElements): void {
    defineElement("sometic-field", SometicField, registry);
    defineElement("sometic-input", SometicInput, registry);
    defineElement("sometic-password-input", SometicPasswordInput, registry);
    defineElement("sometic-otp-input", SometicOtpInput, registry);
    defineElement("sometic-number-input", SometicNumberInput, registry);
    defineElement("sometic-file-input", SometicFileInput, registry);
    defineElement("sometic-masked-input", SometicMaskedInput, registry);
    defineElement("sometic-currency-input", SometicCurrencyInput, registry);
    defineElement("sometic-date-input", SometicDateInput, registry);
}

if (canUseCustomElements()) {
    registerInputElements();
}

declare global {
    interface HTMLElementTagNameMap {
        "sometic-field": SometicField;
        "sometic-input": SometicInput;
        "sometic-password-input": SometicPasswordInput;
        "sometic-otp-input": SometicOtpInput;
        "sometic-number-input": SometicNumberInput;
        "sometic-file-input": SometicFileInput;
        "sometic-masked-input": SometicMaskedInput;
        "sometic-currency-input": SometicCurrencyInput;
        "sometic-date-input": SometicDateInput;
    }
}

export {
    SometicCurrencyInput,
    SometicDateInput,
    SometicField,
    SometicFileInput,
    SometicInput,
    SometicMaskedInput,
    SometicNumberInput,
    SometicOtpInput,
    SometicPasswordInput,
};
