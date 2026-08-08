import {
    computed,
    defineComponent,
    h,
    inject,
    onScopeDispose,
    provide,
    reactive,
    shallowRef,
    type ComputedRef,
    type InjectionKey,
    type PropType,
    type ShallowRef,
} from "vue";
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

const formKey: InjectionKey<FormController<Record<string, unknown>>> = Symbol("sometic-form");

export function useForm<TValues extends Record<string, unknown>>(
    options: CreateFormOptions<TValues>,
): {
    form: FormController<TValues>;
    values: ComputedRef<TValues>;
    meta: ComputedRef<FormMeta>;
} {
    const form = createForm(options);
    const version = shallowRef(0);
    const unsubscribe = form.subscribe(() => {
        version.value += 1;
    });
    onScopeDispose(() => {
        unsubscribe();
        form.dispose();
    });
    return {
        form,
        values: computed(() => {
            void version.value;
            return form.getValues();
        }),
        meta: computed(() => {
            void version.value;
            return form.getFormMeta();
        }),
    };
}

export function useFormContext(): FormController<Record<string, unknown>> {
    const form = inject(formKey, null);
    if (!form) {
        throw new Error("useFormContext requires FormProvider");
    }
    return form;
}

export const FormProvider = defineComponent({
    name: "SometicFormProvider",
    props: {
        form: {
            type: Object as PropType<FormController<Record<string, unknown>>>,
            required: true,
        },
    },
    setup(props, { slots }) {
        provide(formKey, props.form);
        return () => slots.default?.();
    },
});

export const Form = defineComponent({
    name: "SometicForm",
    props: {
        form: {
            type: Object as PropType<FormController<Record<string, unknown>>>,
            required: true,
        },
        onValid: {
            type: Function as PropType<SubmitHandlers<Record<string, unknown>>["onValid"]>,
            required: true,
        },
        onInvalid: {
            type: Function as PropType<SubmitHandlers<Record<string, unknown>>["onInvalid"]>,
            required: false,
        },
        className: { type: String, required: false },
    },
    setup(props, { slots }) {
        provide(formKey, props.form);
        return () => {
            const submit = props.form.handleSubmit({
                onValid: props.onValid,
                ...(props.onInvalid === undefined ? {} : { onInvalid: props.onInvalid }),
            });
            return h(
                "form",
                {
                    class: props.className,
                    novalidate: true,
                    onSubmit: (event: Event) => {
                        void submit(event);
                    },
                },
                slots.default?.(),
            );
        };
    },
});

export function useFormField(
    formOrName: FormController<Record<string, unknown>> | string,
    nameOrOptions?: string | FieldRegistrationOptions,
    optionsArg?: FieldRegistrationOptions,
): {
    value: ShallowRef<unknown>;
    meta: ComputedRef<FieldMeta>;
    setValue: (value: unknown) => void;
    onBlur: () => void;
    form: FormController<Record<string, unknown>>;
} {
    let form: FormController<Record<string, unknown>>;
    let name: string;
    let options: FieldRegistrationOptions | undefined;
    if (typeof formOrName === "string") {
        form = useFormContext();
        name = formOrName;
        options = nameOrOptions as FieldRegistrationOptions | undefined;
    } else {
        form = formOrName;
        name = nameOrOptions as string;
        options = optionsArg;
    }
    form.register(name, options);
    const version = shallowRef(0);
    const unsubscribe = form.subscribe(() => {
        version.value += 1;
    });
    onScopeDispose(() => {
        unsubscribe();
        form.unregister(name);
    });
    const value = shallowRef(form.getValue(name));
    form.subscribe(() => {
        value.value = form.getValue(name);
    });
    return {
        value,
        meta: computed(() => {
            void version.value;
            return form.getFieldMeta(name);
        }),
        setValue: (next) => {
            form.setValue(name, next);
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
    formOrName: FormController<Record<string, unknown>> | string,
    nameOrOptions?: string | { defaultItem?: TItem },
    optionsArg?: { defaultItem?: TItem },
): FieldArrayController<TItem> {
    let form: FormController<Record<string, unknown>>;
    let name: string;
    let options: { defaultItem?: TItem } | undefined;
    if (typeof formOrName === "string") {
        form = useFormContext();
        name = formOrName;
        options = nameOrOptions as { defaultItem?: TItem } | undefined;
    } else {
        form = formOrName;
        name = nameOrOptions as string;
        options = optionsArg;
    }
    if (options?.defaultItem === undefined) {
        return form.createFieldArray<TItem>(name);
    }
    return form.createFieldArray<TItem>(name, { defaultItem: options.defaultItem });
}

export function useFormState(form: FormController<Record<string, unknown>>): {
    values: Record<string, unknown>;
    meta: FormMeta;
} {
    const state = reactive({
        values: form.getValues() as Record<string, unknown>,
        meta: form.getFormMeta(),
    });
    const unsubscribe = form.subscribe(() => {
        state.values = form.getValues();
        state.meta = form.getFormMeta();
    });
    onScopeDispose(unsubscribe);
    return state;
}
