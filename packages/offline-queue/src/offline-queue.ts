import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";
import { createPrefixedId } from "@sometic/core/id";
import type { ConflictController } from "@sometic/conflict";

export type OfflineQueueJobStatus =
    | "pending"
    | "flushing"
    | "failed"
    | "completed"
    | "cancelled";

export type OfflineQueueJob<TVariables = unknown> = {
    id: string;
    key: string;
    variables: TVariables;
    epoch: number;
    attempts: number;
    status: OfflineQueueJobStatus;
    createdAt: number;
    updatedAt: number;
    lastError?: string;
};

export type OfflineQueueStorage = {
    load: () => OfflineQueueJob[] | Promise<OfflineQueueJob[]>;
    save: (jobs: OfflineQueueJob[]) => void | Promise<void>;
};

export type OfflineQueueTransport<TVariables = unknown, TResult = unknown> = {
    send: (job: OfflineQueueJob<TVariables>) => Promise<TResult>;
};

export type CreateOfflineMutationQueueOptions<TVariables = unknown, TResult = unknown> = {
    storage: OfflineQueueStorage;
    transport: OfflineQueueTransport<TVariables, TResult>;
    getEpoch?: () => number;
    dropOnEpochChange?: boolean;
    maxAttempts?: number;
    conflict?: ConflictController;
    now?: () => number;
    onChange?: (jobs: OfflineQueueJob<TVariables>[]) => void;
};

export type OfflineMutationQueue<TVariables = unknown, TResult = unknown> = {
    enqueue: (input: {
        key: string;
        variables: TVariables;
        id?: string;
    }) => Promise<OfflineQueueJob<TVariables>>;
    peek: () => OfflineQueueJob<TVariables>[];
    flush: () => Promise<OfflineQueueJob<TVariables>[]>;
    retry: (id: string) => Promise<OfflineQueueJob<TVariables>>;
    cancel: (id: string) => Promise<void>;
    dropStale: () => Promise<void>;
    size: () => number;
    subscribe: (listener: (jobs: OfflineQueueJob<TVariables>[]) => void) => () => void;
    readonly disposed: boolean;
    dispose: () => void;
};

export function createMemoryOfflineQueueStorage(
    seed: OfflineQueueJob[] = [],
): OfflineQueueStorage {
    let jobs = seed.map((job) => ({ ...job }));
    return {
        load: () => jobs.map((job) => ({ ...job })),
        save: (next) => {
            jobs = next.map((job) => ({ ...job }));
        },
    };
}

