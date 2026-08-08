import type { AuthController } from "@sometic/auth";
import type { QueryClient, QueryKey } from "@sometic/query";

export type SessionMutationJob<TVariables = unknown> = {
    id: string;
    epoch: number;
    variables: TVariables;
    rollback?: () => void;
};

export type SessionMutationQueueOptions = {
    getEpoch: () => number;
    onDrop?: (job: SessionMutationJob) => void;
};

export type SessionMutationQueue = {
    enqueue: <TVariables>(
        job: Omit<SessionMutationJob<TVariables>, "id" | "epoch"> & { id?: string },
    ) => string;
    dropStale: () => void;
    clear: () => void;
    size: () => number;
    dispose: () => void;
};

export function createSessionMutationQueue(
    _client: QueryClient,
    options: SessionMutationQueueOptions,
): SessionMutationQueue {
    const jobs = new Map<string, SessionMutationJob>();
    let seq = 0;

    const dropStale = (): void => {
        const epoch = options.getEpoch();
        for (const [id, job] of jobs) {
            if (job.epoch !== epoch) {
                job.rollback?.();
                options.onDrop?.(job);
                jobs.delete(id);
            }
        }
    };

    return {
        enqueue(job) {
            dropStale();
            const id = job.id ?? `mut-${String((seq += 1))}`;
            const entry: SessionMutationJob = {
                id,
                epoch: options.getEpoch(),
                variables: job.variables,
                ...(job.rollback ? { rollback: job.rollback } : {}),
            };
            jobs.set(id, entry);
            return id;
        },
        dropStale,
        clear() {
            for (const job of jobs.values()) {
                job.rollback?.();
                options.onDrop?.(job);
            }
            jobs.clear();
        },
        size: () => jobs.size,
        dispose() {
            jobs.clear();
        },
    };
}

export function bindMutationQueueToAuth(
    auth: AuthController,
    queue: SessionMutationQueue,
): () => void {
    let lastEpoch = auth.getEpoch();
    return auth.subscribe((session) => {
        const epoch = session.epoch ?? 0;
        if (epoch === lastEpoch) {
            return;
        }
        lastEpoch = epoch;
        queue.clear();
    });
}

export type { QueryKey };
