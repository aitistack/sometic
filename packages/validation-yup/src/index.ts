import {
    createIssue,
    fail,
    ok,
    type ValidationIssue,
    type ValidationResult,
} from "@sometic/validation";
import { assertSchemaAdapter, type SchemaAdapter } from "@sometic/validation/schema";

export type YupValidationErrorLike = {
    name?: string;
    message: string;
    inner?: readonly YupValidationErrorLike[];
    path?: string;
    type?: string;
};

export type YupSchemaLike<T = unknown> = {
    validateSync(input: unknown, options?: { abortEarly?: boolean }): T;
    validate(input: unknown, options?: { abortEarly?: boolean; signal?: AbortSignal }): Promise<T>;
};

function isYupValidationError(error: unknown): error is YupValidationErrorLike {
    return (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        ((error as YupValidationErrorLike).name === "ValidationError" ||
            Array.isArray((error as YupValidationErrorLike).inner) ||
            typeof (error as YupValidationErrorLike).path === "string")
    );
}

export function issuesFromYupError(error: YupValidationErrorLike): ValidationIssue[] {
    const source = error.inner && error.inner.length > 0 ? error.inner : [error];
    const issues: ValidationIssue[] = [];
    for (const item of source) {
        const path = item.path;
        issues.push(
            createIssue(item.type ?? "yup", item.message, path === undefined ? {} : { path }),
        );
    }
    return issues;
}

export function createYupSchemaAdapter<T>(schema: YupSchemaLike<T>): SchemaAdapter<T> {
    const adapter: SchemaAdapter<T> = {
        parse(input) {
            return schema.validateSync(input, { abortEarly: false });
        },
        safeParse(input) {
            try {
                return { success: true, data: schema.validateSync(input, { abortEarly: false }) };
            } catch (error) {
                if (isYupValidationError(error)) {
                    return { success: false, issues: issuesFromYupError(error) };
                }
                throw error;
            }
        },
        validateAsync: async (input, options): Promise<ValidationResult> => {
            try {
                await schema.validate(input, {
                    abortEarly: false,
                    ...(options?.signal ? { signal: options.signal } : {}),
                });
                return ok();
            } catch (error) {
                if (isYupValidationError(error)) {
                    return fail(issuesFromYupError(error));
                }
                throw error;
            }
        },
    };
    assertSchemaAdapter(adapter);
    return adapter;
}
