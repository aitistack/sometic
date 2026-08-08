import type { HttpRequestConfig } from "./types.js";

export type HttpReplayRequest = {
    __httpReplay: true;
    config: HttpRequestConfig;
};

export function isHttpReplayRequest(value: unknown): value is HttpReplayRequest {
    return (
        typeof value === "object" &&
        value !== null &&
        "__httpReplay" in value &&
        (value as { __httpReplay?: unknown }).__httpReplay === true &&
        "config" in value
    );
}
