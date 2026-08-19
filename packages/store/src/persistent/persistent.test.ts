import { describe, expect, it, vi } from "vitest";
import { createMemoryStorage, createPersistentStore } from "./index.js";

describe("createPersistentStore", () => {
    it("hydrates from storage and persists updates", async () => {
        const storage = createMemoryStorage();
        await storage.setItem("app", JSON.stringify({ version: 1, state: { count: 5 } }));

        const store = createPersistentStore({ count: 0 }, { key: "app", storage });
        await store.hydrated;
        expect(store.get()).toEqual({ count: 5 });

        store.set({ count: 6 });
        await store.persistNow();
        expect(await storage.getItem("app")).toContain('"count":6');
        store.dispose();
    });

    it("runs migrations and reports corrupt payloads", async () => {
        const storage = createMemoryStorage();
        await storage.setItem("app", JSON.stringify({ version: 1, state: { value: 1 } }));

        const store = createPersistentStore(
            { value: 0, label: "n/a" },
            {
                key: "app",
                storage,
                version: 2,
                migrations: [
                    {
                        version: 2,
                        migrate(previous) {
                            const prior = previous as { value: number };
                            return { value: prior.value, label: "migrated" };
                        },
                    },
                ],
            },
        );
        await store.hydrated;
        expect(store.get()).toEqual({ value: 1, label: "migrated" });
        store.dispose();

        const errors: unknown[] = [];
        const corruptStorage = createMemoryStorage();
        await corruptStorage.setItem("x", "{not-json");
        const corrupt = createPersistentStore(
            { ok: true },
            {
                key: "x",
                storage: corruptStorage,
                onPersistError(error) {
                    errors.push(error);
                },
            },
        );
        await corrupt.hydrated;
        expect(errors.length).toBeGreaterThan(0);
        corrupt.dispose();
    });

    it("supports clearPersisted", async () => {
        const storage = createMemoryStorage();
        const store = createPersistentStore({ a: 1 }, { key: "k", storage });
        await store.hydrated;
        await store.clearPersisted();
        expect(await storage.getItem("k")).toBeNull();
        store.dispose();
    });

    it("does not throw from subscriber when storage write fails", async () => {
        const onPersistError = vi.fn();
        const storage = {
            name: "failing",
            getItem: async () => null,
            setItem: async () => {
                throw new Error("quota");
            },
            removeItem: async () => undefined,
        };
        const store = createPersistentStore(
            { a: 1 },
            { key: "k", storage, onPersistError, syncInitial: false },
        );
        await store.hydrated;
        store.set({ a: 2 });
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(onPersistError).toHaveBeenCalled();
        store.dispose();
    });

    it("stops persistence writes after dispose", async () => {
        const storage = createMemoryStorage();
        const store = createPersistentStore({ count: 0 }, { key: "app", storage });
        await store.hydrated;
        const before = await storage.getItem("app");
        store.dispose();
        store.dispose();
        expect(() => store.set({ count: 1 })).toThrow(/disposed/);
        expect(await storage.getItem("app")).toBe(before);
    });
});
