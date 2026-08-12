import { describe, expect, it, vi } from "vitest";
import { createActivityController } from "./activity.js";

function createClock(start = 1_000): () => number {
    let value = start;
    return () => {
        value += 1;
        return value;
    };
}

describe("createActivityController", () => {
    it("starts empty and reports empty pages", () => {
        const controller = createActivityController();

        expect(controller.getEntries()).toEqual([]);
        expect(controller.count()).toBe(0);
        expect(controller.getPage()).toEqual({ items: [], nextCursor: null, hasMore: false });
        expect(controller.getEntry("nope")).toBeUndefined();
        controller.dispose();
    });

    it("appends entries newest first with normalized fields", () => {
        const controller = createActivityController({ now: createClock() });

        const first = controller.append({ type: "created", message: "Created invoice" });
        const second = controller.append({
            type: "updated",
            message: "Updated invoice",
            actorId: "user-1",
            resourceId: "invoice-9",
            meta: { field: "total" },
        });

        expect(first.actorId).toBeNull();
        expect(first.resourceId).toBeNull();
        expect(first.meta).toBeNull();
        expect(second.meta).toEqual({ field: "total" });
        expect(controller.getEntries().map((entry) => entry.id)).toEqual([second.id, first.id]);
        expect(controller.count()).toBe(2);
        expect(controller.getEntry(first.id)?.message).toBe("Created invoice");
        controller.dispose();
    });

    it("seeds entries from options and rejects entries without a type", () => {
        const controller = createActivityController({
            entries: [{ type: "seed", message: "Seeded" }],
            now: createClock(),
        });

        expect(controller.count()).toBe(1);
        expect(() => controller.append({ type: "", message: "bad" })).toThrow(/requires a type/);
        controller.dispose();
    });

    it("keeps insertion order stable for entries sharing a timestamp", () => {
        const controller = createActivityController({ now: () => 500 });

        const first = controller.append({ type: "a", message: "first" });
        const second = controller.append({ type: "a", message: "second" });
        const third = controller.append({ type: "a", message: "third" });

        expect(controller.getEntries().map((entry) => entry.id)).toEqual([
            third.id,
            second.id,
            first.id,
        ]);
        controller.dispose();
    });

    it("orders backdated entries by their own timestamp", () => {
        const controller = createActivityController();

        const recent = controller.append({ type: "a", message: "recent", createdAt: 200 });
        const older = controller.append({ type: "a", message: "older", createdAt: 100 });

        expect(controller.getEntries().map((entry) => entry.id)).toEqual([recent.id, older.id]);
        controller.dispose();
    });

    it("appends a burst of entries in one commit", () => {
        const listener = vi.fn();
        const controller = createActivityController({ now: createClock() });
        controller.subscribe(listener);

        const created = controller.appendMany([
            { type: "a", message: "one" },
            { type: "b", message: "two" },
            { type: "c", message: "three" },
        ]);

        expect(created).toHaveLength(3);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(controller.count()).toBe(3);
        controller.dispose();
    });

    it("filters by type, actor, resource, and time range", () => {
        const controller = createActivityController();
        controller.append({ type: "created", message: "a", actorId: "u1", createdAt: 100 });
        controller.append({
            type: "updated",
            message: "b",
            actorId: "u2",
            resourceId: "r1",
            createdAt: 200,
        });
        controller.append({ type: "deleted", message: "c", actorId: "u1", createdAt: 300 });

        expect(controller.getEntries({ type: "updated" })).toHaveLength(1);
        expect(controller.getEntries({ types: ["created", "deleted"] })).toHaveLength(2);
        expect(controller.getEntries({ actorId: "u1" })).toHaveLength(2);
        expect(controller.getEntries({ resourceId: "r1" })).toHaveLength(1);
        expect(controller.getEntries({ since: 200 })).toHaveLength(2);
        expect(controller.getEntries({ until: 200 })).toHaveLength(2);
        expect(controller.getEntries({ since: 150, until: 250 })).toHaveLength(1);
        expect(controller.count({ actorId: "ghost" })).toBe(0);
        controller.dispose();
    });

    it("pages forward with cursors", () => {
        const controller = createActivityController({ pageSize: 2, now: createClock() });
        const created = controller.appendMany(
            Array.from({ length: 5 }, (_value, index) => ({
                type: "a",
                message: `entry-${String(index)}`,
            })),
        );
        const newestFirst = [...created].reverse().map((entry) => entry.id);

        const firstPage = controller.getPage();
        expect(firstPage.items.map((entry) => entry.id)).toEqual(newestFirst.slice(0, 2));
        expect(firstPage.hasMore).toBe(true);
        expect(firstPage.nextCursor).toBe(newestFirst[1]);

        const secondPage = controller.getPage({ cursor: firstPage.nextCursor });
        expect(secondPage.items.map((entry) => entry.id)).toEqual(newestFirst.slice(2, 4));

        const lastPage = controller.getPage({ cursor: secondPage.nextCursor, limit: 5 });
        expect(lastPage.items.map((entry) => entry.id)).toEqual(newestFirst.slice(4));
        expect(lastPage.hasMore).toBe(false);
        expect(lastPage.nextCursor).toBeNull();
        controller.dispose();
    });

    it("pages a filtered feed", () => {
        const controller = createActivityController({ now: createClock() });
        controller.appendMany([
            { type: "a", message: "1" },
            { type: "b", message: "2" },
            { type: "a", message: "3" },
        ]);

        const page = controller.getPage({ filter: { type: "a" }, limit: 1 });
        expect(page.items).toHaveLength(1);
        expect(page.hasMore).toBe(true);

        const next = controller.getPage({ cursor: page.nextCursor, filter: { type: "a" } });
        expect(next.items).toHaveLength(1);
        expect(next.hasMore).toBe(false);
        controller.dispose();
    });

    it("throws a typed error for an unknown cursor", () => {
        const controller = createActivityController();
        controller.append({ type: "a", message: "1" });

        expect(() => controller.getPage({ cursor: "ghost" })).toThrow(/Unknown activity cursor/);
        controller.dispose();
    });

    it("caps the log at maxEntries and keeps the newest", () => {
        const controller = createActivityController({ maxEntries: 2, now: createClock() });
        controller.append({ type: "a", message: "one" });
        const second = controller.append({ type: "a", message: "two" });
        const third = controller.append({ type: "a", message: "three" });

        expect(controller.getEntries().map((entry) => entry.id)).toEqual([third.id, second.id]);
        controller.dispose();
    });

    it("returns copies so callers cannot mutate stored entries", () => {
        const controller = createActivityController();
        const entry = controller.append({ type: "a", message: "one", meta: { count: 1 } });

        const snapshot = controller.getEntries();
        const first = snapshot[0];
        if (first?.meta) {
            first.meta.count = 99;
        }
        snapshot.splice(0, 1);

        expect(controller.getEntry(entry.id)?.meta).toEqual({ count: 1 });
        expect(controller.count()).toBe(1);
        controller.dispose();
    });

    it("notifies subscribers on append and clear", () => {
        const onChange = vi.fn();
        const listener = vi.fn();
        const controller = createActivityController({ onChange });
        const unsubscribe = controller.subscribe(listener);

        controller.append({ type: "a", message: "one" });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledTimes(1);

        controller.clear();
        expect(controller.count()).toBe(0);
        expect(listener).toHaveBeenCalledTimes(2);

        unsubscribe();
        controller.append({ type: "a", message: "two" });
        expect(listener).toHaveBeenCalledTimes(2);
        controller.dispose();
    });

    it("drops subscriptions and refuses writes after dispose", () => {
        const listener = vi.fn();
        const controller = createActivityController();
        controller.subscribe(listener);
        controller.dispose();
        controller.dispose();

        expect(controller.disposed).toBe(true);
        expect(() => controller.append({ type: "a", message: "one" })).toThrow(/disposed/);
        expect(() => controller.appendMany([{ type: "a", message: "one" }])).toThrow(/disposed/);
        expect(() => controller.clear()).toThrow(/disposed/);
        expect(listener).not.toHaveBeenCalled();
        expect(controller.subscribe(listener)).toBeTypeOf("function");
        expect(controller.getEntries()).toEqual([]);
    });
});
