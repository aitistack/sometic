import { createError, type SometicError } from "@sometic/core/error";

export const HTTP_ERROR_CODES = {
    network: "HTTP_NETWORK",
    timeout: "HTTP_TIMEOUT",
    aborted: "HTTP_ABORTED",
    status: "HTTP_STATUS",
    parse: "HTTP_PARSE",
    unauthorized: "HTTP_UNAUTHORIZED",
    disposed: "HTTP_DISPOSED",
    invalidUrl: "HTTP_INVALID_URL",
    sessionStale: "HTTP_SESSION_STALE",
    policyDenied: "HTTP_POLICY_DENIED",
    responseTooLarge: "HTTP_RESPONSE_TOO_LARGE",
} as const;

export type HttpErrorCode = (typeof HTTP_ERROR_CODES)[keyof typeof HTTP_ERROR_CODES];

export function createHttpError(
    code: HttpErrorCode,
    message: string,
    details?: Readonly<Record<string, unknown>>,
): SometicError {
    return createError({
        code,
        message,
        ...(details === undefined ? {} : { details }),
    });
}
