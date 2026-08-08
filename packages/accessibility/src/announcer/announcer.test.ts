import { afterEach, describe, expect, it, vi } from "vitest";
import { createLiveAnnouncer } from "./index.js";

describe("announcer", () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it("writes to an aria-live region and clears", () => {
        vi.useFakeTimers();
        const announcer = createLiveAnnouncer();
        announcer.announce("Saved");
        const live = document.querySelector("[aria-live]");
        expect(live?.textContent).toBe("Saved");
        vi.advanceTimersByTime(1000);
        expect(live?.textContent).toBe("");
        announcer.dispose();
        expect(document.querySelector("[aria-live]")).toBeNull();
    });
});
