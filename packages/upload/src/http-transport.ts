import { createError } from "@sometic/core/error";
import type { UploadTransport, UploadTransportResult } from "./types.js";

export type UploadFetch = (input: string, init?: RequestInit) => Promise<Response>;

export type CreateHttpUploadTransportOptions = {
    url: string;
    method?: string;
    fieldName?: string;
    headers?: Record<string, string>;
    extraFields?: Record<string, string>;
    credentials?: RequestCredentials;
    fetchImpl?: UploadFetch;
    parseResponse?: (response: Response) => Promise<UploadTransportResult>;
};

export function resolveUploadFetch(override?: UploadFetch): UploadFetch {
    if (override) {
        return override;
    }
    if (typeof fetch !== "function") {
        throw createError({
            code: "upload_fetch_unavailable",
            message: "No global fetch is available. Pass fetchImpl to createHttpUploadTransport.",
        });
    }
    return (input, init) => fetch(input, init);
}

async function defaultParseResponse(response: Response): Promise<UploadTransportResult> {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("json")) {
        return {};
    }

    let payload: unknown;
    try {
        payload = await response.json();
    } catch {
        return {};
    }

    if (typeof payload !== "object" || payload === null) {
        return {};
    }

    const url: unknown = Reflect.get(payload, "url");
    return typeof url === "string" ? { url } : {};
}

export function createHttpUploadTransport(
    options: CreateHttpUploadTransportOptions,
): UploadTransport {
    return {
        async upload(file, context) {
            const request = resolveUploadFetch(options.fetchImpl);
            const body = new FormData();
            body.append(options.fieldName ?? "file", file, file.name);

            if (options.extraFields) {
                for (const [key, value] of Object.entries(options.extraFields)) {
                    body.append(key, value);
                }
            }

            context.onProgress(0);

            const response = await request(options.url, {
                method: options.method ?? "POST",
                body,
                signal: context.signal,
                ...(options.headers === undefined ? {} : { headers: options.headers }),
                ...(options.credentials === undefined ? {} : { credentials: options.credentials }),
            });

            if (!response.ok) {
                throw createError({
                    code: "upload_request_failed",
                    message: `Upload failed with status ${String(response.status)}`,
                    details: { status: response.status, url: options.url },
                });
            }

            context.onProgress(1);
            const parse = options.parseResponse ?? defaultParseResponse;
            return await parse(response);
        },
    };
}
