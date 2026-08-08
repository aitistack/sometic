import {
    announceFormErrors,
    createDraftController,
    createForm,
    createFormSteps,
    createMemoryDraftStorage,
    feedbackAttributes,
    focusFirstInvalid,
    valuesToFormData,
    type FormController,
    type FormFeedback,
} from "@sometic/forms";
import { createIssue, email, minLength, required } from "@sometic/validation";
import { defineSchema, fromSchema, number, object, optional, string } from "@sometic/validation/define";
import "@sometic/elements/form";

function bindTextInput<TValues extends Record<string, unknown>>(
    input: HTMLInputElement,
    form: FormController<TValues>,
    name: string,
    errorEl: HTMLElement,
): void {
    const sync = (): void => {
        input.value = String(form.getValue(name) ?? "");
        const meta = form.getFieldMeta(name);
        errorEl.textContent = meta.error ?? "";
        if (meta.invalid) {
            input.setAttribute("aria-invalid", "true");
        } else {
            input.removeAttribute("aria-invalid");
        }
    };
    input.addEventListener("input", () => {
        form.setValue(name, input.value);
    });
    input.addEventListener("blur", () => {
        const registered = form.register(name);
        registered.onBlur();
    });
    form.subscribe(sync);
    sync();
}

function renderFeedback(el: HTMLElement, feedback: FormFeedback): void {
    const attrs = feedbackAttributes(feedback);
    for (const key of ["data-feedback", "role", "hidden"] as const) {
        el.removeAttribute(key);
    }
    if (feedback.kind === "idle" || !feedback.message) {
        el.hidden = true;
        el.textContent = "";
        return;
    }
    el.hidden = false;
    el.textContent = feedback.message;
    for (const [key, value] of Object.entries(attrs)) {
        if (key === "hidden") {
            continue;
        }
        el.setAttribute(key, value);
    }
}

