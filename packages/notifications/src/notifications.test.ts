import { describe, expect, it, vi } from "vitest";
import { createNotificationsController } from "./notifications.js";

function createClock(start = 1_000): () => number {
    let value = start;
    return () => {
        value += 1;
        return value;
    };
}

describe("createNotificationsController", () => {
    it("starts with an empty inbox", () => {
        const controller = createNotificationsController();

        expect(controller.getItems()).toEqual([]);
        expect(controller.getUnreadCount()).toBe(0);
        expect(controller.groupBy("day")).toEqual([]);
        expect(controller.getItem("nope")).toBeUndefined();
        controller.dispose();
    });

    it("pushes items newest first with normalized fields", () => {
        const controller = createNotificationsController({ now: createClock() });

        const first = controller.push({ title: "Deployed" });
        const second = controller.push({
            title: "Invoice paid",
            body: "Invoice 42 was paid",
            source: "billing",
            href: "/invoices/42",
            priority: "high",
        });

        expect(first.body).toBeNull();
        expect(first.source).toBeNull();
        expect(first.href).toBeNull();
        expect(first.priority).toBe("normal");
        expect(first.read).toBe(false);
        expect(second.priority).toBe("high");
        expect(controller.getItems().map((item) => item.id)).toEqual([second.id, first.id]);
        expect(controller.getUnreadCount()).toBe(2);
        controller.dispose();
    });

    it("seeds items and rejects items without a title", () => {
        const controller = createNotificationsController({
            items: [{ title: "Seeded", read: true }],
            now: createClock(),
        });

        expect(controller.getItems()).toHaveLength(1);
        expect(controller.getUnreadCount()).toBe(0);
        expect(() => controller.push({ title: "" })).toThrow(/requires a title/);
        controller.dispose();
    });

    it("announces unread items only", () => {
        const onAnnounce = vi.fn();
        const controller = createNotificationsController({ onAnnounce, now: createClock() });

        controller.push({ title: "New" });
        controller.push({ title: "Already seen", read: true });

        expect(onAnnounce).toHaveBeenCalledTimes(1);
        expect(onAnnounce.mock.calls[0]?.[0]?.title).toBe("New");
        controller.dispose();
    });

    it("handles a burst of inserts in one commit", () => {
        const listener = vi.fn();
        const onAnnounce = vi.fn();
        const controller = createNotificationsController({ onAnnounce, now: createClock() });
        controller.subscribe(listener);

        const created = controller.pushMany(
            Array.from({ length: 25 }, (_value, index) => ({ title: `Item ${String(index)}` })),
        );

        expect(created).toHaveLength(25);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(onAnnounce).toHaveBeenCalledTimes(25);
        expect(controller.getUnreadCount()).toBe(25);
        controller.dispose();
    });

    it("caps the inbox at maxItems and keeps the newest", () => {
        const controller = createNotificationsController({ maxItems: 3, now: createClock() });
        controller.pushMany(
            Array.from({ length: 6 }, (_value, index) => ({ title: `Item ${String(index)}` })),
        );

        const titles = controller.getItems().map((item) => item.title);
        expect(titles).toEqual(["Item 5", "Item 4", "Item 3"]);
        controller.dispose();
    });

    it("marks items read, unread, and all read", () => {
        const listener = vi.fn();
        const controller = createNotificationsController({ now: createClock() });
        controller.subscribe(listener);

        const first = controller.push({ title: "One" });
        const second = controller.push({ title: "Two" });
        const calls = listener.mock.calls.length;

        controller.markRead(first.id);
        expect(controller.getItem(first.id)?.read).toBe(true);
        expect(controller.getUnreadCount()).toBe(1);

        controller.markRead(first.id);
        controller.markRead("missing");
        expect(listener.mock.calls.length).toBe(calls + 1);

        controller.markUnread(first.id);
        expect(controller.getItem(first.id)?.read).toBe(false);
        controller.markUnread(second.id);

        controller.markAllRead();
        expect(controller.getUnreadCount()).toBe(0);
        const afterAllRead = listener.mock.calls.length;
        controller.markAllRead();
        expect(listener.mock.calls.length).toBe(afterAllRead);
        controller.dispose();
    });

    it("filters by unread state, source, and priority", () => {
        const controller = createNotificationsController({ now: createClock() });
        const first = controller.push({ title: "One", source: "billing", priority: "high" });
        controller.push({ title: "Two", source: "system" });
        controller.markRead(first.id);

        expect(controller.getItems({ unreadOnly: true })).toHaveLength(1);
        expect(controller.getItems({ source: "billing" })).toHaveLength(1);
        expect(controller.getItems({ priority: "high" })).toHaveLength(1);
        expect(controller.getItems({ source: "ghost" })).toEqual([]);
        controller.dispose();
    });

    it("dismisses one item and then all of them", () => {
        const controller = createNotificationsController({ now: createClock() });
        const first = controller.push({ title: "One" });
        controller.push({ title: "Two" });

        controller.dismiss(first.id);
        expect(controller.getItems()).toHaveLength(1);
        controller.dismiss("missing");
        expect(controller.getItems()).toHaveLength(1);

        controller.dismissAll();
        expect(controller.getItems()).toEqual([]);
        controller.dismissAll();
        controller.dispose();
    });

    it("groups by day", () => {
        const controller = createNotificationsController();
        const dayOne = Date.UTC(2026, 0, 1, 10);
        const dayTwo = Date.UTC(2026, 0, 2, 10);

        controller.push({ title: "A", createdAt: dayOne });
        controller.push({ title: "B", createdAt: dayOne + 1000 });
        controller.push({ title: "C", createdAt: dayTwo });

        const groups = controller.groupBy("day");
        expect(groups.map((group) => group.key)).toEqual(["2026-01-02", "2026-01-01"]);
        expect(groups[0]?.items.map((item) => item.title)).toEqual(["C"]);
        expect(groups[1]?.items.map((item) => item.title)).toEqual(["B", "A"]);
        controller.dispose();
    });

    it("groups by source and falls back to unknown", () => {
        const controller = createNotificationsController({ now: createClock() });
        controller.push({ title: "A", source: "billing" });
        controller.push({ title: "B" });
        controller.push({ title: "C", source: "billing" });

        const groups = controller.groupBy("source");
        expect(groups.map((group) => group.key)).toEqual(["billing", "unknown"]);
        expect(groups[0]?.items).toHaveLength(2);

        const unreadGroups = controller.groupBy("source", { source: "billing" });
        expect(unreadGroups).toHaveLength(1);
        controller.dispose();
    });

    it("returns copies so callers cannot mutate the inbox", () => {
        const controller = createNotificationsController({ now: createClock() });
        const item = controller.push({ title: "One" });

        const snapshot = controller.getItems();
        const first = snapshot[0];
        if (first) {
            first.read = true;
            first.title = "Changed";
        }
        snapshot.splice(0, 1);

        expect(controller.getItem(item.id)).toMatchObject({ title: "One", read: false });
        expect(controller.getItems()).toHaveLength(1);
        controller.dispose();
    });

    it("notifies subscribers and stops after unsubscribe", () => {
        const onChange = vi.fn();
        const listener = vi.fn();
        const controller = createNotificationsController({ onChange, now: createClock() });
        const unsubscribe = controller.subscribe(listener);

        controller.push({ title: "One" });
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        controller.push({ title: "Two" });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledTimes(2);
        controller.dispose();
    });

    it("drops subscriptions and refuses writes after dispose", () => {
        const listener = vi.fn();
        const controller = createNotificationsController({ now: createClock() });
        const item = controller.push({ title: "One" });
        controller.subscribe(listener);

        controller.dispose();
        controller.dispose();

        expect(controller.disposed).toBe(true);
        expect(() => controller.push({ title: "Two" })).toThrow(/disposed/);
        expect(() => controller.pushMany([{ title: "Two" }])).toThrow(/disposed/);
        expect(() => controller.markRead(item.id)).toThrow(/disposed/);
        expect(() => controller.markUnread(item.id)).toThrow(/disposed/);
        expect(() => controller.markAllRead()).toThrow(/disposed/);
        expect(() => controller.dismiss(item.id)).toThrow(/disposed/);
        expect(() => controller.dismissAll()).toThrow(/disposed/);
        expect(listener).not.toHaveBeenCalled();
        expect(controller.getItems()).toHaveLength(1);
        expect(controller.subscribe(listener)).toBeTypeOf("function");
    });
});
