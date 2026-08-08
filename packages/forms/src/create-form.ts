import {
    debouncePromise,
    getAt,
    runValidators,
    setAt,
    type ValidationIssue,
} from "@sometic/validation";
import type {
    CreateFormOptions,
    FieldMeta,
    FieldRegistrationOptions,
    FormListener,
    FormMeta,
    RegisterResult,
    SubmitHandlers,
    ValidationMode,
} from "./types.js";
import { createFieldArrayController, type FieldArrayController } from "./field-array/index.js";
import {
    createErrorFeedback,
    createIdleFeedback,
    createSuccessFeedback,
    createValidationFeedback,
    resolveFormFeedbackFlags,
    type FormFeedback,
    type FormFeedbackFlags,
} from "./feedback.js";

type FieldState = {
    options: FieldRegistrationOptions;
    meta: FieldMeta;
    token: number;
    abort?: AbortController;
};

function emptyMeta(enabled = true): FieldMeta {
    return {
        dirty: false,
        touched: false,
        visited: false,
        valid: true,
        invalid: false,
        pending: false,
        enabled,
        issues: [],
    };
}

function cloneValues<T>(values: T): T {
    return structuredClone(values);
}

function isEnabled(options: FieldRegistrationOptions, values: unknown): boolean {
    if (typeof options.enabled === "function") {
        return options.enabled(values);
    }
    return options.enabled !== false;
}

export type FormController<TValues extends Record<string, unknown>> = {
    getValues: () => TValues;
    setValue: (path: string, value: unknown, options?: { validate?: boolean }) => void;
    getValue: (path: string) => unknown;
    getDefaultValues: () => TValues;
    getFieldMeta: (path: string) => FieldMeta;
    getFormMeta: () => FormMeta;
    getFeedback: () => FormFeedback;
    getFeedbackFlags: () => FormFeedbackFlags;
    setFeedback: (feedback: FormFeedback) => void;
    clearFeedback: () => void;
    getIssues: () => ValidationIssue[];
    getFieldIssues: (path: string) => ValidationIssue[];
    register: (name: string, options?: FieldRegistrationOptions) => RegisterResult;
    unregister: (name: string) => void;
    setTouched: (path: string, touched?: boolean) => void;
    setVisited: (path: string, visited?: boolean) => void;
    validateField: (path: string) => Promise<boolean>;
    validateForm: (paths?: readonly string[]) => Promise<boolean>;
    reset: (values?: TValues) => void;
    partialReset: (paths: readonly string[]) => void;
    setServerErrors: (issues: ValidationIssue[]) => void;
    clearServerErrors: (paths?: readonly string[]) => void;
    setErrors: (issues: ValidationIssue[]) => void;
    clearErrors: (paths?: readonly string[]) => void;
    handleSubmit: (
        handlers: SubmitHandlers<TValues>,
    ) => (event?: { preventDefault?: () => void }) => Promise<void>;
    createFieldArray: <TItem>(
        name: string,
        options?: { defaultItem?: TItem },
    ) => FieldArrayController<TItem>;
    subscribe: (listener: FormListener) => () => void;
    dispose: () => void;
};

