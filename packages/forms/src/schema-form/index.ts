import type { Validator } from "@sometic/validation";
import { createForm, type FormController } from "../create-form.js";
import type {
    CreateFormOptions,
    FieldRegistrationOptions,
    RegisterResult,
    ValidationMode,
} from "../types.js";

export type SchemaFieldType =
    "text" | "email" | "password" | "number" | "checkbox" | "select" | "textarea" | "date";

export type SchemaFieldOption = {
    value: string;
    label?: string;
    disabled?: boolean;
};

export type SchemaFieldDescriptor = {
    name: string;
    label?: string;
    type?: SchemaFieldType;
    description?: string;
    placeholder?: string;
    required?: boolean;
    defaultValue?: unknown;
    validators?: readonly Validator[];
    validateOn?: ValidationMode;
    debounceMs?: number;
    enabled?: boolean | ((values: unknown) => boolean);
    transform?: (value: unknown) => unknown;
    options?: readonly SchemaFieldOption[];
};

export type SchemaFormValues = Record<string, unknown>;

export type CreateSchemaFormOptions = Omit<CreateFormOptions<SchemaFormValues>, "defaultValues"> & {
    fields: readonly SchemaFieldDescriptor[];
    defaultValues?: SchemaFormValues;
};

export type SchemaFormController = FormController<SchemaFormValues> & {
    getFields(): readonly SchemaFieldDescriptor[];
    getField(name: string): SchemaFieldDescriptor | undefined;
    setFields(fields: readonly SchemaFieldDescriptor[]): void;
    registerField(name: string): RegisterResult;
    registerAll(): readonly RegisterResult[];
};

export function defaultValueForSchemaFieldType(type: SchemaFieldType | undefined): unknown {
    if (type === "number") {
        return null;
    }
    if (type === "checkbox") {
        return false;
    }
    return "";
}

export function listSchemaFieldNames(fields: readonly SchemaFieldDescriptor[]): string[] {
    return fields.map((field) => field.name);
}

export function buildSchemaFormDefaults(
    fields: readonly SchemaFieldDescriptor[],
): SchemaFormValues {
    const defaults: SchemaFormValues = {};
    for (const field of fields) {
        defaults[field.name] =
            field.defaultValue === undefined
                ? defaultValueForSchemaFieldType(field.type)
                : field.defaultValue;
    }
    return defaults;
}

function registrationFor(field: SchemaFieldDescriptor): FieldRegistrationOptions {
    return {
        ...(field.validators === undefined ? {} : { validators: field.validators }),
        ...(field.validateOn === undefined ? {} : { validateOn: field.validateOn }),
        ...(field.debounceMs === undefined ? {} : { debounceMs: field.debounceMs }),
        ...(field.enabled === undefined ? {} : { enabled: field.enabled }),
        ...(field.transform === undefined ? {} : { transform: field.transform }),
        ...(field.defaultValue === undefined
            ? { defaultValue: defaultValueForSchemaFieldType(field.type) }
            : { defaultValue: field.defaultValue }),
    };
}

export function createSchemaForm(options: CreateSchemaFormOptions): SchemaFormController {
    const { fields: initialFields, defaultValues, ...formOptions } = options;
    let fields = [...initialFields];

    const form = createForm<SchemaFormValues>({
        ...formOptions,
        defaultValues: {
            ...buildSchemaFormDefaults(fields),
            ...(defaultValues ?? {}),
        },
    });

    const registerDescriptor = (field: SchemaFieldDescriptor): RegisterResult =>
        form.register(field.name, registrationFor(field));

    for (const field of fields) {
        registerDescriptor(field);
    }

    return {
        ...form,
        getFields: () => fields.map((field) => ({ ...field })),
        getField: (name) => {
            const found = fields.find((field) => field.name === name);
            return found === undefined ? undefined : { ...found };
        },
        setFields(next) {
            const nextNames = new Set(next.map((field) => field.name));
            for (const field of fields) {
                if (!nextNames.has(field.name)) {
                    form.unregister(field.name);
                }
            }
            fields = [...next];
            for (const field of fields) {
                registerDescriptor(field);
            }
        },
        registerField(name) {
            const field = fields.find((entry) => entry.name === name);
            return field === undefined ? form.register(name) : registerDescriptor(field);
        },
        registerAll: () => fields.map((field) => registerDescriptor(field)),
    };
}
