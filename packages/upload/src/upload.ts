import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";
import { createPrefixedId } from "@sometic/core/id";
import type {
    CreateUploadControllerOptions,
    UploadItem,
    UploadItemStatus,
    UploadSummary,
} from "./types.js";

export type UploadController = {
    getItems(): UploadItem[];
    getItem(id: string): UploadItem | undefined;
    getSummary(): UploadSummary;
    addFiles(files: File[]): UploadItem[];
    start(): void;
    remove(id: string): void;
    clear(): void;
    retry(id: string): void;
    cancel(id: string): void;
    pause(id: string): void;
    resume(id: string): void;
    subscribe(listener: (items: UploadItem[]) => void): () => void;
    readonly disposed: boolean;
    dispose(): void;
};

export function matchesAcceptRule(file: File, accept: string[] | undefined): boolean {
    if (!accept || accept.length === 0) {
        return true;
    }

    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    return accept.some((rawRule) => {
        const rule = rawRule.trim().toLowerCase();
        if (rule.length === 0) {
            return false;
        }
        if (rule === "*" || rule === "*/*") {
            return true;
        }
        if (rule.startsWith(".")) {
            return name.endsWith(rule);
        }
        if (rule.endsWith("/*")) {
            return type.length > 0 && type.startsWith(rule.slice(0, rule.length - 1));
        }
        return type === rule;
    });
}

function toError(value: unknown): Error {
    if (value instanceof Error) {
        return value;
    }
    return new Error(typeof value === "string" ? value : "Upload failed");
}

function snapshot(item: UploadItem): UploadItem {
    return { ...item };
}