export function createForm<TValues extends Record<string, unknown>>(
    options: CreateFormOptions<TValues>,
): FormController<TValues> {
    let defaultValues = cloneValues(options.defaultValues);
    let values = cloneValues(options.defaultValues);
    const fields = new Map<string, FieldState>();
    let serverIssues: ValidationIssue[] = [];
    let clientIssues: ValidationIssue[] = [];
    let submitting = false;
    let submitCount = 0;
    let disposed = false;
    const listeners = new Set<FormListener>();
    const formValidators = options.validators ?? [];
    const defaultMode: ValidationMode = options.validationMode ?? "onSubmit";
    const defaultDebounce = options.debounceMs ?? 0;
    const fieldArrays = new Map<string, FieldArrayController<unknown>>();
    const feedbackFlags = resolveFormFeedbackFlags(options.feedback);
    let feedback: FormFeedback = createIdleFeedback();

    const notify = (): void => {
        for (const listener of listeners) {
            listener();
        }
    };

    const setFeedbackInternal = (next: FormFeedback): void => {
        feedback = next;
        notify();
    };

    const assertActive = (): void => {
        if (disposed) {
            throw new Error("Form has been disposed");
        }
    };

    const collectIssues = (): ValidationIssue[] => {
        const fieldIssues: ValidationIssue[] = [];
        for (const state of fields.values()) {
            fieldIssues.push(...state.meta.issues);
        }
        return [...fieldIssues, ...clientIssues, ...serverIssues];
    };

    const recomputeFieldValidity = (state: FieldState): void => {
        const hasError = state.meta.issues.length > 0;
        state.meta.valid = !hasError && !state.meta.pending;
        state.meta.invalid = hasError;
        const message = state.meta.issues[0]?.message;
        if (message === undefined) {
            delete state.meta.error;
        } else {
            state.meta.error = message;
        }
    };

    const getOrCreateField = (
        name: string,
        registration?: FieldRegistrationOptions,
    ): FieldState => {
        let state = fields.get(name);
        if (!state) {
            state = {
                options: registration ?? {},
                meta: emptyMeta(true),
                token: 0,
            };
            fields.set(name, state);
        } else if (registration) {
            state.options = registration;
        }
        state.meta.enabled = isEnabled(state.options, values);
        return state;
    };

    const replaceIssuesForPath = (path: string, next: ValidationIssue[]): void => {
        const state = fields.get(path);
        if (state) {
            const retainedServer = state.meta.issues.filter((issue) =>
                serverIssues.some(
                    (server) =>
                        server.path === path &&
                        server.code === issue.code &&
                        server.message === issue.message,
                ),
            );
            state.meta.issues = [
                ...next
                    .filter((issue) => issue.path === path || issue.path === undefined)
                    .map((issue) => (issue.path === undefined ? { ...issue, path } : issue)),
                ...retainedServer,
            ];
            recomputeFieldValidity(state);
        }
        clientIssues = clientIssues.filter((issue) => issue.path !== path);
    };

    const validateFieldInternal = async (path: string, mode: ValidationMode): Promise<boolean> => {
        assertActive();
        const state = getOrCreateField(path);
        if (!isEnabled(state.options, values)) {
            state.meta.enabled = false;
            state.meta.issues = [];
            state.meta.pending = false;
            recomputeFieldValidity(state);
            notify();
            return true;
        }
        state.meta.enabled = true;
        const fieldMode = state.options.validateOn ?? defaultMode;
        if (mode === "onChange" && fieldMode === "onSubmit") {
            return !state.meta.invalid;
        }
        if (mode === "onBlur" && fieldMode === "onSubmit") {
            return !state.meta.invalid;
        }
        if (mode === "onChange" && fieldMode === "onBlur") {
            return !state.meta.invalid;
        }
        if (mode === "onChange" && fieldMode === "onTouched" && !state.meta.touched) {
            return !state.meta.invalid;
        }

        state.abort?.abort();
        const controller = new AbortController();
        state.abort = controller;
        const token = ++state.token;
        state.meta.pending = true;
        notify();

        const debounceMs = state.options.debounceMs ?? defaultDebounce;
        const validators = state.options.validators ?? [];
        const run = async (signal: AbortSignal): Promise<boolean> => {
            const value = getAt(values, path);
            const result = await runValidators(validators, value, {
                values,
                path,
                signal,
            });
            if (signal.aborted || token !== state.token) {
                return false;
            }
            replaceIssuesForPath(path, result.issues);
            state.meta.pending = false;
            recomputeFieldValidity(state);
            notify();
            return result.valid;
        };

        try {
            if (debounceMs > 0 && mode === "onChange") {
                return await debouncePromise(run, debounceMs, controller.signal);
            }
            return await run(controller.signal);
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return false;
            }
            throw error;
        }
    };

    const validateFormInternal = async (paths?: readonly string[]): Promise<boolean> => {
        assertActive();
        const names = paths ?? [...fields.keys()];
        let valid = true;
        for (const name of names) {
            const okField = await validateFieldInternal(name, "onSubmit");
            if (!okField) {
                valid = false;
            }
        }
        if (formValidators.length > 0 && (!paths || paths.length === 0)) {
            const formResult = await runValidators(formValidators, values, {
                values,
                path: "",
            });
            clientIssues = formResult.issues;
            if (!formResult.valid) {
                valid = false;
            }
            for (const issue of formResult.issues) {
                if (issue.path) {
                    const state = getOrCreateField(issue.path);
                    state.meta.issues = [...state.meta.issues, issue];
                    recomputeFieldValidity(state);
                }
            }
        }
        notify();
        return valid && serverIssues.length === 0;
    };

    const controller: FormController<TValues> = {
        getValues: () => cloneValues(values),
        getDefaultValues: () => cloneValues(defaultValues),
        getValue: (path) => getAt(values, path),
        setValue: (path, value, setOptions) => {
            assertActive();
            const state = getOrCreateField(path);
            const nextValue = state.options.transform ? state.options.transform(value) : value;
            values = setAt(values, path, nextValue);
            const defaultValue = getAt(defaultValues, path);
            state.meta.dirty = !Object.is(nextValue, defaultValue);
            notify();
            if (setOptions?.validate !== false) {
                void validateFieldInternal(path, "onChange");
            }
        },
        getFieldMeta: (path) => {
            const state = fields.get(path);
            return state ? { ...state.meta, issues: [...state.meta.issues] } : emptyMeta();
        },
        getFormMeta: () => {
            let dirty = false;
            let touched = false;
            let pending = false;
            let invalid = serverIssues.length > 0 || clientIssues.length > 0;
            for (const state of fields.values()) {
                dirty = dirty || state.meta.dirty;
                touched = touched || state.meta.touched;
                pending = pending || state.meta.pending;
                invalid = invalid || state.meta.invalid;
            }
            return {
                dirty,
                touched,
                valid: !invalid && !pending,
                invalid,
                pending,
                submitting,
                submitCount,
            };
        },
        getFeedback: () => ({
            kind: feedback.kind,
            message: feedback.message,
            issues: [...feedback.issues],
        }),
        getFeedbackFlags: () => ({ ...feedbackFlags }),
        setFeedback: (next) => {
            assertActive();
            setFeedbackInternal(next);
        },
        clearFeedback: () => {
            assertActive();
            setFeedbackInternal(createIdleFeedback());
        },
        getIssues: () => collectIssues(),
        getFieldIssues: (path) => collectIssues().filter((issue) => issue.path === path),
        register: (name, registration) => {
            assertActive();
            const state =
                registration === undefined
                    ? getOrCreateField(name)
                    : getOrCreateField(name, registration);
            if (registration?.defaultValue !== undefined && getAt(values, name) === undefined) {
                values = setAt(values, name, registration.defaultValue);
            }
            state.meta.enabled = isEnabled(state.options, values);
            return {
                name,
                value: getAt(values, name),
                onChange: (value) => {
                    controller.setValue(name, value);
                },
                onBlur: () => {
                    state.meta.touched = true;
                    state.meta.visited = true;
                    notify();
                    void validateFieldInternal(name, "onBlur");
                },
                disabled: !state.meta.enabled,
                ...(state.meta.invalid ? { "aria-invalid": true } : {}),
            };
        },
        unregister: (name) => {
            assertActive();
            const state = fields.get(name);
            state?.abort?.abort();
            fields.delete(name);
            clientIssues = clientIssues.filter((issue) => issue.path !== name);
            serverIssues = serverIssues.filter((issue) => issue.path !== name);
            notify();
        },
        setTouched: (path, touched = true) => {
            const state = getOrCreateField(path);
            state.meta.touched = touched;
            notify();
        },
        setVisited: (path, visited = true) => {
            const state = getOrCreateField(path);
            state.meta.visited = visited;
            notify();
        },
        validateField: (path) => validateFieldInternal(path, "onSubmit"),
        validateForm: (paths) => validateFormInternal(paths),
        reset: (next) => {
            assertActive();
            if (next) {
                defaultValues = cloneValues(next);
            }
            values = cloneValues(defaultValues);
            for (const state of fields.values()) {
                state.abort?.abort();
                state.meta = emptyMeta(isEnabled(state.options, values));
            }
            clientIssues = [];
            serverIssues = [];
            submitting = false;
            feedback = createIdleFeedback();
            notify();
        },
        partialReset: (paths) => {
            assertActive();
            for (const path of paths) {
                values = setAt(values, path, getAt(defaultValues, path));
                const state = fields.get(path);
                if (state) {
                    state.abort?.abort();
                    state.meta = emptyMeta(isEnabled(state.options, values));
                }
                clientIssues = clientIssues.filter((issue) => issue.path !== path);
                serverIssues = serverIssues.filter((issue) => issue.path !== path);
            }
            notify();
        },
        setServerErrors: (issues) => {
            serverIssues = issues.map((issue) => ({ ...issue }));
            for (const issue of serverIssues) {
                if (!issue.path) {
                    continue;
                }
                const state = getOrCreateField(issue.path);
                state.meta.issues = [
                    ...state.meta.issues.filter((item) => item.code !== issue.code),
                    issue,
                ];
                recomputeFieldValidity(state);
            }
            if (feedbackFlags.error && issues.length > 0) {
                setFeedbackInternal(
                    createErrorFeedback(
                        issues[0]?.message ?? "Server rejected the submission.",
                        issues,
                    ),
                );
            } else {
                notify();
            }
        },
        clearServerErrors: (paths) => {
            if (!paths) {
                serverIssues = [];
            } else {
                const pathSet = new Set(paths);
                serverIssues = serverIssues.filter(
                    (issue) => !issue.path || !pathSet.has(issue.path),
                );
                for (const path of paths) {
                    const state = fields.get(path);
                    if (state) {
                        state.meta.issues = state.meta.issues.filter(
                            (issue) => issue.code !== "server",
                        );
                        recomputeFieldValidity(state);
                    }
                }
            }
            notify();
        },
        setErrors: (issues) => {
            clientIssues = issues.map((issue) => ({ ...issue }));
            for (const issue of issues) {
                if (!issue.path) {
                    continue;
                }
                const state = getOrCreateField(issue.path);
                state.meta.issues = [...state.meta.issues, issue];
                recomputeFieldValidity(state);
            }
            notify();
        },
        clearErrors: (paths) => {
            if (!paths) {
                clientIssues = [];
                for (const state of fields.values()) {
                    state.meta.issues = [];
                    recomputeFieldValidity(state);
                }
            } else {
                const pathSet = new Set(paths);
                clientIssues = clientIssues.filter(
                    (issue) => !issue.path || !pathSet.has(issue.path),
                );
                for (const path of paths) {
                    replaceIssuesForPath(path, []);
                }
            }
            notify();
        },
        handleSubmit: (handlers) => {
            return async (event) => {
                assertActive();
                event?.preventDefault?.();
                submitCount += 1;
                submitting = true;
                notify();
                const abort = new AbortController();
                try {
                    const valid = await validateFormInternal();
                    if (!valid) {
                        const issues = collectIssues();
                        if (feedbackFlags.validation || feedbackFlags.error) {
                            setFeedbackInternal(
                                createValidationFeedback(
                                    issues,
                                    handlers.errorMessage ?? "Please fix the highlighted fields.",
                                ),
                            );
                        }
                        await handlers.onInvalid?.(issues, cloneValues(values));
                        return;
                    }
                    try {
                        await handlers.onValid(cloneValues(values), { signal: abort.signal });
                        if (feedbackFlags.success) {
                            setFeedbackInternal(
                                createSuccessFeedback(
                                    handlers.successMessage ?? "Saved successfully.",
                                ),
                            );
                        }
                    } catch (error) {
                        if (feedbackFlags.error) {
                            const message =
                                handlers.errorMessage ??
                                (error instanceof Error ? error.message : "Something went wrong.");
                            setFeedbackInternal(createErrorFeedback(message));
                        }
                        throw error;
                    }
                } finally {
                    submitting = false;
                    notify();
                }
            };
        },
        createFieldArray: <TItem>(name: string, arrayOptions?: { defaultItem?: TItem }) => {
            assertActive();
            const existing = fieldArrays.get(name);
            if (existing) {
                return existing as FieldArrayController<TItem>;
            }
            const array = createFieldArrayController<TValues, TItem>({
                name,
                getValues: () => values,
                setValues: (next) => {
                    values = next;
                    notify();
                },
                ...(arrayOptions?.defaultItem === undefined
                    ? {}
                    : { defaultItem: arrayOptions.defaultItem }),
            });
            fieldArrays.set(name, array as FieldArrayController<unknown>);
            getOrCreateField(name, {});
            return array;
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose: () => {
            if (disposed) {
                return;
            }
            disposed = true;
            for (const state of fields.values()) {
                state.abort?.abort();
            }
            fields.clear();
            listeners.clear();
            fieldArrays.clear();
        },
    };

    return controller;
}
