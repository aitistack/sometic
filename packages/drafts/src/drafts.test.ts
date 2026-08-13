import { afterEach, describe, expect, it, vi } from "vitest";
import {
    createDraftController,
    createLocalStorageDraftStorage,
    createMemoryDraftStorage,
} from "./drafts.js";

afterEach(() => {
    vi.useRealTimers();
});

describe("createMemoryDraftStorage", () => {
    it("stores, reads, and removes values", () => {
        const storage = createMemoryDraftStorage();
        expect(storage.getItem("k")).toBeNull();
        storage.setItem("k", "v");
        expect(storage.getItem("k")).toBe("v");
        storage.removeItem("k");
        expect(storage.getItem("k")).toBeNull();
    });

    it("shares an injected map", () => {
        const map = new Map<string, string>([["seed", "1"]]);
        const storage = createMemoryDraftStorage(map);
        expect(storage.getItem("seed")).toBe("1");
        storage.setItem("seed", "2");
        expect(map.get("seed")).toBe("2");
    });
});

describe("createLocalStorageDraftStorage", () => {
    it("uses an injected Storage implementation", () => {
        const store = new Map<string, string>();
        const storage = createLocalStorageDraftStorage({
            get length() {
                return store.size;
            },
            clear() {
                store.clear();
            },
            getItem(key) {
                return store.get(key) ?? null;
            },
            key() {
                return null;
            },
            removeItem(key) {
                store.delete(key);
            },
            setItem(key, value) {
                store.set(key, value);
            },
        });

        storage.setItem("draft", '{"ok":true}');
        expect(storage.getItem("draft")).toBe('{"ok":true}');
        storage.removeItem("draft");
        expect(storage.getItem("draft")).toBeNull();
    });

    it("no-ops when localStorage is unavailable and no store is injected", () => {
        const storage = createLocalStorageDraftStorage(undefined);
        expect(storage.getItem("missing")).toBeNull();
        expect(() => storage.setItem("k", "v")).not.toThrow();
        expect(() => storage.removeItem("k")).not.toThrow();
    });
});

