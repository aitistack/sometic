import { createIssue, fail, ok, type ValidationIssue } from "../issues.js";
import { joinPath, parsePath } from "../path/index.js";
import { fromSchema, type SchemaAdapter, type SchemaSafeParseResult } from "../schema/index.js";

export type SchemaType<T = unknown> = {
    readonly _type: T;
    safeParse(input: unknown, path?: string): SchemaSafeParseResult<T>;
    parse(input: unknown): T;
};

export type InferSchema<T extends SchemaType> = T["_type"];

type StringChecks = {
    min?: number;
    max?: number;
    email?: boolean;
    url?: boolean;
    pattern?: RegExp;
    nonempty?: boolean;
    message?: Partial<
        Record<"type" | "min" | "max" | "email" | "url" | "pattern" | "nonempty", string>
    >;
};

type NumberChecks = {
    min?: number;
    max?: number;
    int?: boolean;
    message?: Partial<Record<"type" | "min" | "max" | "int", string>>;
};

const EMAIL =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function pathOpts(path: string): { path?: string } {
    return path === "" ? {} : { path };
}

function failure(issues: ValidationIssue[]): SchemaSafeParseResult<never> {
    return { success: false, issues };
}

function makeSchema<T>(
    parseValue: (input: unknown, path: string) => SchemaSafeParseResult<T>,
): SchemaType<T> {
    return {
        safeParse(input, path = "") {
            return parseValue(input, path);
        },
        parse(input) {
            const result = parseValue(input, "");
            if (!result.success) {
                throw new Error(result.issues[0]?.message ?? "Invalid input");
            }
            return result.data;
        },
    } as SchemaType<T>;
}

export function string(checks: StringChecks = {}): SchemaType<string> {
    return makeSchema((input, path) => {
        if (typeof input !== "string") {
            return failure([
                createIssue(
                    "invalid_type",
                    checks.message?.type ?? "Expected string",
                    pathOpts(path),
                ),
            ]);
        }
        if (checks.nonempty && input.trim() === "") {
            return failure([
                createIssue("nonempty", checks.message?.nonempty ?? "Required", pathOpts(path)),
            ]);
        }
        if (checks.min !== undefined && input.length < checks.min) {
            return failure([
                createIssue(
                    "minLength",
                    checks.message?.min ?? `Must be at least ${checks.min} characters`,
                    { ...pathOpts(path), params: { min: checks.min } },
                ),
            ]);
        }
        if (checks.max !== undefined && input.length > checks.max) {
            return failure([
                createIssue(
                    "maxLength",
                    checks.message?.max ?? `Must be at most ${checks.max} characters`,
                    { ...pathOpts(path), params: { max: checks.max } },
                ),
            ]);
        }
        if (checks.email && !EMAIL.test(input)) {
            return failure([
                createIssue("email", checks.message?.email ?? "Invalid email", pathOpts(path)),
            ]);
        }
        if (checks.url) {
            try {
                new URL(input);
            } catch {
                return failure([
                    createIssue("url", checks.message?.url ?? "Invalid URL", pathOpts(path)),
                ]);
            }
        }
        if (checks.pattern && !checks.pattern.test(input)) {
            return failure([
                createIssue("pattern", checks.message?.pattern ?? "Invalid format", pathOpts(path)),
            ]);
        }
        return { success: true, data: input };
    });
}

export function number(checks: NumberChecks = {}): SchemaType<number> {
    return makeSchema((input, path) => {
        let num: number;
        if (typeof input === "number") {
            num = input;
        } else if (typeof input === "string" && input.trim() !== "") {
            num = Number(input);
        } else {
            return failure([
                createIssue(
                    "invalid_type",
                    checks.message?.type ?? "Expected number",
                    pathOpts(path),
                ),
            ]);
        }
        if (Number.isNaN(num)) {
            return failure([
                createIssue(
                    "invalid_type",
                    checks.message?.type ?? "Expected number",
                    pathOpts(path),
                ),
            ]);
        }
        if (checks.int && !Number.isInteger(num)) {
            return failure([
                createIssue("integer", checks.message?.int ?? "Must be an integer", pathOpts(path)),
            ]);
        }
        if (checks.min !== undefined && num < checks.min) {
            return failure([
                createIssue("min", checks.message?.min ?? `Must be at least ${checks.min}`, {
                    ...pathOpts(path),
                    params: { min: checks.min },
                }),
            ]);
        }
        if (checks.max !== undefined && num > checks.max) {
            return failure([
                createIssue("max", checks.message?.max ?? `Must be at most ${checks.max}`, {
                    ...pathOpts(path),
                    params: { max: checks.max },
                }),
            ]);
        }
        return { success: true, data: num };
    });
}

