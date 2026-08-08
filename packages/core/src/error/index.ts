export type SometicErrorOptions = {
    code: string;
    message: string;
    cause?: unknown;
    details?: Readonly<Record<string, unknown>>;
};

export class SometicError extends Error {
    readonly code: string;
    readonly details: Readonly<Record<string, unknown>> | undefined;
    override readonly cause: unknown;

    constructor(options: SometicErrorOptions) {
        super(options.message, options.cause === undefined ? undefined : { cause: options.cause });
        this.name = "SometicError";
        this.code = options.code;
        this.details = options.details;
        this.cause = options.cause;
    }
}

export function isSometicError(value: unknown): value is SometicError {
    return value instanceof SometicError;
}

export function createError(options: SometicErrorOptions): SometicError {
    return new SometicError(options);
}