export function mountFormsSection(root: HTMLElement): void {
    const status = root.querySelector<HTMLElement>("[data-forms-status]");
    const summary = root.querySelector<HTMLElement>("[data-forms-summary]");
    const loginFeedback = root.querySelector<HTMLElement>("[data-login-feedback]");
    if (!status || !summary || !loginFeedback) {
        throw new Error("Forms section missing status nodes");
    }

    const loginForm = createForm({
        defaultValues: { email: "", password: "" },
        validationMode: "onBlur",
    });
    loginForm.register("email", { validators: [required(), email()] });
    loginForm.register("password", { validators: [required(), minLength(6)] });

    const emailInput = root.querySelector<HTMLInputElement>("[data-login-email]");
    const passwordInput = root.querySelector<HTMLInputElement>("[data-login-password]");
    const emailError = root.querySelector<HTMLElement>("[data-login-email-error]");
    const passwordError = root.querySelector<HTMLElement>("[data-login-password-error]");
    if (!emailInput || !passwordInput || !emailError || !passwordError) {
        throw new Error("Login fields missing");
    }
    bindTextInput(emailInput, loginForm, "email", emailError);
    bindTextInput(passwordInput, loginForm, "password", passwordError);
    loginForm.subscribe(() => {
        renderFeedback(loginFeedback, loginForm.getFeedback());
    });

    root.querySelector("[data-login-submit]")?.addEventListener("click", () => {
        void loginForm.handleSubmit({
            successMessage: "Login looks good.",
            onValid: (values) => {
                status.textContent = `Login valid: ${values.email}`;
                summary.textContent = "";
            },
            onInvalid: (issues) => {
                summary.textContent = issues.map((issue) => issue.message).join(" · ");
                announceFormErrors(
                    {
                        announce: (message) => {
                            status.textContent = message;
                        },
                    },
                    issues,
                );
                focusFirstInvalid(root, issues);
            },
        })();
    });

    root.querySelector("[data-login-server]")?.addEventListener("click", () => {
        loginForm.setServerErrors([
            createIssue("server", "Email already registered", { path: "email" }),
        ]);
        status.textContent = "Injected server error on email";
    });

    const schemaAdapter = defineSchema(
        object({
            email: string({ email: true, nonempty: true }),
            age: optional(number({ min: 18, int: true })),
        }),
    );
    const schemaForm = createForm({
        defaultValues: { email: "", age: "" },
        validators: [fromSchema(schemaAdapter)],
        validationMode: "onSubmit",
    });
    schemaForm.register("email");
    schemaForm.register("age", {
        transform: (value) => (value === "" ? value : Number(value)),
    });
    const schemaEmail = root.querySelector<HTMLInputElement>("[data-schema-email]");
    const schemaAge = root.querySelector<HTMLInputElement>("[data-schema-age]");
    const schemaEmailError = root.querySelector<HTMLElement>("[data-schema-email-error]");
    const schemaAgeError = root.querySelector<HTMLElement>("[data-schema-age-error]");
    const schemaStatus = root.querySelector<HTMLElement>("[data-schema-status]");
    if (schemaEmail && schemaAge && schemaEmailError && schemaAgeError) {
        bindTextInput(schemaEmail, schemaForm, "email", schemaEmailError);
        bindTextInput(schemaAge, schemaForm, "age", schemaAgeError);
    }
    root.querySelector("[data-schema-submit]")?.addEventListener("click", () => {
        void schemaForm.handleSubmit({
            onValid: (values) => {
                if (schemaStatus) {
                    schemaStatus.textContent = `Schema ok: ${JSON.stringify(values)}`;
                }
            },
            onInvalid: (issues) => {
                if (schemaStatus) {
                    schemaStatus.textContent = issues.map((issue) => issue.message).join(" · ");
                }
            },
        })();
    });

    const arrayForm = createForm({
        defaultValues: { items: [{ name: "Alpha" }] as Array<{ name: string }> },
    });
    const array = arrayForm.createFieldArray<{ name: string }>("items", {
        defaultItem: { name: "" },
    });
    const arrayList = root.querySelector<HTMLElement>("[data-array-list]");
    const renderArray = (): void => {
        if (!arrayList) {
            return;
        }
        arrayList.replaceChildren();
        for (const field of array.fields()) {
            const row = document.createElement("div");
            row.className = "pg-row";
            const input = document.createElement("input");
            input.className = "pg-input";
            input.name = `items[${field.index}].name`;
            input.value = String(arrayForm.getValue(`items[${field.index}].name`) ?? "");
            input.addEventListener("input", () => {
                arrayForm.setValue(`items[${field.index}].name`, input.value, { validate: false });
            });
            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "pg-btn";
            remove.textContent = "Remove";
            remove.addEventListener("click", () => {
                array.remove(field.index);
            });
            row.append(input, remove);
            arrayList.append(row);
        }
        status.textContent = `Field array length: ${arrayForm.getValues().items.length}`;
    };
    arrayForm.subscribe(renderArray);
    root.querySelector("[data-array-add]")?.addEventListener("click", () => {
        array.append({ name: "" });
    });
    renderArray();

    const stepForm = createForm({
        defaultValues: {
            email: "",
            fullName: "",
            company: "",
        },
    });
    stepForm.register("email", { validators: [required(), email()] });
    stepForm.register("fullName", { validators: [required(), minLength(2)] });
    stepForm.register("company", { validators: [required(), minLength(2)] });
    const steps = createFormSteps({
        form: stepForm,
        steps: [
            {
                id: "account",
                title: "Account",
                description: "How we reach you",
                fields: [
                    {
                        name: "email",
                        label: "Work email",
                        type: "email",
                        placeholder: "you@company.com",
                        autocomplete: "email",
                    },
                ],
            },
            {
                id: "profile",
                title: "Profile",
                description: "Who you are",
                fields: [
                    {
                        name: "fullName",
                        label: "Full name",
                        placeholder: "Ada Lovelace",
                        autocomplete: "name",
                    },
                ],
            },
            {
                id: "workspace",
                title: "Workspace",
                description: "Where you work",
                fields: [
                    {
                        name: "company",
                        label: "Company",
                        placeholder: "Sometic",
                        autocomplete: "organization",
                    },
                ],
            },
        ],
    });

    const stepFieldsHost = root.querySelector<HTMLElement>("[data-step-fields]");
    const stepLabel = root.querySelector<HTMLElement>("[data-step-label]");
    const stepFeedback = root.querySelector<HTMLElement>("[data-step-feedback]");
    const stepBack = root.querySelector<HTMLButtonElement>("[data-step-back]");
    const stepNext = root.querySelector<HTMLButtonElement>("[data-step-next]");
    const stepSubmit = root.querySelector<HTMLButtonElement>("[data-step-submit]");
    if (!stepFieldsHost || !stepLabel || !stepFeedback || !stepBack || !stepNext || !stepSubmit) {
        throw new Error("Multi-step nodes missing");
    }

    const stepUnsubs: Array<() => void> = [];
    const clearStepUnsubs = (): void => {
        while (stepUnsubs.length > 0) {
            stepUnsubs.pop()?.();
        }
    };

    const renderStep = (): void => {
        clearStepUnsubs();
        const step = steps.getStep();
        const total = steps.getSteps().length;
        const current = steps.getStepIndex() + 1;
        stepLabel.textContent = `Step ${current} of ${total} · ${step.title ?? step.id}${
            step.description ? ` — ${step.description}` : ""
        }`;
        stepFieldsHost.replaceChildren();
        for (const field of steps.getStepFields()) {
            const label = document.createElement("label");
            label.className = "pg-control";
            const caption = document.createElement("span");
            caption.className = "pg-control-label";
            caption.textContent = field.label ?? field.name;
            const input = document.createElement("input");
            input.className = "pg-input";
            input.name = field.name;
            input.type = field.type ?? "text";
            if (field.placeholder) {
                input.placeholder = field.placeholder;
            }
            if (field.autocomplete) {
                input.setAttribute("autocomplete", field.autocomplete);
            }
            input.value = String(stepForm.getValue(field.name) ?? "");
            const error = document.createElement("span");
            error.className = "pg-field-error";
            input.addEventListener("input", () => {
                stepForm.setValue(field.name, input.value);
            });
            input.addEventListener("blur", () => {
                stepForm.setTouched(field.name, true);
                void stepForm.validateField(field.name);
            });
            const syncField = (): void => {
                const meta = stepForm.getFieldMeta(field.name);
                const feedback = stepForm.getFeedback();
                const showFieldError = feedback.kind === "idle" || feedback.kind === "success";
                error.textContent = showFieldError ? (meta.error ?? "") : "";
                if (meta.invalid) {
                    input.setAttribute("aria-invalid", "true");
                } else {
                    input.removeAttribute("aria-invalid");
                }
            };
            stepUnsubs.push(stepForm.subscribe(syncField));
            syncField();
            label.append(caption, input, error);
            stepFieldsHost.append(label);
        }
        stepBack.disabled = steps.isFirst();
        stepNext.hidden = steps.isLast();
        stepSubmit.hidden = !steps.isLast();
        renderFeedback(stepFeedback, stepForm.getFeedback());
    };

    stepForm.subscribe(() => {
        renderFeedback(stepFeedback, stepForm.getFeedback());
    });
    stepNext.addEventListener("click", () => {
        void steps.next().then((ok) => {
            status.textContent = ok ? `Moved to ${steps.getStep().id}` : "Fix current step";
            renderStep();
        });
    });
    stepBack.addEventListener("click", () => {
        steps.back();
        status.textContent = `Back to ${steps.getStep().id}`;
        renderStep();
    });
    stepSubmit.addEventListener("click", () => {
        void stepForm.handleSubmit({
            successMessage: "Onboarding complete.",
            onValid: (values) => {
                status.textContent = `Finished: ${values.fullName} @ ${values.company}`;
            },
            onInvalid: () => {
                status.textContent = "Finish step still has errors";
                renderStep();
            },
        })();
    });
    renderStep();

    let draftValues = { note: "Draft me" };
    const drafts = createDraftController({
        key: "pg-forms-draft",
        version: 1,
        storage: createMemoryDraftStorage(),
        getValues: () => draftValues,
        setValues: (next) => {
            draftValues = next;
        },
    });
    const draftInput = root.querySelector<HTMLInputElement>("[data-draft-note]");
    if (draftInput) {
        draftInput.value = draftValues.note;
        draftInput.addEventListener("input", () => {
            draftValues = { note: draftInput.value };
            drafts.scheduleSave();
        });
        root.querySelector("[data-draft-save]")?.addEventListener("click", () => {
            void drafts.save().then(() => {
                status.textContent = "Draft saved (memory)";
            });
        });
        root.querySelector("[data-draft-load]")?.addEventListener("click", () => {
            void drafts.load().then((loaded) => {
                if (!loaded) {
                    status.textContent = "No draft";
                    return;
                }
                draftInput.value = loaded.note;
                status.textContent = `Draft loaded: ${loaded.note}`;
            });
        });
    }

    const usernameForm = createForm({
        defaultValues: { username: "" },
        validationMode: "onChange",
        debounceMs: 250,
    });
    usernameForm.register("username", {
        validators: [
            required(),
            async (value) => {
                await new Promise((resolve) => {
                    setTimeout(resolve, 200);
                });
                if (value === "admin") {
                    return createIssue("taken", "Username taken", { path: "username" });
                }
                return undefined;
            },
        ],
    });
    const usernameInput = root.querySelector<HTMLInputElement>("[data-async-username]");
    const usernameError = root.querySelector<HTMLElement>("[data-async-username-error]");
    if (usernameInput && usernameError) {
        bindTextInput(usernameInput, usernameForm, "username", usernameError);
    }

    root.querySelector("[data-formdata-dump]")?.addEventListener("click", () => {
        const data = valuesToFormData(loginForm.getValues());
        status.textContent = `FormData keys: ${[...data.keys()].join(", ")}`;
    });

    const elementStatus = root.querySelector<HTMLElement>("[data-elements-form-status]");
    const aitiForm = root.querySelector("sometic-form");
    aitiForm?.addEventListener("form-submit", ((event: Event) => {
        const custom = event as CustomEvent<{ values: Record<string, unknown> }>;
        if (elementStatus) {
            elementStatus.textContent = `sometic-form submit: ${JSON.stringify(custom.detail.values)}`;
        }
    }) as EventListener);
    aitiForm?.addEventListener("form-invalid", ((event: Event) => {
        const custom = event as CustomEvent<{ issues: ValidationIssueLike[] }>;
        if (elementStatus) {
            elementStatus.textContent = `sometic-form invalid: ${custom.detail.issues
                .map((issue) => issue.message)
                .join(" · ")}`;
        }
    }) as EventListener);
}

type ValidationIssueLike = { message: string };
