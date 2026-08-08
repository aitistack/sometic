import type { ValidationIssue, Validator } from "@sometic/validation";
import type { FormFeedbackOption } from "./feedback.js";

export type ValidationMode = "onChange" | "onBlur" | "onSubmit" | "onTouched";

export type FieldMeta = {
    dirty: boolean;
    touched: boolean;
    visited: boolean;
    valid: boolean;
    invalid: boolean;
    pending: boolean;
    enabled: boolean;
    error?: string;
    issues: ValidationIssue[];
};

export type FormMeta = {
    dirty: boolean;
    touched: boolean;
    valid: boolean;
    invalid: boolean;
    pending: boolean;
    submitting: boolean;
    submitCount: number;
};

export type FieldRegistrationOptions = {
    validators?: readonly Validator[];
    debounceMs?: number;
    validateOn?: ValidationMode;
    enabled?: boolean | ((values: unknown) => boolean);
    transform?: (value: unknown) => unknown;
    defaultValue?: unknown;
};

export type RegisterResult = {
    name: string;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    disabled: boolean;
    "aria-invalid"?: boolean;
};

export type FormListener = () => void;

export type SubmitHandlers<TValues> = {
    onValid: (values: TValues, context: { signal: AbortSignal }) => void | Promise<void>;
    onInvalid?: (issues: ValidationIssue[], values: TValues) => void | Promise<void>;
    successMessage?: string;
    errorMessage?: string;
};

export type CreateFormOptions<TValues extends Record<string, unknown>> = {
    defaultValues: TValues;
    validators?: readonly Validator[];
    validationMode?: ValidationMode;
    debounceMs?: number;
    feedback?: FormFeedbackOption;
};