export function boolean(message = "Expected boolean"): SchemaType<boolean> {
    return makeSchema((input, path) => {
        if (typeof input !== "boolean") {
            return failure([createIssue("invalid_type", message, pathOpts(path))]);
        }
        return { success: true, data: input };
    });
}

export function literal<T extends string | number | boolean>(
    value: T,
    message?: string,
): SchemaType<T> {
    return makeSchema((input, path) => {
        if (input !== value) {
            return failure([
                createIssue("literal", message ?? `Expected ${String(value)}`, {
                    ...pathOpts(path),
                    params: { expected: value },
                }),
            ]);
        }
        return { success: true, data: value };
    });
}

export function optional<T>(schema: SchemaType<T>): SchemaType<T | undefined> {
    return makeSchema((input, path) => {
        if (input === undefined) {
            return { success: true, data: undefined };
        }
        return schema.safeParse(input, path) as SchemaSafeParseResult<T | undefined>;
    });
}

export function nullable<T>(schema: SchemaType<T>): SchemaType<T | null> {
    return makeSchema((input, path) => {
        if (input === null) {
            return { success: true, data: null };
        }
        return schema.safeParse(input, path) as SchemaSafeParseResult<T | null>;
    });
}

export function array<T>(item: SchemaType<T>, message = "Expected array"): SchemaType<T[]> {
    return makeSchema((input, path) => {
        if (!Array.isArray(input)) {
            return failure([createIssue("invalid_type", message, pathOpts(path))]);
        }
        const data: T[] = [];
        const issues: ValidationIssue[] = [];
        for (let index = 0; index < input.length; index += 1) {
            const childPath = joinPath([...parsePath(path), index]);
            const result = item.safeParse(input[index], childPath);
            if (result.success) {
                data.push(result.data);
            } else {
                issues.push(...result.issues);
            }
        }
        if (issues.length > 0) {
            return { success: false, issues };
        }
        return { success: true, data };
    });
}

export function object<T extends Record<string, SchemaType>>(
    shape: T,
    message = "Expected object",
): SchemaType<{ [K in keyof T]: InferSchema<T[K]> }> {
    type Output = { [K in keyof T]: InferSchema<T[K]> };
    return makeSchema((input, path) => {
        if (input === null || typeof input !== "object" || Array.isArray(input)) {
            return failure([createIssue("invalid_type", message, pathOpts(path))]);
        }
        const record = input as Record<string, unknown>;
        const data: Record<string, unknown> = {};
        const issues: ValidationIssue[] = [];
        for (const key of Object.keys(shape) as Array<keyof T & string>) {
            const child = shape[key];
            if (!child) {
                continue;
            }
            const childPath = path === "" ? key : joinPath([...parsePath(path), key]);
            const result = child.safeParse(record[key], childPath);
            if (result.success) {
                if (result.data !== undefined) {
                    data[key] = result.data;
                }
            } else {
                issues.push(...result.issues);
            }
        }
        if (issues.length > 0) {
            return { success: false, issues };
        }
        return { success: true, data: data as Output };
    });
}

export function union<T extends readonly [SchemaType, ...SchemaType[]]>(
    options: T,
    message = "Invalid input",
): SchemaType<InferSchema<T[number]>> {
    return makeSchema((input, path) => {
        for (const option of options) {
            const result = option.safeParse(input, path);
            if (result.success) {
                return result as SchemaSafeParseResult<InferSchema<T[number]>>;
            }
        }
        return failure([createIssue("union", message, pathOpts(path))]);
    });
}

export function refine<T>(
    schema: SchemaType<T>,
    predicate: (value: T) => boolean,
    message: string,
    code = "custom",
): SchemaType<T> {
    return makeSchema((input, path) => {
        const result = schema.safeParse(input, path);
        if (!result.success) {
            return result;
        }
        if (!predicate(result.data)) {
            return failure([createIssue(code, message, pathOpts(path))]);
        }
        return result;
    });
}

export function defineSchema<T>(schema: SchemaType<T>): SchemaAdapter<T> {
    return {
        parse: (input) => schema.parse(input),
        safeParse: (input) => schema.safeParse(input),
        validateAsync: async (input) => {
            const result = schema.safeParse(input);
            if (result.success) {
                return ok();
            }
            return fail(result.issues);
        },
    };
}

export { fromSchema };
