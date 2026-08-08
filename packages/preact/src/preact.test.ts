import { describe, expect, it } from "vitest";
import { createPreactStoreBind } from "./index.js";

describe("preact store bind", () => {
    it("exposes external-store style API", () => {
        const bind = createPreactStoreBind({ count: 0 });
        let ticks = 0;
        const stop = bind.subscribe(() => {
            ticks += 1;
        });
        bind.set({ count: 1 });
        expect(bind.getSnapshot().count).toBe(1);
        expect(ticks).toBe(1);
        stop();
        bind.dispose();
    });
});
