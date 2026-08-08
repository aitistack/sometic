import { createIssue, fail, ok, type ValidationIssue, type ValidationResult } from "../issues.js";

export type ValidatorContext = {
    values: unknown;
    path: string;
    signal?: AbortSignal;
};

export type SyncValidator<T = unknown> = (
    value: T,
    context: ValidatorContext,
) => ValidationResult | ValidationIssue | ValidationIssue[] | null | undefined | void;

export type AsyncValidator<T = unknown> = (
    value: T,
    context: ValidatorContext,
) =>
    | ValidationResult
    | ValidationIssue
    | ValidationIssue[]
    | null
    | undefined
    | void
    | Promise<ValidationResult | ValidationIssue | ValidationIssue[] | null | undefined | void>;

export type Validator<T = unknown> = SyncValidator<T> | AsyncValidator<T>;

export function normalizeResult(
    result: ValidationResult | ValidationIssue | ValidationIssue[] | null | undefined | void,
    path: string,
): ValidationResult {
    if (result == null) {
        return ok();
    }
    if (typeof result === "object" && "valid" in result && "issues" in result) {
        return {
            valid: result.valid,
            issues: result.issues.map((issue) =>
                issue.path === undefined ? { ...issue, path } : issue,
            ),
        };
    }
    const issues = Array.isArray(result) ? result : [result];
    return fail(issues.map((issue) => (issue.path === undefined ? { ...issue, path } : issue)));
}

export function required(message = "Required"): SyncValidator {
    return (value, context) => {
        if (value === null || value === undefined) {
            return createIssue("required", message, { path: context.path });
        }
        if (typeof value === "string" && value.trim() === "") {
            return createIssue("required", message, { path: context.path });
        }
        if (Array.isArray(value) && value.length === 0) {
            return createIssue("required", message, { path: context.path });
        }
        return ok();
    };
}

export function minLength(min: number, message?: string): SyncValidator {
    return (value, context) => {
        const length = typeof value === "string" || Array.isArray(value) ? value.length : undefined;
        if (length === undefined || length >= min) {
            return ok();
        }
        return createIssue("minLength", message ?? `Must be at least ${min} characters`, {
            path: context.path,
            params: { min },
        });
    };
}

export function maxLength(max: number, message?: string): SyncValidator {
    return (value, context) => {
        const length = typeof value === "string" || Array.isArray(value) ? value.length : undefined;
        if (length === undefined || length <= max) {
            return ok();
        }
        return createIssue("maxLength", message ?? `Must be at most ${max} characters`, {
            path: context.path,
            params: { max },
        });
    };
}

export function pattern(regex: RegExp, message = "Invalid format"): SyncValidator {
    return (value, context) => {
        if (value === null || value === undefined || value === "") {
            return ok();
        }
        if (typeof value !== "string" || !regex.test(value)) {
            return createIssue("pattern", message, { path: context.path });
        }
        return ok();
    };
}

const EMAIL =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function email(message = "Invalid email"): SyncValidator {
    return pattern(EMAIL, message);
}

export function url(message = "Invalid URL"): SyncValidator {
    return (value, context) => {
        if (value === null || value === undefined || value === "") {
            return ok();
        }
        if (typeof value !== "string") {
            return createIssue("url", message, { path: context.path });
        }
        try {
            new URL(value);
            return ok();
        } catch {
            return createIssue("url", message, { path: context.path });
        }
    };
}

export function min(minValue: number, message?: string): SyncValidator {
    return (value, context) => {
        if (value === null || value === undefined || value === "") {
            return ok();
        }
        const number = typeof value === "number" ? value : Number(value);
        if (Number.isNaN(number) || number < minValue) {
            return createIssue("min", message ?? `Must be at least ${minValue}`, {
                path: context.path,
                params: { min: minValue },
            });
        }
        return ok();
    };
}

export function max(maxValue: number, message?: string): SyncValidator {
    return (value, context) => {
        if (value === null || value === undefined || value === "") {
            return ok();
        }
        const number = typeof value === "number" ? value : Number(value);
        if (Number.isNaN(number) || number > maxValue) {
            return createIssue("max", message ?? `Must be at most ${maxValue}`, {
                path: context.path,
                params: { max: maxValue },
            });
        }
        return ok();
    };
}

export function integer(message = "Must be an integer"): SyncValidator {
    return (value, context) => {
        if (value === null || value === undefined || value === "") {
            return ok();
        }
        const number = typeof value === "number" ? value : Number(value);
        if (!Number.isInteger(number)) {
            return createIssue("integer", message, { path: context.path });
        }
        return ok();
    };
}

export function oneOf(options: readonly unknown[], message = "Invalid option"): SyncValidator {
    return (value, context) => {
        if (value === null || value === undefined || value === "") {
            return ok();
        }
        if (!options.includes(value)) {
            return createIssue("oneOf", message, {
                path: context.path,
                params: { options: [...options] },
            });
        }
        return ok();
    };
}

export function custom(
    predicate: (value: unknown, context: ValidatorContext) => boolean,
    message = "Invalid value",
    code = "custom",
): SyncValidator {
    return (value, context) => {
        if (predicate(value, context)) {
            return ok();
        }
        return createIssue(code, message, { path: context.path });
    };
}

export async function runValidators(
    validators: readonly Validator[],
    value: unknown,
    context: ValidatorContext,
): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    for (const validator of validators) {
        if (context.signal?.aborted) {
            break;
        }
        const raw = await validator(value, context);
        const result = normalizeResult(raw, context.path);
        issues.push(...result.issues);
    }
    return { valid: issues.length === 0, issues };
}
