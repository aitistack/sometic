import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createToastQueue } from "./index.js";

describe("toast", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("pushes and dismisses toasts", () => {
        const changes: number[] = [];
        const queue = createToastQueue({
            onChange: (items) => {
                changes.push(items.length);
            },
            announcer: {
                disposed: false,
                announce() {
                    return;
                },
                clear() {
                    return;
                },
                dispose() {
                    return;
                },
            },
        });
        const item = queue.push({ title: "Saved", durationMs: 1000 });
        expect(queue.items).toHaveLength(1);
        expect(item.title).toBe("Saved");
        queue.dismiss(item.id);
        expect(queue.items).toHaveLength(0);
        queue.dispose();
    });

    it("auto-dismisses after duration", () => {
        const queue = createToastQueue({
            defaultDurationMs: 500,
            announcer: {
                disposed: false,
                announce() {
                    return;
                },
                clear() {
                    return;
                },
                dispose() {
                    return;
                },
            },
        });
        queue.push({ title: "Hi" });
        expect(queue.items).toHaveLength(1);
        vi.advanceTimersByTime(500);
        expect(queue.items).toHaveLength(0);
        queue.dispose();
    });
});
