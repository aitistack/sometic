import { canUseDom } from "@sometic/core/environment";
import { createError } from "@sometic/core/error";
import { resolveUploadFetch, type UploadFetch } from "./http-transport.js";

export type DownloadFromUrlOptions = {
    signal?: AbortSignal;
    saveAs?: string;
    fetchImpl?: UploadFetch;
    headers?: Record<string, string>;
};

export function downloadBlob(blob: Blob, filename: string): void {
    if (!canUseDom()) {
        throw createError({
            code: "upload_download_unavailable",
            message: "downloadBlob requires a browser document",
        });
    }

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
}

export async function downloadFromUrl(
    url: string,
    options: DownloadFromUrlOptions = {},
): Promise<Blob> {
    const request = resolveUploadFetch(options.fetchImpl);
    const response = await request(url, {
        method: "GET",
        ...(options.signal === undefined ? {} : { signal: options.signal }),
        ...(options.headers === undefined ? {} : { headers: options.headers }),
    });

    if (!response.ok) {
        throw createError({
            code: "upload_download_failed",
            message: `Download failed with status ${String(response.status)}`,
            details: { status: response.status, url },
        });
    }

    const blob = await response.blob();
    if (options.saveAs !== undefined) {
        downloadBlob(blob, options.saveAs);
    }
    return blob;
}
