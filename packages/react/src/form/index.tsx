import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useSyncExternalStore,
    type FormEvent,
    type ReactNode,
} from "react";
import {
    createForm,
    type CreateFormOptions,
    type FieldArrayController,
    type FieldMeta,
    type FieldRegistrationOptions,
    type FormController,
    type FormMeta,
    type SubmitHandlers,
} from "@sometic/forms";

const FormContext = createContext<FormController<Record<string, unknown>> | null>(null);

export type UseFormResult<TValues extends Record<string, unknown>> = FormController<TValues>;

export function useForm<TValues extends Record<string, unknown>>(
    options: CreateFormOptions<TValues>,
): UseFormResult<TValues> {
    const formRef = useRef<FormController<TValues> | null>(null);
    if (!formRef.current) {
        formRef.current = createForm(options);
    }
    return formRef.current;
}

export function FormProvider(props: {
    form: FormController<Record<string, unknown>>;
    children: ReactNode;
}): ReactNode {
    return createElement(FormContext.Provider, { value: props.form }, props.children);
}

export function useFormContext(): FormController<Record<string, unknown>> {
    const form = useContext(FormContext);
    if (!form) {
        throw new Error("useFormContext requires FormProvider");
    }
    return form;
}

export function useFormState(form: FormController<Record<string, unknown>>): {
    values: Record<string, unknown>;
    meta: FormMeta;
} {
    const subscribe = useCallback(
        (onStoreChange: () => void) => form.subscribe(onStoreChange),
        [form],
    );
    const getSnapshot = useCallback(
        () => ({
            values: form.getValues(),
            meta: form.getFormMeta(),
        }),
        [form],
    );
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFormField(
    name: string,
    options?: FieldRegistrationOptions,
    formProp?: FormController<Record<string, unknown>>,
): {
    value: unknown;
    meta: FieldMeta;
    setValue: (value: unknown) => void;
    onBlur: () => void;
    form: FormController<Record<string, unknown>>;
} {
    const contextForm = useContext(FormContext);
    const form = formProp ?? contextForm;
    if (!form) {
        throw new Error("useFormField requires a form or FormProvider");
    }
    const optionsRef = useRef(options);
    optionsRef.current = options;
    useEffect(() => {
        form.register(name, optionsRef.current);
        return () => {
            form.unregister(name);
        };
    }, [form, name]);
    const subscribe = useCallback(
        (onStoreChange: () => void) => form.subscribe(onStoreChange),
        [form],
    );
    const getSnapshot = useCallback(
        () => ({
            value: form.getValue(name),
            meta: form.getFieldMeta(name),
        }),
        [form, name],
    );
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return {
        value: snapshot.value,
        meta: snapshot.meta,
        setValue: (value) => {
            form.setValue(name, value);
        },
        onBlur: () => {
            form.setTouched(name, true);
            form.setVisited(name, true);
            void form.validateField(name);
        },
        form,
    };
}

export function useFieldArray<TItem>(
    name: string,
    options?: { defaultItem?: TItem },
    formProp?: FormController<Record<string, unknown>>,
): FieldArrayController<TItem> {
    const contextForm = useContext(FormContext);
    const form = formProp ?? contextForm;
    if (!form) {
        throw new Error("useFieldArray requires a form or FormProvider");
    }
    return useMemo(() => {
        if (options?.defaultItem === undefined) {
            return form.createFieldArray<TItem>(name);
        }
        return form.createFieldArray<TItem>(name, { defaultItem: options.defaultItem });
    }, [form, name, options?.defaultItem]);
}

export type FormProps = {
    form: FormController<Record<string, unknown>>;
    children: ReactNode;
    onValid: SubmitHandlers<Record<string, unknown>>["onValid"];
    onInvalid?: SubmitHandlers<Record<string, unknown>>["onInvalid"];
    className?: string;
};

export function Form(props: FormProps): ReactNode {
    const submit = props.form.handleSubmit({
        onValid: props.onValid,
        ...(props.onInvalid === undefined ? {} : { onInvalid: props.onInvalid }),
    });
    return createElement(FormProvider, {
        form: props.form,
        children: createElement(
            "form",
            {
                className: props.className,
                noValidate: true,
                onSubmit: (event: FormEvent<HTMLFormElement>) => {
                    void submit(event);
                },
            },
            props.children,
        ),
    });
}
