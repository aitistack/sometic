import { createHttpError } from "./errors.js";
import {
    runErrorInterceptors,
    runRequestInterceptors,
    runResponseInterceptors,
} from "./interceptors.js";
import { computeRetryDelay, resolveRetryOptions, shouldRetryDefault, wait } from "./retry/index.js";
import { isHttpReplayRequest } from "./replay.js";
import type {
    CreateHttpOptions,
    HttpClient,
    HttpRequestConfig,
    HttpResponse,
    HttpResponseType,
    RetryOptions,
} from "./types.js";
import { composeAbortSignals, dedupeKey, joinUrl, mergeHeaders } from "./url.js";

async function parseBody(
    response: Response,
    responseType: HttpResponseType,
    maxResponseBytes?: number,
): Promise<unknown> {
    if (maxResponseBytes !== undefined && maxResponseBytes >= 0) {
        const declared = response.headers.get("content-length");
        if (declared) {
            const size = Number(declared);
            if (Number.isFinite(size) && size > maxResponseBytes) {
                throw createHttpError(
                    "HTTP_RESPONSE_TOO_LARGE",
                    `Response exceeds maxResponseBytes (${maxResponseBytes})`,
                );
            }
        }
    }
    if (responseType === "raw") {
        return response;
    }
    if (responseType === "text") {
        const text = await response.text();
        if (maxResponseBytes !== undefined && text.length > maxResponseBytes) {
            throw createHttpError(
                "HTTP_RESPONSE_TOO_LARGE",
                `Response exceeds maxResponseBytes (${maxResponseBytes})`,
            );
        }
        return text;
    }
    if (responseType === "blob") {
        const blob = await response.blob();
        if (maxResponseBytes !== undefined && blob.size > maxResponseBytes) {
            throw createHttpError(
                "HTTP_RESPONSE_TOO_LARGE",
                `Response exceeds maxResponseBytes (${maxResponseBytes})`,
            );
        }
        return blob;
    }
    if (responseType === "arrayBuffer") {
        const buffer = await response.arrayBuffer();
        if (maxResponseBytes !== undefined && buffer.byteLength > maxResponseBytes) {
            throw createHttpError(
                "HTTP_RESPONSE_TOO_LARGE",
                `Response exceeds maxResponseBytes (${maxResponseBytes})`,
            );
        }
        return buffer;
    }
    const text = await response.text();
    if (maxResponseBytes !== undefined && text.length > maxResponseBytes) {
        throw createHttpError(
            "HTTP_RESPONSE_TOO_LARGE",
            `Response exceeds maxResponseBytes (${maxResponseBytes})`,
        );
    }
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        throw createHttpError("HTTP_PARSE", "Failed to parse JSON response");
    }
}

function resolveResponseType(config: HttpRequestConfig, response: Response): HttpResponseType {
    if (config.responseType) {
        return config.responseType;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
        return "json";
    }
    return "text";
}

