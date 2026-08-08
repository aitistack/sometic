import { createError, type SometicError } from "@sometic/core/error";

export const AUTH_ERROR_CODES = {
    unsupported: "AUTH_UNSUPPORTED",
    invalidSession: "AUTH_INVALID_SESSION",
    refreshFailed: "AUTH_REFRESH_FAILED",
    refreshInFlight: "AUTH_REFRESH_IN_FLIGHT",
    credentialsInvalid: "AUTH_CREDENTIALS_INVALID",
    storageFailed: "AUTH_STORAGE_FAILED",
    disposed: "AUTH_DISPOSED",
    unauthorized: "AUTH_UNAUTHORIZED",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export function createAuthError(
    code: AuthErrorCode,
    message: string,
    details?: Readonly<Record<string, unknown>>,
): SometicError {
    return createError({
        code,
        message,
        ...(details === undefined ? {} : { details }),
    });
}