describe("createDraftController", () => {
    it("saves, loads, and clears draft values", async () => {
        const map = new Map<string, string>();
        let values = { title: "Draft", body: "Hello" };
        const drafts = createDraftController({
            key: "doc:1",
            version: 1,
            storage: createMemoryDraftStorage(map),
            getValues: () => values,
            setValues: (next) => {
                values = next;
            },
            now: () => 1_000,
        });

        await drafts.save();
        expect(map.has("doc:1")).toBe(true);

        values = { title: "", body: "" };
        const loaded = await drafts.load();
        expect(loaded).toEqual({ title: "Draft", body: "Hello" });
        expect(values).toEqual({ title: "Draft", body: "Hello" });

        await drafts.clear();
        expect(map.has("doc:1")).toBe(false);
        expect(await drafts.load()).toBeNull();
        drafts.dispose();
    });

    it("applies pick, omit, and sanitize on save and load", async () => {
        const map = new Map<string, string>();
        let values = { title: "A", secret: "x", noise: 1 };
        const drafts = createDraftController({
            key: "doc",
            version: 1,
            storage: createMemoryDraftStorage(map),
            getValues: () => values,
            setValues: (next) => {
                values = next as typeof values;
            },
            pick: ["title", "secret"],
            omit: ["secret"],
            sanitize: (next) => ({ ...next, title: String(next.title).trim() }),
        });

        values = { title: "  Hello  ", secret: "x", noise: 1 };
        await drafts.save();
        const raw = JSON.parse(map.get("doc")!) as { values: Record<string, unknown> };
        expect(raw.values).toEqual({ title: "Hello" });

        values = { title: "", secret: "", noise: 0 };
        await drafts.load();
        expect(values).toEqual({ title: "Hello" });
        drafts.dispose();
    });

    it("returns null for version mismatch without migrate, and migrates when provided", async () => {
        const map = new Map<string, string>();
        map.set("doc", JSON.stringify({ version: 1, savedAt: 1, values: { title: "old" } }));
        let values = { title: "" };
        const withoutMigrate = createDraftController({
            key: "doc",
            version: 2,
            storage: createMemoryDraftStorage(map),
            getValues: () => values,
            setValues: (next) => {
                values = next;
            },
        });
        expect(await withoutMigrate.load()).toBeNull();
        withoutMigrate.dispose();

        const withMigrate = createDraftController({
            key: "doc",
            version: 2,
            storage: createMemoryDraftStorage(map),
            getValues: () => values,
            setValues: (next) => {
                values = next;
            },
            migrate: (draft) => ({
                title: String((draft.values as { title?: unknown }).title ?? ""),
            }),
        });
        expect(await withMigrate.load()).toEqual({ title: "old" });
        withMigrate.dispose();

        const migrateNull = createDraftController({
            key: "doc",
            version: 2,
            storage: createMemoryDraftStorage(map),
            getValues: () => values,
            setValues: (next) => {
                values = next;
            },
            migrate: () => null,
        });
        expect(await migrateNull.load()).toBeNull();
        migrateNull.dispose();
    });

    it("rejects invalid keys and versions", () => {
        const storage = createMemoryDraftStorage();
        expect(() =>
            createDraftController({
                key: " ",
                version: 1,
                storage,
                getValues: () => ({}),
                setValues: () => undefined,
            }),
        ).toThrow(/non-empty string/);
        expect(() =>
            createDraftController({
                key: "doc",
                version: -1,
                storage,
                getValues: () => ({}),
                setValues: () => undefined,
            }),
        ).toThrow(/non-negative number/);
        expect(() =>
            createDraftController({
                key: "doc",
                version: Number.NaN,
                storage,
                getValues: () => ({}),
                setValues: () => undefined,
            }),
        ).toThrow(/non-negative number/);
    });

    it("wraps storage failures and invalid records", async () => {
        const failing: ReturnType<typeof createMemoryDraftStorage> = {
            getItem: () => {
                throw new Error("read boom");
            },
            setItem: () => {
                throw new Error("write boom");
            },
            removeItem: () => {
                throw new Error("clear boom");
            },
        };
        const drafts = createDraftController({
            key: "doc",
            version: 1,
            storage: failing,
            getValues: () => ({ a: 1 }),
            setValues: () => undefined,
        });
        await expect(drafts.save()).rejects.toMatchObject({ code: "DRAFT_SAVE_FAILED" });
        await expect(drafts.load()).rejects.toMatchObject({ code: "DRAFT_LOAD_FAILED" });
        await expect(drafts.clear()).rejects.toMatchObject({ code: "DRAFT_CLEAR_FAILED" });
        drafts.dispose();

        const map = new Map<string, string>([["doc", "{not-json"]]);
        const parseDrafts = createDraftController({
            key: "doc",
            version: 1,
            storage: createMemoryDraftStorage(map),
            getValues: () => ({}),
            setValues: () => undefined,
        });
        await expect(parseDrafts.load()).rejects.toMatchObject({ code: "DRAFT_PARSE_FAILED" });
        map.set("doc", JSON.stringify({ savedAt: 1 }));
        await expect(parseDrafts.load()).rejects.toMatchObject({
            code: "DRAFT_INVALID_RECORD",
        });
        map.set("doc", "");
        expect(await parseDrafts.load()).toBeNull();
        parseDrafts.dispose();
    });

    it("debounces scheduleSave and serializes overlapping saves", async () => {
        vi.useFakeTimers();
        const setItem = vi.fn();
        const storage = {
            getItem: () => null,
            setItem,
            removeItem: () => undefined,
        };
        let values = { n: 0 };
        const drafts = createDraftController({
            key: "doc",
            version: 1,
            storage,
            getValues: () => values,
            setValues: (next) => {
                values = next;
            },
            debounceMs: 50,
            now: () => 1,
        });

        drafts.scheduleSave();
        values = { n: 1 };
        drafts.scheduleSave();
        expect(setItem).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(50);
        await Promise.resolve();
        expect(setItem).toHaveBeenCalledTimes(1);
        expect(JSON.parse(setItem.mock.calls[0]![1] as string).values).toEqual({ n: 1 });

        const zeroDebounce = createDraftController({
            key: "doc2",
            version: 1,
            storage,
            getValues: () => ({ n: 2 }),
            setValues: () => undefined,
            debounceMs: 0,
        });
        zeroDebounce.scheduleSave();
        await Promise.resolve();
        await Promise.resolve();
        expect(setItem).toHaveBeenCalledTimes(2);
        zeroDebounce.dispose();
        drafts.dispose();
    });

    it("rejects work after dispose and clears pending timers", async () => {
        vi.useFakeTimers();
        const storage = createMemoryDraftStorage();
        const drafts = createDraftController({
            key: "doc",
            version: 1,
            storage,
            getValues: () => ({ a: 1 }),
            setValues: () => undefined,
            debounceMs: 100,
        });
        drafts.scheduleSave();
        drafts.dispose();
        expect(drafts.disposed).toBe(true);
        await vi.advanceTimersByTimeAsync(100);
        expect(storage.getItem("doc")).toBeNull();
        expect(() => drafts.scheduleSave()).toThrow(/disposed/);
        await expect(drafts.save()).rejects.toThrow(/disposed/);
        await expect(drafts.load()).rejects.toThrow(/disposed/);
        await expect(drafts.clear()).rejects.toThrow(/disposed/);
    });
});