export function createUploadController(
    options: CreateUploadControllerOptions,
): UploadController {
    const concurrency = Math.max(1, Math.floor(options.concurrency ?? 3));
    const autoStart = options.autoStart !== false;
    const allowEmptyFiles = options.allowEmptyFiles !== false;
    const maxAttempts = options.maxAttempts === undefined ? 0 : Math.max(0, options.maxAttempts);

    const items: UploadItem[] = [];
    const controllers = new Map<string, AbortController>();
    const listeners = new Set<(items: UploadItem[]) => void>();

    const disposable = createDisposable(() => {
        for (const controller of controllers.values()) {
            controller.abort();
        }
        controllers.clear();
        listeners.clear();
    });

    const getItems = (): UploadItem[] => items.map(snapshot);

    const emit = (): void => {
        const current = getItems();
        if (options.onChange) {
            options.onChange(current);
        }
        for (const listener of Array.from(listeners)) {
            listener(current);
        }
    };

    const findItem = (id: string): UploadItem | undefined =>
        items.find((entry) => entry.id === id);

    const createItem = (file: File, status: UploadItemStatus, error: Error | null): UploadItem => ({
        id: createPrefixedId("upload"),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status,
        progress: 0,
        loadedBytes: 0,
        attempts: 0,
        error,
        url: null,
    });

    const runItem = async (item: UploadItem): Promise<void> => {
        const controller = new AbortController();
        controllers.set(item.id, controller);

        item.status = "uploading";
        item.attempts += 1;
        item.error = null;
        item.progress = 0;
        item.loadedBytes = 0;
        emit();

        try {
            const result = await options.transport.upload(item.file, {
                signal: controller.signal,
                onProgress: (progress) => {
                    if (item.status !== "uploading" || controller.signal.aborted) {
                        return;
                    }
                    const safe = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
                    item.progress = safe;
                    item.loadedBytes = Math.round(item.size * safe);
                    emit();
                },
            });

            if (controller.signal.aborted || disposable.disposed) {
                return;
            }

            item.status = "success";
            item.progress = 1;
            item.loadedBytes = item.size;
            item.url = result.url ?? null;
            item.error = null;
            if (options.onItemSuccess) {
                options.onItemSuccess(snapshot(item));
            }
        } catch (caught) {
            if (controller.signal.aborted || disposable.disposed) {
                return;
            }

            item.status = "error";
            item.error = toError(caught);
            if (maxAttempts > 0 && item.attempts < maxAttempts) {
                item.status = "queued";
                item.progress = 0;
                item.loadedBytes = 0;
            } else if (options.onItemError) {
                options.onItemError(snapshot(item));
            }
        } finally {
            controllers.delete(item.id);
            emit();
            pump();
        }
    };

    function pump(): void {
        if (disposable.disposed) {
            return;
        }

        let active = items.filter((entry) => entry.status === "uploading").length;
        if (active >= concurrency) {
            return;
        }

        for (const item of items) {
            if (active >= concurrency) {
                return;
            }
            if (item.status !== "queued") {
                continue;
            }
            active += 1;
            void runItem(item);
        }
    }

    const abortItem = (id: string): void => {
        const controller = controllers.get(id);
        if (!controller) {
            return;
        }
        controllers.delete(id);
        controller.abort();
    };

    return {
        get disposed() {
            return disposable.disposed;
        },
        getItems,
        getItem(id) {
            const item = findItem(id);
            return item ? snapshot(item) : undefined;
        },
        getSummary() {
            const summary: UploadSummary = {
                total: items.length,
                queued: 0,
                uploading: 0,
                paused: 0,
                success: 0,
                error: 0,
                canceled: 0,
                progress: 0,
            };

            let progressTotal = 0;
            for (const item of items) {
                summary[item.status] += 1;
                progressTotal += item.status === "success" ? 1 : item.progress;
            }
            summary.progress = items.length === 0 ? 0 : progressTotal / items.length;
            return summary;
        },
        addFiles(files) {
            if (disposable.disposed || files.length === 0) {
                return [];
            }

            const created: UploadItem[] = [];
            for (const file of files) {
                if (!allowEmptyFiles && file.size === 0) {
                    created.push(
                        createItem(
                            file,
                            "error",
                            createError({
                                code: "upload_file_empty",
                                message: `${file.name} is empty`,
                                details: { name: file.name },
                            }),
                        ),
                    );
                    continue;
                }

                if (options.maxBytes !== undefined && file.size > options.maxBytes) {
                    created.push(
                        createItem(
                            file,
                            "error",
                            createError({
                                code: "upload_file_too_large",
                                message: `${file.name} exceeds ${String(options.maxBytes)} bytes`,
                                details: { name: file.name, size: file.size },
                            }),
                        ),
                    );
                    continue;
                }

                if (!matchesAcceptRule(file, options.accept)) {
                    created.push(
                        createItem(
                            file,
                            "error",
                            createError({
                                code: "upload_file_type_rejected",
                                message: `${file.name} does not match the accepted types`,
                                details: { name: file.name, type: file.type },
                            }),
                        ),
                    );
                    continue;
                }

                created.push(createItem(file, "queued", null));
            }

            items.push(...created);
            const accepted = created.map(snapshot);
            emit();
            if (autoStart) {
                pump();
            }
            return accepted;
        },
        start() {
            pump();
        },
        remove(id) {
            const index = items.findIndex((entry) => entry.id === id);
            if (index < 0) {
                return;
            }
            abortItem(id);
            items.splice(index, 1);
            emit();
            pump();
        },
        clear() {
            for (const item of items) {
                abortItem(item.id);
            }
            items.splice(0, items.length);
            emit();
        },
        retry(id) {
            const item = findItem(id);
            if (!item || (item.status !== "error" && item.status !== "canceled")) {
                return;
            }
            item.status = "queued";
            item.progress = 0;
            item.loadedBytes = 0;
            item.error = null;
            emit();
            pump();
        },
        cancel(id) {
            const item = findItem(id);
            if (!item || item.status === "success" || item.status === "canceled") {
                return;
            }
            abortItem(id);
            item.status = "canceled";
            emit();
            pump();
        },
        pause(id) {
            const item = findItem(id);
            if (!item || (item.status !== "uploading" && item.status !== "queued")) {
                return;
            }
            abortItem(id);
            item.status = "paused";
            emit();
            pump();
        },
        resume(id) {
            const item = findItem(id);
            if (!item || item.status !== "paused") {
                return;
            }
            item.status = "queued";
            item.error = null;
            emit();
            pump();
        },
        subscribe(listener) {
            if (disposable.disposed) {
                return () => {};
            }
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            if (disposable.disposed) {
                return;
            }
            for (const item of items) {
                if (item.status === "uploading" || item.status === "queued") {
                    item.status = "canceled";
                }
            }
            disposable.dispose();
        },
    };
}
