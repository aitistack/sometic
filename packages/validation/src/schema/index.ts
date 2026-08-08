import { fail, ok, type ValidationIssue, type ValidationResult } from "../issues.js";
import { joinPath, parsePath } from "../path/index.js";
import type { Validator } from "../validators/index.js";

export type SchemaParseSuccess<T> = {
    success: true;
    data: T;
};

export type SchemaParseFailure = {
    success: false;
    issues: ValidationIssue[];
};

export type SchemaSafeParseResult<T> = SchemaParseSuccess<T> | SchemaParseFailure;

export type SchemaAdapter<T = unknown> = {
    parse(input: unknown): T;
    safeParse(input: unknown): SchemaSafeParseResult<T>;
    validateAsync?(input: unknown, options?: { signal?: AbortSignal }): Promise<ValidationResult>;
};

export function assertSchemaAdapter(adapter: SchemaAdapter): void {
    if (typeof adapter.parse !== "function" || typeof adapter.safeParse !== "function") {
        throw new Error("SchemaAdapter requires parse and safeParse");
    }
}

export function fromSchema<T>(adapter: SchemaAdapter<T>): Validator {
    return (value, context) => {
        const result = adapter.safeParse(value);
        if (result.success) {
            return ok();
        }
        const base = context.path;
        return fail(
            result.issues.map((issue) => {
                if (!issue.path) {
                    return base ? { ...issue, path: base } : issue;
                }
                if (!base) {
                    return issue;
                }
                return {
                    ...issue,
                    path: joinPath([...parsePath(base), ...parsePath(issue.path)]),
                };
            }),
        );
    };
}
