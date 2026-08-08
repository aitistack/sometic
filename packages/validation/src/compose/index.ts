import { mergeResults, ok, type ValidationResult } from "../issues.js";
import {
    normalizeResult,
    type AsyncValidator,
    type SyncValidator,
    type Validator,
    type ValidatorContext,
} from "../validators/index.js";

export function pipe(...validators: Validator[]): AsyncValidator {
    return async (value, context) => {
        const issues: ValidationResult["issues"] = [];
        for (const validator of validators) {
            const raw = await validator(value, context);
            const result = normalizeResult(raw, context.path);
            if (!result.valid) {
                return result;
            }
            issues.push(...result.issues);
        }
        return { valid: issues.length === 0, issues };
    };
}

export function all(...validators: Validator[]): AsyncValidator {
    return async (value, context) => {
        const results: ValidationResult[] = [];
        for (const validator of validators) {
            const raw = await validator(value, context);
            results.push(normalizeResult(raw, context.path));
        }
        return mergeResults(...results);
    };
}

export function any(...validators: Validator[]): AsyncValidator {
    return async (value, context) => {
        const results: ValidationResult[] = [];
        for (const validator of validators) {
            const raw = await validator(value, context);
            const result = normalizeResult(raw, context.path);
            if (result.valid) {
                return ok();
            }
            results.push(result);
        }
        return mergeResults(...results);
    };
}

export function when(
    predicate: (value: unknown, context: ValidatorContext) => boolean,
    validator: Validator,
): AsyncValidator {
    return async (value, context) => {
        if (!predicate(value, context)) {
            return ok();
        }
        return normalizeResult(await validator(value, context), context.path);
    };
}

export function refine(
    predicate: (value: unknown, context: ValidatorContext) => boolean | Promise<boolean>,
    message: string,
    code = "refine",
): AsyncValidator {
    return async (value, context) => {
        const passed = await predicate(value, context);
        if (passed) {
            return ok();
        }
        return normalizeResult({ code, message, path: context.path }, context.path);
    };
}

export function transform<TIn, TOut>(
    map: (value: TIn, context: ValidatorContext) => TOut,
    validator?: Validator<TOut>,
): AsyncValidator<TIn> {
    return async (value, context) => {
        const next = map(value, context);
        if (!validator) {
            return ok();
        }
        return normalizeResult(await validator(next, context), context.path);
    };
}

export function syncOnly(validator: SyncValidator): SyncValidator {
    return validator;
}
