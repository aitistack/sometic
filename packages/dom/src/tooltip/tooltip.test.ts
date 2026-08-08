import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createTooltipController, resolveTooltip } from "./index.js";

describe("tooltip", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("resolves tooltip role", () => {
        const view = resolveTooltip({ open: true, placement: "top" });
        expect(view.attributes.role).toBe("tooltip");
        expect(view.attributes["data-state"]).toBe("open");
    });

    it("opens after delay", () => {
        const controller = createTooltipController({ openDelayMs: 200, closeDelayMs: 50 });
        controller.scheduleOpen();
        expect(controller.open.get()).toBe(false);
        vi.advanceTimersByTime(200);
        expect(controller.open.get()).toBe(true);
        controller.scheduleClose();
        vi.advanceTimersByTime(50);
        expect(controller.open.get()).toBe(false);
        controller.dispose();
    });
});
