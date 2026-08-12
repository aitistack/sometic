import { describe, expect, it, vi } from "vitest";
import {
    createNotificationCenterController,
    createNotificationsController,
    resolveNotificationCenter,
    resolveNotificationItem,
} from "./index.js";

describe("resolveNotificationCenter", () => {
    it("resolves open and closed panels", () => {
        const open = resolveNotificationCenter({ open: true, unreadCount: 2, count: 3 });
        expect(open.attributes["data-state"]).toBe("open");
        expect(open.attributes["data-unread"]).toBe("2");
        expect(open.attributes.hidden).toBeUndefined();
        expect(open.listAttributes["aria-live"]).toBe("polite");
        const closed = resolveNotificationCenter({ open: false });
        expect(closed.attributes["data-state"]).toBe("closed");
        expect(closed.attributes.hidden).toBe("");
    });

    it("marks the empty inbox and honors live off", () => {
        const view = resolveNotificationCenter({ live: "off" });
        expect(view.empty).toBe(true);
        expect(view.attributes["data-empty"]).toBe("true");
        expect(view.listAttributes["aria-live"]).toBeUndefined();
    });
});

describe("resolveNotificationItem", () => {
    it("resolves read state, priority, and dismiss label", () => {
        const unread = resolveNotificationItem({ id: "n1", priority: "high", title: "Deploy" });
        expect(unread.attributes["data-state"]).toBe("unread");
        expect(unread.attributes["data-priority"]).toBe("high");
        expect(unread.attributes["aria-live"]).toBe("assertive");
        expect(unread.dismissAttributes["aria-label"]).toBe("Dismiss Deploy");
        const read = resolveNotificationItem({ id: "n1", read: true, source: "billing" });
        expect(read.attributes["data-state"]).toBe("read");
        expect(read.attributes["data-source"]).toBe("billing");
        expect(read.attributes["aria-live"]).toBeUndefined();
        expect(read.dismissAttributes["aria-label"]).toBe("Dismiss notification");
    });
});

describe("createNotificationCenterController", () => {
    it("owns an inbox, counts unread, and toggles open state", () => {
        const onOpenChange = vi.fn();
        const center = createNotificationCenterController({ onOpenChange });
        expect(center.isOpen()).toBe(false);
        center.toggle();
        expect(center.isOpen()).toBe(true);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        center.notifications.push({ title: "One" });
        center.notifications.push({ title: "Two", read: true });
        expect(center.getItems()).toHaveLength(2);
        expect(center.getUnreadCount()).toBe(1);
        center.markAllRead();
        expect(center.getUnreadCount()).toBe(0);
        center.dispose();
    });

    it("marks read, dismisses, and groups items", () => {
        const center = createNotificationCenterController({ groupBy: "source" });
        const first = center.notifications.push({ title: "One", source: "billing" });
        center.notifications.push({ title: "Two", source: "deploys" });
        center.markRead(first.id);
        expect(center.getItems().find((item) => item.id === first.id)?.read).toBe(true);
        expect(
            center
                .getGroups()
                .map((group) => group.key)
                .sort(),
        ).toEqual(["billing", "deploys"]);
        center.dismiss(first.id);
        expect(center.getItems()).toHaveLength(1);
        center.dispose();
    });

    it("notifies subscribers on burst inserts", () => {
        const listener = vi.fn();
        const center = createNotificationCenterController();
        const unsubscribe = center.subscribe(listener);
        for (let index = 0; index < 5; index += 1) {
            center.notifications.push({ title: `Item ${index}` });
        }
        expect(listener).toHaveBeenCalledTimes(5);
        unsubscribe();
        center.notifications.push({ title: "After" });
        expect(listener).toHaveBeenCalledTimes(5);
        center.dispose();
    });

    it("resolves view models from live inbox state", () => {
        const center = createNotificationCenterController({ defaultOpen: true });
        const item = center.notifications.push({ title: "Ship it", priority: "high" });
        const view = center.resolve();
        expect(view.attributes["data-state"]).toBe("open");
        expect(view.attributes["data-unread"]).toBe("1");
        expect(view.attributes["data-empty"]).toBe("false");
        const itemView = center.resolveItem(item.id);
        expect(itemView.attributes["data-priority"]).toBe("high");
        expect(itemView.dismissAttributes["aria-label"]).toBe("Dismiss Ship it");
        expect(center.resolveItem("missing").attributes["data-state"]).toBe("unread");
        center.dispose();
    });

    it("leaves an injected controller alive on dispose", () => {
        const notifications = createNotificationsController();
        const center = createNotificationCenterController({ notifications });
        center.dispose();
        notifications.push({ title: "Still working" });
        expect(notifications.getItems()).toHaveLength(1);
        notifications.dispose();
        expect(() => notifications.push({ title: "Rejected" })).toThrow();
    });

    it("supports controlled open state", () => {
        const onOpenChange = vi.fn();
        const center = createNotificationCenterController({ open: false, onOpenChange });
        center.setOpen(true);
        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(center.isOpen()).toBe(false);
        center.dispose();
    });
});
