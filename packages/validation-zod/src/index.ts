import { createIssue, fail, ok, type ValidationIssue } from "@sometic/validation";
import {
    assertSchemaAdapter,
    type SchemaAdapter,
    type SchemaSafeParseResult,
} from "@sometic/validation/schema";
import { joinPath } from "@sometic/validation/path";

export type ZodIssueLike = {
    message: string;
    path: readonly (string | number)[];
    code?: string;
};

export type ZodErrorLike = {
    issues: readonly ZodIssueLike[];
};

export type ZodSchemaLike<T = unknown> = {
    parse(input: unknown): T;
    safeParse(input: unknown): { success: true; data: T } | { success: false; error: ZodErrorLike };
};

function pathFromZod(path: readonly (string | number)[]): string | undefined {
    if (path.length === 0) {
        return undefined;
    }
    return joinPath([...path]);
}

export function issuesFromZodError(error: ZodErrorLike): ValidationIssue[] {
    return error.issues.map((issue) => {
        const path = pathFromZod(issue.path);
        return createIssue(issue.code ?? "zod", issue.message, path === undefined ? {} : { path });
    });
}

export function createZodSchemaAdapter<T>(schema: ZodSchemaLike<T>): SchemaAdapter<T> {
    const adapter: SchemaAdapter<T> = {
        parse(input) {
            return schema.parse(input);
        },
        safeParse(input): SchemaSafeParseResult<T> {
            const result = schema.safeParse(input);
            if (result.success) {
                return { success: true, data: result.data };
            }
            return { success: false, issues: issuesFromZodError(result.error) };
        },
        validateAsync: async (input) => {
            const result = schema.safeParse(input);
            if (result.success) {
                return ok();
            }
            return fail(issuesFromZodError(result.error));
        },
    };
    assertSchemaAdapter(adapter);
    return adapter;
}