export function createHttp(options: CreateHttpOptions = {}): HttpClient {
    const interceptors = [...(options.interceptors ?? [])];
    const retryOptions = resolveRetryOptions(options.retry);
    const allowAbsoluteUrl = options.allowAbsoluteUrl === true;
    const urlOptions = { allowAbsoluteUrl };
    const dedupeOptions =
        options.dedupe === false
            ? null
            : {
                  enabled: options.dedupe?.enabled !== false,
                  methods: options.dedupe?.methods ?? ["GET", "HEAD"],
                  includeAuthorization: options.dedupe?.includeAuthorization !== false,
              };
    const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
    const inflight = new Map<string, Promise<HttpResponse<unknown>>>();
    const requestLifetimes = new Set<AbortController>();
    let disposed = false;

    const assertActive = (): void => {
        if (disposed) {
            throw createHttpError("HTTP_DISPOSED", "HTTP client disposed");
        }
    };

    const executeOnce = async <T>(config: HttpRequestConfig): Promise<HttpResponse<T>> => {
        const method = (config.method ?? "GET").toUpperCase();
        const url = config.url;
        const headers = mergeHeaders(options.headers, config.headers);
        const timeoutMs = config.timeoutMs ?? options.timeoutMs;
        const timeoutController = timeoutMs && timeoutMs > 0 ? new AbortController() : null;
        const requestLifetime = new AbortController();
        requestLifetimes.add(requestLifetime);
        let timer: ReturnType<typeof setTimeout> | undefined;
        if (timeoutController && timeoutMs) {
            timer = setTimeout(() => {
                timeoutController.abort();
            }, timeoutMs);
        }
        const signal = composeAbortSignals(
            config.signal,
            timeoutController?.signal,
            requestLifetime.signal,
        );
        try {
            const response = await fetcher(url, {
                method,
                headers,
                body: config.body ?? null,
                ...(signal ? { signal } : {}),
            });
            const responseType = resolveResponseType(config, response);
            if (!response.ok) {
                throw createHttpError(
                    "HTTP_STATUS",
                    `Request failed with status ${response.status}`,
                    {
                        status: response.status,
                    },
                );
            }
            const data = (await parseBody(response, responseType, options.maxResponseBytes)) as T;
            return {
                data,
                status: response.status,
                headers: response.headers,
                url: response.url || url,
                raw: response,
            };
        } catch (error) {
            if (timeoutController?.signal.aborted && !config.signal?.aborted) {
                throw createHttpError("HTTP_TIMEOUT", "Request timed out");
            }
            if (
                (error instanceof DOMException && error.name === "AbortError") ||
                config.signal?.aborted
            ) {
                throw createHttpError("HTTP_ABORTED", "Request aborted");
            }
            if (
                typeof error === "object" &&
                error &&
                "code" in error &&
                typeof (error as { code: unknown }).code === "string" &&
                String((error as { code: string }).code).startsWith("HTTP_")
            ) {
                throw error;
            }
            throw createHttpError("HTTP_NETWORK", "Network request failed");
        } finally {
            requestLifetimes.delete(requestLifetime);
            if (timer) {
                clearTimeout(timer);
            }
        }
    };

    const executeWithRetry = async <T>(config: HttpRequestConfig): Promise<HttpResponse<T>> => {
        const maxRetries =
            config.retry === false
                ? 0
                : typeof config.retry === "number"
                  ? config.retry
                  : (retryOptions?.retries ?? 0);
        let attempt = 0;
        let lastError: unknown;
        while (attempt <= maxRetries) {
            try {
                return await executeOnce<T>(config);
            } catch (error) {
                lastError = error;
                const status =
                    typeof error === "object" &&
                    error &&
                    "details" in error &&
                    typeof (error as { details?: { status?: number } }).details?.status === "number"
                        ? (error as { details: { status: number } }).details.status
                        : undefined;
                const response =
                    status === undefined
                        ? undefined
                        : new Response(null, { status, headers: { "Retry-After": "0" } });
                const optionsForRetry = (retryOptions ?? {
                    retries: 0,
                }) as RetryOptions;
                const retryAllowed =
                    maxRetries > 0 &&
                    (optionsForRetry.retryOn
                        ? optionsForRetry.retryOn({
                              attempt,
                              error,
                              config,
                              ...(response ? { response } : {}),
                          })
                        : shouldRetryDefault({
                              attempt,
                              error,
                              config,
                              options: optionsForRetry,
                              ...(response ? { response } : {}),
                          }));
                if (!retryAllowed || attempt >= maxRetries) {
                    throw error;
                }
                const delay = computeRetryDelay(attempt, optionsForRetry, response, options.now);
                await wait(delay, config.signal);
                attempt += 1;
            }
        }
        throw lastError;
    };

    const request = async <T = unknown>(input: HttpRequestConfig): Promise<HttpResponse<T>> => {
        assertActive();
        const config = await runRequestInterceptors(interceptors, {
            method: "GET",
            ...input,
            headers: mergeHeaders(options.headers, input.headers),
            url: joinUrl(options.baseUrl, input.url, urlOptions),
        });

        const run = async (): Promise<HttpResponse<T>> => {
            try {
                const response = await executeWithRetry<T>({
                    ...config,
                    url: config.url,
                });
                return await runResponseInterceptors(interceptors, response, config);
            } catch (error) {
                const mapped = await runErrorInterceptors(interceptors, error, config);
                if (isHttpReplayRequest(mapped)) {
                    return request(mapped.config);
                }
                if (
                    mapped &&
                    typeof mapped === "object" &&
                    "data" in mapped &&
                    "status" in mapped
                ) {
                    return mapped as HttpResponse<T>;
                }
                throw mapped;
            }
        };

        const method = (config.method ?? "GET").toUpperCase();
        const canDedupe =
            dedupeOptions?.enabled &&
            config.dedupe !== false &&
            (dedupeOptions.methods ?? ["GET", "HEAD"])
                .map((item) => item.toUpperCase())
                .includes(method);
        if (!canDedupe) {
            return run();
        }
        const key = dedupeKey(config, dedupeOptions.includeAuthorization !== false);
        const existing = inflight.get(key);
        if (existing) {
            return existing as Promise<HttpResponse<T>>;
        }
        const promise = run().finally(() => {
            inflight.delete(key);
        });
        inflight.set(key, promise as Promise<HttpResponse<unknown>>);
        return promise;
    };

    const client: HttpClient = {
        request,
        get: (url, init) => request({ ...init, url, method: "GET" }),
        post: (url, body, init) => request({ ...init, url, method: "POST", body: body ?? null }),
        put: (url, body, init) => request({ ...init, url, method: "PUT", body: body ?? null }),
        patch: (url, body, init) => request({ ...init, url, method: "PATCH", body: body ?? null }),
        delete: (url, init) => request({ ...init, url, method: "DELETE" }),
        getInterceptors: () => interceptors.slice(),
        extend: (overrides) =>
            createHttp({
                ...options,
                ...overrides,
                headers: mergeHeaders(options.headers, overrides.headers),
                interceptors: [...interceptors, ...(overrides.interceptors ?? [])],
            }),
        dispose: () => {
            disposed = true;
            for (const controller of requestLifetimes) {
                controller.abort();
            }
            requestLifetimes.clear();
            inflight.clear();
        },
    };

    return client;
}