export function createOfflineMutationQueue<TVariables = unknown, TResult = unknown>(
    options: CreateOfflineMutationQueueOptions<TVariables, TResult>,
): OfflineMutationQueue<TVariables, TResult> {
    const now = options.now ?? (() => Date.now());
    const getEpoch = options.getEpoch ?? (() => 0);
    const dropOnEpochChange = options.dropOnEpochChange ?? true;
    const maxAttempts = Math.max(1, Math.floor(options.maxAttempts ?? 5));
    let jobs: OfflineQueueJob<TVariables>[] = [];
    let hydrated = false;
    let flushing = false;
    const listeners = new Set<(jobs: OfflineQueueJob<TVariables>[]) => void>();

    const disposable = createDisposable(() => {
        listeners.clear();
        jobs = [];
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "OFFLINE_QUEUE_DISPOSED",
                message: "This offline mutation queue has been disposed",
            });
        }
    };

    const emit = (): void => {
        const snapshot = jobs.map((job) => ({ ...job }));
        options.onChange?.(snapshot);
        for (const listener of listeners) {
            listener(snapshot);
        }
    };

    const persist = async (): Promise<void> => {
        await options.storage.save(jobs.map((job) => ({ ...job })));
        emit();
    };

    const hydrate = async (): Promise<void> => {
        if (hydrated) {
            return;
        }
        const loaded = await options.storage.load();
        jobs = loaded.map((job) => ({ ...job })) as OfflineQueueJob<TVariables>[];
        hydrated = true;
        if (dropOnEpochChange) {
            const epoch = getEpoch();
            jobs = jobs.filter((job) => job.epoch === epoch);
            await persist();
        } else {
            emit();
        }
    };

    const ensureHydrated = async (): Promise<void> => {
        assertActive();
        await hydrate();
    };

    return {
        async enqueue(input) {
            await ensureHydrated();
            if (typeof input.key !== "string" || input.key.trim() === "") {
                throw createError({
                    code: "OFFLINE_QUEUE_INVALID_KEY",
                    message: "Offline queue job key must be a non-empty string",
                });
            }
            const stamp = now();
            const job: OfflineQueueJob<TVariables> = {
                id: input.id ?? createPrefixedId("offline"),
                key: input.key,
                variables: input.variables,
                epoch: getEpoch(),
                attempts: 0,
                status: "pending",
                createdAt: stamp,
                updatedAt: stamp,
            };
            jobs = [...jobs, job];
            await persist();
            return { ...job };
        },
        peek() {
            assertActive();
            return jobs.map((job) => ({ ...job }));
        },
        async flush() {
            await ensureHydrated();
            if (flushing) {
                throw createError({
                    code: "OFFLINE_QUEUE_FLUSH_IN_PROGRESS",
                    message: "A flush is already in progress",
                });
            }
            flushing = true;
            try {
                if (dropOnEpochChange) {
                    const epoch = getEpoch();
                    jobs = jobs.filter((job) => job.epoch === epoch);
                }
                const pending = jobs.filter(
                    (job) => job.status === "pending" || job.status === "failed",
                );
                for (const job of pending) {
                    const index = jobs.findIndex((item) => item.id === job.id);
                    if (index < 0) {
                        continue;
                    }
                    const current = jobs[index];
                    if (!current) {
                        continue;
                    }
                    jobs[index] = {
                        ...current,
                        status: "flushing",
                        updatedAt: now(),
                    };
                    await persist();
                    try {
                        await options.transport.send(jobs[index]!);
                        jobs[index] = {
                            ...jobs[index]!,
                            status: "completed",
                            attempts: jobs[index]!.attempts + 1,
                            updatedAt: now(),
                        };
                    } catch (error) {
                        const message =
                            error instanceof Error ? error.message : "Offline flush failed";
                        const attempts = jobs[index]!.attempts + 1;
                        jobs[index] = {
                            ...jobs[index]!,
                            status: "failed",
                            attempts,
                            lastError: message,
                            updatedAt: now(),
                        };
                        if (options.conflict && attempts >= maxAttempts) {
                            options.conflict.open({
                                key: jobs[index]!.key,
                                local: jobs[index]!.variables,
                                remote: null,
                            });
                        }
                    }
                    await persist();
                }
                return jobs.map((job) => ({ ...job }));
            } finally {
                flushing = false;
            }
        },
        async retry(id) {
            await ensureHydrated();
            const index = jobs.findIndex((job) => job.id === id);
            if (index < 0) {
                throw createError({
                    code: "OFFLINE_QUEUE_NOT_FOUND",
                    message: `Unknown offline job: ${id}`,
                });
            }
            const job = jobs[index]!;
            if (job.attempts >= maxAttempts) {
                throw createError({
                    code: "OFFLINE_QUEUE_MAX_ATTEMPTS",
                    message: `Offline job exceeded max attempts: ${id}`,
                });
            }
            jobs[index] = {
                ...job,
                status: "pending",
                updatedAt: now(),
            };
            await persist();
            await this.flush();
            const next = jobs.find((item) => item.id === id);
            if (!next) {
                throw createError({
                    code: "OFFLINE_QUEUE_NOT_FOUND",
                    message: `Unknown offline job: ${id}`,
                });
            }
            return { ...next };
        },
        async cancel(id) {
            await ensureHydrated();
            const index = jobs.findIndex((job) => job.id === id);
            if (index < 0) {
                throw createError({
                    code: "OFFLINE_QUEUE_NOT_FOUND",
                    message: `Unknown offline job: ${id}`,
                });
            }
            jobs[index] = {
                ...jobs[index]!,
                status: "cancelled",
                updatedAt: now(),
            };
            await persist();
        },
        async dropStale() {
            await ensureHydrated();
            const epoch = getEpoch();
            jobs = jobs.filter((job) => job.epoch === epoch);
            await persist();
        },
        size() {
            assertActive();
            return jobs.filter((job) => job.status === "pending" || job.status === "failed")
                .length;
        },
        subscribe(listener) {
            assertActive();
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get disposed() {
            return disposable.disposed;
        },
        dispose() {
            disposable.dispose();
        },
    };
}
