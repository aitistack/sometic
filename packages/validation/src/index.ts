import {
    createIssue,
    fail,
    issuesForPath,
    mergeResults,
    ok,
    type ValidationIssue,
    type ValidationResult,
} from "./issues.js";

export type { ValidationIssue, ValidationResult };

export { createIssue, fail, issuesForPath, mergeResults, ok };

export { deleteAt, getAt, joinPath, parsePath, setAt, type PathSegment } from "./path/index.js";

export {
    custom,
    email,
    integer,
    max,
    maxLength,
    min,
    minLength,
    normalizeResult,
    oneOf,
    pattern,
    required,
    runValidators,
    url,
    type AsyncValidator,
    type SyncValidator,
    type Validator,
    type ValidatorContext,
} from "./validators/index.js";

export { all, any, pipe, refine, syncOnly, transform, when } from "./compose/index.js";

export {
    assertSchemaAdapter,
    fromSchema,
    type SchemaAdapter,
    type SchemaParseFailure,
    type SchemaParseSuccess,
    type SchemaSafeParseResult,
} from "./schema/index.js";

export type RunValidationOptions = {
    signal?: AbortSignal;
    debounceMs?: number;
};

export function debouncePromise<T>(
    factory: (signal: AbortSignal) => Promise<T>,
    debounceMs: number,
    signal?: AbortSignal,
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        if (signal?.aborted) {
            reject(createAbortError());
            return;
        }
        const timer = setTimeout(() => {
            const nested = new AbortController();
            const onAbort = (): void => {
                nested.abort();
            };
            signal?.addEventListener("abort", onAbort, { once: true });
            factory(nested.signal)
                .then(resolve, reject)
                .finally(() => {
                    signal?.removeEventListener("abort", onAbort);
                });
        }, debounceMs);
        const cancel = (): void => {
            clearTimeout(timer);
            reject(createAbortError());
        };
        signal?.addEventListener("abort", cancel, { once: true });
    });
}

function createAbortError(): Error {
    const error = new Error("Aborted");
    error.name = "AbortError";
    return error;
}
