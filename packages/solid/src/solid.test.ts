import { describe, expect, it } from "vitest";
import { createSolidStoreBind } from "./index.js";

describe("solid store bind", () => {
    it("reads and updates", () => {
        const bind = createSolidStoreBind({ count: 1 });
        bind.set({ count: 2 });
        expect(bind.get().count).toBe(2);
        bind.dispose();
    });
});
