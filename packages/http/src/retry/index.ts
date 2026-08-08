import { createHttpError } from "../errors.js";
import type { HttpRequestConfig, RetryOptions } from "../types.js";

const DEFAULT_METHODS = ["GET", "HEAD", "OPTIONS"] as const;

export function resolveRetryOptions(option?: RetryOptions | false): RetryOptions | null {
    if (option === false) {
        return null;
    }
    return {
        retries: option?.retries ?? 2,
        minDelayMs: option?.minDelayMs ?? 200,
        maxDelayMs: option?.maxDelayMs ?? 5_000,
        factor: option?.factor ?? 2,
        methods: option?.methods ?? DEFAULT_METHODS,
        ...(option?.retryOn === undefined ? {} : { retryOn: option.retryOn }),
    };
}

export function shouldRetryDefault(context: {
    attempt: number;
    error: unknown;
    config: HttpRequestConfig;
    response?: Response;
    options: RetryOptions;
}): boolean {
    const method = (context.config.method ?? "GET").toUpperCase();
    const allowed = context.options.methods ?? DEFAULT_METHODS;
    if (!allowed.map((item) => item.toUpperCase()).includes(method)) {
        return false;
    }
    if (context.config.signal?.aborted) {
        return false;
    }
    if (context.response) {
        const status = context.response.status;
        return status === 408 || status === 429 || status >= 500;
    }
    const code =
        typeof context.error === "object" &&
        context.error &&
        "code" in context.error &&
        typeof (context.error as { code: unknown }).code === "string"
            ? (context.error as { code: string }).code
            : null;
    if (code === "HTTP_ABORTED" || code === "HTTP_TIMEOUT") {
        return code === "HTTP_TIMEOUT";
    }
    return code === "HTTP_NETWORK";
}

export function computeRetryDelay(
    attempt: number,
    options: RetryOptions,
    response?: Response,
    now = Date.now,
): number {
    const retryAfter = response?.headers.get("Retry-After");
    if (retryAfter) {
        const asNumber = Number(retryAfter);
        if (!Number.isNaN(asNumber)) {
            return Math.min(options.maxDelayMs ?? 5_000, Math.max(0, asNumber * 1000));
        }
        const asDate = Date.parse(retryAfter);
        if (!Number.isNaN(asDate)) {
            return Math.min(options.maxDelayMs ?? 5_000, Math.max(0, asDate - now()));
        }
    }
    const min = options.minDelayMs ?? 200;
    const factor = options.factor ?? 2;
    const max = options.maxDelayMs ?? 5_000;
    const base = Math.min(max, min * factor ** attempt);
    const jitter = base * (0.5 + Math.random() * 0.5);
    return Math.min(max, jitter);
}

export async function wait(ms: number, signal?: AbortSignal | null): Promise<void> {
    if (ms <= 0) {
        return;
    }
    if (signal?.aborted) {
        throw createHttpError("HTTP_ABORTED", "Request aborted");
    }
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        }, ms);
        const onAbort = (): void => {
            clearTimeout(timer);
            reject(createHttpError("HTTP_ABORTED", "Request aborted"));
        };
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}
