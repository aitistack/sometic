import {
    announceFormErrors,
    createForm,
    focusFirstInvalid,
    type CreateFormOptions,
    type FormController,
} from "@sometic/forms";
import type { ValidationIssue, Validator } from "@sometic/validation";
import { boolAttr } from "../shared/attrs.js";
import {
    dispatchSometicEvent,
    type SometicFormChangeDetail,
    type SometicFormInvalidDetail,
    type SometicFormSubmitDetail,
} from "../shared/events.js";
import { canUseCustomElements, defineElement } from "../shared/register.js";
import { getElementMountRoot } from "../shared/shadow.js";

type FormValues = Record<string, unknown>;

function requiredValidator(path: string): Validator {
    return (value) => {
        if (value === null || value === undefined || value === "") {
            return {
                code: "required",
                message: "Required",
                path,
            };
        }
        return undefined;
    };
}

class SometicForm extends HTMLElement {
    static get observedAttributes(): string[] {
        return ["novalidate", "shadow"];
    }

    #form = document.createElement("form");
    #controller: FormController<FormValues> | null = null;
    #unsubscribe: (() => void) | null = null;
    #mounted = false;

    get controller(): FormController<FormValues> | null {
        return this.#controller;
    }

    connectedCallback(): void {
        if (!this.#mounted) {
            while (this.firstChild) {
                this.#form.append(this.firstChild);
            }
            getElementMountRoot(this).append(this.#form);
            this.#mounted = true;
        }
        this.#form.noValidate = true;
        this.#ensureController();
        this.#form.addEventListener("submit", this.#onSubmit);
        this.#form.addEventListener("input", this.#onInput);
        this.#form.addEventListener("focusout", this.#onFocusOut);
    }

    disconnectedCallback(): void {
        this.#form.removeEventListener("submit", this.#onSubmit);
        this.#form.removeEventListener("input", this.#onInput);
        this.#form.removeEventListener("focusout", this.#onFocusOut);
        this.#unsubscribe?.();
        this.#controller?.dispose();
        this.#controller = null;
    }

    attributeChangedCallback(): void {
        this.#form.noValidate = true;
    }

    #ensureController(): void {
        if (this.#controller) {
            return;
        }
        const defaults: FormValues = {};
        const registrations: Array<{ name: string; required: boolean }> = [];
        for (const element of this.#form.elements) {
            if (!(
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement ||
                element instanceof HTMLSelectElement
            )) {
                continue;
            }
            if (!element.name) {
                continue;
            }
            defaults[element.name] = element.value;
            registrations.push({
                name: element.name,
                required: boolAttr(element.getAttribute("required")),
            });
        }
        this.#controller = createForm({ defaultValues: defaults });
        for (const registration of registrations) {
            this.#controller.register(registration.name, {
                validators: registration.required ? [requiredValidator(registration.name)] : [],
            });
        }
        this.#unsubscribe = this.#controller.subscribe(() => {
            dispatchSometicEvent(this, "form-change", {
                values: this.#controller?.getValues() ?? {},
            } satisfies SometicFormChangeDetail);
        });
    }

    #onInput = (event: Event): void => {
        const target = event.target;
        if (!(
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement
        )) {
            return;
        }
        if (!target.name || !this.#controller) {
            return;
        }
        this.#controller.setValue(target.name, target.value);
    };

    #onFocusOut = (event: Event): void => {
        const target = event.target;
        if (!(
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement
        )) {
            return;
        }
        if (!target.name || !this.#controller) {
            return;
        }
        this.#controller.setTouched(target.name, true);
        this.#controller.setVisited(target.name, true);
        void this.#controller.validateField(target.name).then(() => {
            const meta = this.#controller?.getFieldMeta(target.name);
            if (meta?.invalid) {
                target.setAttribute("aria-invalid", "true");
            } else {
                target.removeAttribute("aria-invalid");
            }
        });
    };

    #onSubmit = (event: Event): void => {
        event.preventDefault();
        if (!this.#controller) {
            return;
        }
        void this.#controller.handleSubmit({
            onValid: (values) => {
                dispatchSometicEvent<SometicFormSubmitDetail>(this, "form-submit", { values });
            },
            onInvalid: (issues: ValidationIssue[]) => {
                announceFormErrors(
                    {
                        announce: (message) => {
                            dispatchSometicEvent(this, "form-announce", { message });
                        },
                    },
                    issues,
                );
                focusFirstInvalid(this.#form, issues);
                dispatchSometicEvent<SometicFormInvalidDetail>(this, "form-invalid", { issues });
            },
        })();
    };
}

export type { CreateFormOptions, FormController };
export { SometicForm };

export function registerFormElements(registry: CustomElementRegistry = customElements): void {
    defineElement("sometic-form", SometicForm, registry);
}

if (canUseCustomElements()) {
    registerFormElements();
}

declare global {
    interface HTMLElementTagNameMap {
        "sometic-form": SometicForm;
    }
}
