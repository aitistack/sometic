import { describe, expect, it, vi } from "vitest";
import { createAsyncOperation } from "./index.js";
import { createDeferred } from "../utils/index.js";

describe("async-operation", () => {
    it("tracks success state", async () => {
        const operation = createAsyncOperation(async (_signal, value: number) => value * 2);
        const result = await operation.execute(21);

        expect(result).toBe(42);
        expect(operation.state.status).toBe("success");
        expect(operation.state.data).toBe(42);
    });

    it("supports latest-wins cancellation", async () => {
        const first = createDeferred<string>();
        const second = createDeferred<string>();
        let calls = 0;

        const operation = createAsyncOperation(async (signal) => {
            calls += 1;
            const deferred = calls === 1 ? first : second;
            const abort = new Promise<string>((_, reject) => {
                signal.addEventListener("abort", () => {
                    reject(signal.reason ?? new Error("aborted"));
                });
            });
            return Promise.race([deferred.promise, abort]);
        });

        const firstPromise = operation.execute();
        const secondPromise = operation.execute();
        second.resolve("newest");

        await expect(secondPromise).resolves.toBe("newest");
        await expect(firstPromise).rejects.toBeTruthy();
        expect(operation.state.status).toBe("success");
        expect(operation.state.data).toBe("newest");
    });

    it("aborts pending work and notifies subscribers", async () => {
        const deferred = createDeferred<number>();
        const operation = createAsyncOperation(async (signal) => {
            const abort = new Promise<number>((_, reject) => {
                signal.addEventListener("abort", () => {
                    reject(new Error("aborted"));
                });
            });
            return Promise.race([deferred.promise, abort]);
        });

        const statuses: string[] = [];
        const subscription = operation.subscribe((state) => {
            statuses.push(state.status);
        });

        const pending = operation.execute();
        operation.abort("stop");
        await expect(pending).rejects.toBeTruthy();
        expect(operation.state.status).toBe("aborted");
        expect(statuses).toContain("pending");
        expect(statuses).toContain("aborted");
        subscription.dispose();
    });

    it("rejects first-concurrency while pending", async () => {
        const deferred = createDeferred<number>();
        const operation = createAsyncOperation(async () => deferred.promise, {
            concurrency: "first",
        });

        const pending = operation.execute();
        await expect(operation.execute()).rejects.toMatchObject({
            code: "ASYNC_OPERATION_BUSY",
        });
        deferred.resolve(1);
        await pending;
    });

    it("retries with the last arguments", async () => {
        const spy = vi.fn(async (_signal: AbortSignal, value: number) => value);
        const operation = createAsyncOperation(spy);
        await operation.execute(7);
        await operation.retry();
        expect(spy).toHaveBeenNthCalledWith(1, expect.any(AbortSignal), 7);
        expect(spy).toHaveBeenNthCalledWith(2, expect.any(AbortSignal), 7);
    });
});
