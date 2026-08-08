import type { AuthController } from "@sometic/auth";
import { createHttpError } from "../errors.js";
import type { HttpReplayRequest } from "../replay.js";
import type { HttpInterceptor, HttpRequestConfig } from "../types.js";

export type { HttpReplayRequest };
export { createPolicyInterceptor, type PolicyInterceptorOptions } from "./policy.js";

export type AuthInterceptorOptions = {
    auth: AuthController;
    headerName?: string;
    scheme?: string;
    isUnauthorized?: (response: { status: number }, config: HttpRequestConfig) => boolean;
    exclude?: (config: HttpRequestConfig) => boolean;
    getAccessToken?: (auth: AuthController) => string | null | undefined;
    getEpoch?: (auth: AuthController) => number;
};

export function createAuthInterceptor(options: AuthInterceptorOptions): HttpInterceptor {
    const headerName = options.headerName ?? "Authorization";
    const scheme = options.scheme ?? "Bearer";
    let refreshInflight: Promise<void> | null = null;

    const readEpoch = (): number => {
        if (options.getEpoch) {
            return options.getEpoch(options.auth);
        }
        if (typeof options.auth.getEpoch === "function") {
            return options.auth.getEpoch();
        }
        return options.auth.getSession().epoch ?? 0;
    };

    const getToken = (): string | null => {
        if (options.getAccessToken) {
            return options.getAccessToken(options.auth) ?? null;
        }
        return options.auth.getSession().tokens?.accessToken ?? null;
    };

    const excluded = (config: HttpRequestConfig): boolean => {
        if (options.exclude) {
            return options.exclude(config);
        }
        const url = config.url.toLowerCase();
        return (
            url.includes("/login") ||
            url.includes("/signin") ||
            url.includes("/sign-in") ||
            url.includes("/refresh") ||
            url.includes("/register") ||
            url.includes("/signup")
        );
    };

    const isUnauthorized = (status: number, config: HttpRequestConfig): boolean => {
        if (options.isUnauthorized) {
            return options.isUnauthorized({ status }, config);
        }
        return status === 401;
    };

    return {
        onRequest: (config) => {
            const epoch = readEpoch();
            const token = getToken();
            const headers = { ...config.headers };
            if (token) {
                headers[headerName] = `${scheme} ${token}`.trim();
            }
            return {
                ...config,
                headers,
                meta: {
                    ...config.meta,
                    sessionEpoch: epoch,
                },
            };
        },
        onError: async (error, config) => {
            const status =
                typeof error === "object" &&
                error &&
                "details" in error &&
                typeof (error as { details?: { status?: number } }).details?.status === "number"
                    ? (error as { details: { status: number } }).details.status
                    : null;
            if (
                status === null ||
                !isUnauthorized(status, config) ||
                excluded(config) ||
                config.meta?.authRetried === true
            ) {
                return error;
            }

            const requestEpoch =
                typeof config.meta?.sessionEpoch === "number" ? config.meta.sessionEpoch : null;
            if (requestEpoch !== null && requestEpoch !== readEpoch()) {
                return createHttpError(
                    "HTTP_SESSION_STALE",
                    "Refusing auth replay after session epoch change",
                );
            }

            if (!refreshInflight) {
                refreshInflight = (async () => {
                    const session = await options.auth.handleUnauthorized();
                    if (session.status !== "authenticated" && session.status !== "refreshing") {
                        throw createHttpError(
                            "HTTP_UNAUTHORIZED",
                            "Session refresh failed after unauthorized response",
                        );
                    }
                })().finally(() => {
                    refreshInflight = null;
                });
            }

            try {
                await refreshInflight;
            } catch (refreshError) {
                return refreshError;
            }

            if (requestEpoch !== null && requestEpoch !== readEpoch()) {
                return createHttpError(
                    "HTTP_SESSION_STALE",
                    "Refusing auth replay after session epoch change",
                );
            }

            const replay: HttpReplayRequest = {
                __httpReplay: true,
                config: {
                    ...config,
                    meta: { ...config.meta, authRetried: true, sessionEpoch: readEpoch() },
                },
            };
            return replay;
        },
    };
}
