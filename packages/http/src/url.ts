import { createHttpError } from "./errors.js";

const ABSOLUTE_SCHEME = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;
const UNSAFE_SCHEME = /^(javascript|data|vbscript|file|blob):/i;
const HTTP_ABSOLUTE = /^https?:\/\//i;

export type SafeUrlOptions = {
    allowAbsoluteUrl?: boolean;
};

export function assertSafeRequestUrl(path: string, options: SafeUrlOptions = {}): string {
    const trimmed = path.trim();
    if (!trimmed) {
        throw createHttpError("HTTP_INVALID_URL", "Request URL must not be empty");
    }
    if (UNSAFE_SCHEME.test(trimmed) || trimmed.startsWith("//")) {
        throw createHttpError("HTTP_INVALID_URL", "Refusing unsafe or protocol-relative URL");
    }
    if (HTTP_ABSOLUTE.test(trimmed)) {
        if (options.allowAbsoluteUrl !== true) {
            throw createHttpError(
                "HTTP_INVALID_URL",
                "Absolute URLs require allowAbsoluteUrl: true",
            );
        }
        return path;
    }
    if (ABSOLUTE_SCHEME.test(trimmed)) {
        throw createHttpError(
            "HTTP_INVALID_URL",
            "Only relative paths or http(s) absolute URLs are allowed",
        );
    }
    return path;
}

export function joinUrl(
    baseUrl: string | undefined,
    path: string,
    options: SafeUrlOptions = {},
): string {
    const safePath = assertSafeRequestUrl(path, options);
    if (HTTP_ABSOLUTE.test(safePath.trim())) {
        return safePath;
    }
    if (!baseUrl) {
        return safePath;
    }
    const base = baseUrl.replace(/\/+$/, "");
    const next = safePath.replace(/^\/+/, "");
    return `${base}/${next}`;
}

export function mergeHeaders(
    ...parts: Array<Record<string, string> | Headers | undefined>
): Record<string, string> {
    const result: Record<string, string> = Object.create(null);
    for (const part of parts) {
        if (!part) {
            continue;
        }
        if (part instanceof Headers) {
            part.forEach((value, key) => {
                result[key] = value;
            });
            continue;
        }
        for (const [key, value] of Object.entries(part)) {
            if (key === "__proto__" || key === "prototype" || key === "constructor") {
                continue;
            }
            result[key] = value;
        }
    }
    return result;
}

export function composeAbortSignals(
    ...signals: Array<AbortSignal | null | undefined>
): AbortSignal | undefined {
    const active = signals.filter((signal): signal is AbortSignal => Boolean(signal));
    if (active.length === 0) {
        return undefined;
    }
    if (active.length === 1) {
        return active[0];
    }
    const controller = new AbortController();
    const onAbort = (): void => {
        controller.abort();
    };
    for (const signal of active) {
        if (signal.aborted) {
            controller.abort();
            break;
        }
        signal.addEventListener("abort", onAbort, { once: true });
    }
    return controller.signal;
}

function fingerprint(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
}

export function dedupeKey(
    config: { method?: string; url: string; headers?: Record<string, string> },
    includeAuthorization: boolean,
): string {
    const method = (config.method ?? "GET").toUpperCase();
    const auth =
        includeAuthorization && config.headers
            ? (config.headers.Authorization ?? config.headers.authorization ?? "")
            : "";
    const authPart = auth ? fingerprint(auth) : "";
    return `${method} ${config.url} ${authPart}`;
}
