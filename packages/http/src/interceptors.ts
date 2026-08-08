import type { HttpInterceptor, HttpRequestConfig, HttpResponse } from "./types.js";

export function composeInterceptors(interceptors: readonly HttpInterceptor[]): HttpInterceptor {
    return {
        onRequest: async (config) => {
            let next = config;
            for (const interceptor of interceptors) {
                if (interceptor.onRequest) {
                    next = await interceptor.onRequest(next);
                }
            }
            return next;
        },
        onResponse: async (response, config) => {
            let next = response;
            for (const interceptor of interceptors) {
                if (interceptor.onResponse) {
                    next = await interceptor.onResponse(next, config);
                }
            }
            return next;
        },
        onError: async (error, config) => {
            let next: unknown = error;
            for (const interceptor of interceptors) {
                if (interceptor.onError) {
                    next = await interceptor.onError(next, config);
                }
            }
            return next;
        },
    };
}

export async function runRequestInterceptors(
    interceptors: readonly HttpInterceptor[],
    config: HttpRequestConfig,
): Promise<HttpRequestConfig> {
    return (await composeInterceptors(interceptors).onRequest?.(config)) ?? config;
}

export async function runResponseInterceptors<T>(
    interceptors: readonly HttpInterceptor[],
    response: HttpResponse<T>,
    config: HttpRequestConfig,
): Promise<HttpResponse<T>> {
    return (await composeInterceptors(interceptors).onResponse?.(response, config)) ?? response;
}

export async function runErrorInterceptors(
    interceptors: readonly HttpInterceptor[],
    error: unknown,
    config: HttpRequestConfig,
): Promise<unknown> {
    return (await composeInterceptors(interceptors).onError?.(error, config)) ?? error;
}
