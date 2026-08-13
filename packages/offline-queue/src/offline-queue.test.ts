import { describe, expect, it, vi } from "vitest";
import { createConflictController } from "@sometic/conflict";
import { createMemoryOfflineQueueStorage, createOfflineMutationQueue } from "./offline-queue.js";

describe("createMemoryOfflineQueueStorage", () => {
    it("loads and saves defensive copies", async () => {
        const storage = createMemoryOfflineQueueStorage([
            {
                id: "j1",
                key: "update",
                variables: { n: 1 },
                epoch: 0,
                attempts: 0,
                status: "pending",
                createdAt: 1,
                updatedAt: 1,
            },
        ]);
        const loaded = await storage.load();
        loaded[0]!.status = "failed";
        expect((await storage.load())[0]?.status).toBe("pending");

        await storage.save([
            {
                id: "j2",
                key: "create",
                variables: { n: 2 },
                epoch: 1,
                attempts: 0,
                status: "pending",
                createdAt: 2,
                updatedAt: 2,
            },
        ]);
        expect((await storage.load())[0]?.id).toBe("j2");
    });
});

describe("createOfflineMutationQueue", () => {
    it("enqueues, flushes, and completes jobs through transport", async () => {
        const send = vi.fn(async () => ({ ok: true }));
        const onChange = vi.fn();
        const queue = createOfflineMutationQueue({
            storage: createMemoryOfflineQueueStorage(),
            transport: { send },
            now: () => 1_000,
            getEpoch: () => 7,
            onChange,
        });

        const job = await queue.enqueue({
            key: "invoice.update",
            variables: { id: "1", total: 20 },
            id: "job-1",
        });
        expect(job).toMatchObject({
            id: "job-1",
            key: "invoice.update",
            epoch: 7,
            status: "pending",
            attempts: 0,
        });
        expect(queue.size()).toBe(1);
        expect(queue.peek()).toHaveLength(1);
        expect(onChange).toHaveBeenCalled();

        const flushed = await queue.flush();
        expect(send).toHaveBeenCalledTimes(1);
        expect(flushed[0]?.status).toBe("completed");
        expect(flushed[0]?.attempts).toBe(1);
        expect(queue.size()).toBe(0);
        queue.dispose();
    });

    it("marks failures, retries, cancels, and opens conflicts at max attempts", async () => {
        const conflict = createConflictController();
        let shouldFail = true;
        const queue = createOfflineMutationQueue({
            storage: createMemoryOfflineQueueStorage(),
            transport: {
                send: async () => {
                    if (shouldFail) {
                        throw new Error("network down");
                    }
                    return "ok";
                },
            },
            maxAttempts: 2,
            conflict,
            now: () => 50,
        });

        const job = await queue.enqueue({ key: "save", variables: { a: 1 } });
        await queue.flush();
        expect(queue.peek()[0]?.status).toBe("failed");
        expect(queue.peek()[0]?.lastError).toBe("network down");
        expect(queue.size()).toBe(1);

        shouldFail = false;
        const retried = await queue.retry(job.id);
        expect(retried.status).toBe("completed");

        const cancelled = await queue.enqueue({ key: "save", variables: { a: 2 } });
        await queue.cancel(cancelled.id);
        expect(queue.peek().find((item) => item.id === cancelled.id)?.status).toBe("cancelled");

        shouldFail = true;
        const exhausted = await queue.enqueue({ key: "save", variables: { a: 3 } });
        await queue.flush();
        expect(queue.peek().find((item) => item.id === exhausted.id)?.attempts).toBe(1);
        await queue.retry(exhausted.id);
        expect(queue.peek().find((item) => item.id === exhausted.id)?.attempts).toBe(2);
        expect(conflict.list("open")).toHaveLength(1);
        expect(conflict.list("open")[0]?.key).toBe("save");
        await expect(queue.retry(exhausted.id)).rejects.toMatchObject({
            code: "OFFLINE_QUEUE_MAX_ATTEMPTS",
        });
        queue.dispose();
        conflict.dispose();
    });

    it("drops stale jobs on hydrate and flush when epoch changes", async () => {
        let epoch = 1;
        const storage = createMemoryOfflineQueueStorage([
            {
                id: "old",
                key: "save",
                variables: {},
                epoch: 0,
                attempts: 0,
                status: "pending",
                createdAt: 1,
                updatedAt: 1,
            },
            {
                id: "fresh",
                key: "save",
                variables: {},
                epoch: 1,
                attempts: 0,
                status: "pending",
                createdAt: 2,
                updatedAt: 2,
            },
        ]);
        const queue = createOfflineMutationQueue({
            storage,
            transport: { send: async () => undefined },
            getEpoch: () => epoch,
            dropOnEpochChange: true,
        });

        await queue.enqueue({ key: "noop", variables: {} });
        expect(queue.peek().every((job) => job.epoch === 1)).toBe(true);
        expect(queue.peek().some((job) => job.id === "old")).toBe(false);

        epoch = 2;
        await queue.dropStale();
        expect(queue.peek()).toHaveLength(0);

        const keepStale = createOfflineMutationQueue({
            storage: createMemoryOfflineQueueStorage([
                {
                    id: "kept",
                    key: "save",
                    variables: {},
                    epoch: 0,
                    attempts: 0,
                    status: "pending",
                    createdAt: 1,
                    updatedAt: 1,
                },
            ]),
            transport: { send: async () => undefined },
            getEpoch: () => 9,
            dropOnEpochChange: false,
        });
        await keepStale.enqueue({ key: "x", variables: {} });
        expect(keepStale.peek().some((job) => job.id === "kept")).toBe(true);
        keepStale.dispose();
        queue.dispose();
    });

    it("rejects invalid keys, missing jobs, and concurrent flush", async () => {
        let release!: () => void;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        const queue = createOfflineMutationQueue({
            storage: createMemoryOfflineQueueStorage(),
            transport: {
                send: async () => {
                    await gate;
                    return true;
                },
            },
        });

        await expect(queue.enqueue({ key: " ", variables: {} })).rejects.toMatchObject({
            code: "OFFLINE_QUEUE_INVALID_KEY",
        });
        await expect(queue.retry("missing")).rejects.toMatchObject({
            code: "OFFLINE_QUEUE_NOT_FOUND",
        });
        await expect(queue.cancel("missing")).rejects.toMatchObject({
            code: "OFFLINE_QUEUE_NOT_FOUND",
        });

        await queue.enqueue({ key: "save", variables: { n: 1 } });
        const flushing = queue.flush();
        await expect(queue.flush()).rejects.toMatchObject({
            code: "OFFLINE_QUEUE_FLUSH_IN_PROGRESS",
        });
        release();
        await flushing;
        queue.dispose();
    });

    it("hydrates once, notifies subscribers, and rejects work after dispose", async () => {
        const load = vi.fn(async () => [] as never[]);
        const save = vi.fn(async () => undefined);
        const queue = createOfflineMutationQueue({
            storage: { load, save },
            transport: { send: async () => undefined },
        });
        const listener = vi.fn();
        const stop = queue.subscribe(listener);

        await queue.enqueue({ key: "a", variables: 1 });
        await queue.enqueue({ key: "b", variables: 2 });
        expect(load).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalled();

        stop();
        listener.mockClear();
        await queue.enqueue({ key: "c", variables: 3 });
        expect(listener).not.toHaveBeenCalled();

        queue.dispose();
        expect(queue.disposed).toBe(true);
        expect(() => queue.peek()).toThrow(/disposed/);
        expect(() => queue.size()).toThrow(/disposed/);
        await expect(queue.enqueue({ key: "d", variables: 4 })).rejects.toThrow(/disposed/);
        expect(() => queue.subscribe(() => undefined)).toThrow(/disposed/);
    });
});
