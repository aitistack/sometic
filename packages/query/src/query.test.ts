import { describe, expect, it, vi } from "vitest";
import { createHttpQueryFn } from "./http/index.js";
import { hashQueryKey, partialMatchKey } from "./keys/index.js";
import { createMutationObserver, createQueryClient, createQueryObserver } from "./query-client.js";

describe("hashQueryKey", () => {
    it("hashes domain-shaped keys stably", () => {
        expect(hashQueryKey(["users", 1])).toBe(hashQueryKey(["users", 1]));
        expect(hashQueryKey(["users", { id: 1, role: "a" }])).toBe(
            hashQueryKey(["users", { role: "a", id: 1 }]),
        );
        expect(partialMatchKey(["users", 1, "profile"], ["users"])).toBe(true);
        expect(partialMatchKey(["users", 1], ["users", 2])).toBe(false);
    });

    it("does not collide Map/Set/RegExp with plain objects", () => {
        expect(hashQueryKey([new Map([["a", 1]])])).not.toBe(hashQueryKey([{}]));
        expect(hashQueryKey([new Set([1])])).not.toBe(hashQueryKey([{}]));
        expect(hashQueryKey([/abc/i])).not.toBe(hashQueryKey([{}]));
        expect(hashQueryKey([new Map([["a", 1]])])).toBe(hashQueryKey([new Map([["a", 1]])]));
    });

    it("rejects circular keys and functions", () => {
        const circular: { self?: unknown } = {};
        circular.self = circular;
        expect(() => hashQueryKey([circular])).toThrow(/circular/i);
        expect(() => hashQueryKey([() => undefined])).toThrow(/JSON-serializable/i);
    });
});

describe("createQueryClient", () => {
    it("fetches, caches, and returns fresh data within staleTime", async () => {
        const client = createQueryClient({
            defaultOptions: { queries: { staleTime: 60_000, retry: false } },
        });
        const queryFn = vi.fn(async () => [{ id: 1 }]);
        const first = await client.fetchQuery({
            queryKey: ["users"],
            queryFn,
        });
        const second = await client.ensureQueryData({
            queryKey: ["users"],
            queryFn,
        });
        expect(first).toEqual([{ id: 1 }]);
        expect(second).toEqual([{ id: 1 }]);
        expect(queryFn).toHaveBeenCalledTimes(1);
        client.dispose();
    });

    it("invalidates and refetches active observers", async () => {
        const client = createQueryClient({
            defaultOptions: { queries: { staleTime: 60_000, retry: false } },
        });
        let value = 1;
        const queryFn = vi.fn(async () => value);
        const observer = createQueryObserver(client, {
            queryKey: ["counter"],
            queryFn,
        });
        const seen: number[] = [];
        const stop = observer.subscribe(() => {
            const result = observer.getCurrentResult();
            if (result.data !== undefined) {
                seen.push(result.data);
            }
        });
        await vi.waitFor(() => expect(observer.getCurrentResult().isSuccess).toBe(true));
        value = 2;
        await client.invalidateQueries({ queryKey: ["counter"] });
        await vi.waitFor(() => expect(observer.getCurrentResult().data).toBe(2));
        expect(queryFn.mock.calls.length).toBeGreaterThanOrEqual(2);
        stop();
        observer.destroy();
        client.dispose();
    });

    it("supports optimistic mutation rollback via setQueryData", async () => {
        const client = createQueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        client.setQueryData(["todos"], [{ id: 1, title: "A" }]);
        const mutation = createMutationObserver(client, {
            mutationFn: async () => {
                throw new Error("fail");
            },
            async onMutate() {
                const previous = client.getQueryData<Array<{ id: number; title: string }>>([
                    "todos",
                ]);
                client.setQueryData(
                    ["todos"],
                    [
                        { id: 1, title: "A" },
                        { id: 2, title: "B" },
                    ],
                );
                return { previous };
            },
            onError(_error, _variables, context) {
                if (context?.previous) {
                    client.setQueryData(["todos"], context.previous);
                }
            },
        });
        await expect(mutation.mutate(undefined)).rejects.toThrow("fail");
        expect(client.getQueryData(["todos"])).toEqual([{ id: 1, title: "A" }]);
        mutation.destroy();
        client.dispose();
    });

    it("marks empty success arrays", async () => {
        const client = createQueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const observer = createQueryObserver(client, {
            queryKey: ["empty"],
            queryFn: async () => [],
        });
        const stop = observer.subscribe(() => undefined);
        await vi.waitFor(() => expect(observer.getCurrentResult().isSuccess).toBe(true));
        expect(observer.getCurrentResult().isEmpty).toBe(true);
        stop();
        observer.destroy();
        client.dispose();
    });

    it("clears cached data for logout isolation", async () => {
        const client = createQueryClient({
            defaultOptions: { queries: { staleTime: 60_000, retry: false } },
        });
        await client.fetchQuery({
            queryKey: ["private"],
            queryFn: async () => ({ secret: true }),
        });
        expect(client.getQueryData(["private"])).toEqual({ secret: true });
        client.clear();
        expect(client.getQueryData(["private"])).toBeUndefined();
        client.dispose();
    });
});

describe("createHttpQueryFn", () => {
    it("reads response.data from http client get", async () => {
        const get = vi.fn(async () => ({
            data: { ok: true },
            status: 200,
            headers: new Headers(),
            config: {},
        }));
        const queryFn = createHttpQueryFn<{ ok: boolean }>({
            client: { get } as never,
            path: "/health",
        });
        const data = await queryFn({
            queryKey: ["health"],
            signal: new AbortController().signal,
        });
        expect(data).toEqual({ ok: true });
        expect(get).toHaveBeenCalledWith(
            "/health",
            expect.objectContaining({ signal: expect.any(AbortSignal) }),
        );
    });

    it("rejects unsafe URL schemes before calling http", async () => {
        const get = vi.fn();
        const queryFn = createHttpQueryFn({
            client: { get } as never,
            path: "javascript:alert(1)",
        });
        await expect(
            queryFn({
                queryKey: ["x"],
                signal: new AbortController().signal,
            }),
        ).rejects.toMatchObject({ code: "HTTP_INVALID_URL" });
        expect(get).not.toHaveBeenCalled();
    });
});
