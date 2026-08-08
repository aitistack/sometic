import { describe, expect, it } from "vitest";
import { createAngularStoreBind } from "./index.js";

describe("angular store bind", () => {
    it("updates and disposes", () => {
        const bind = createAngularStoreBind({ count: 0 });
        bind.update((state) => ({ count: state.count + 1 }));
        expect(bind.get().count).toBe(1);
        bind.dispose();
        expect(bind.get().count).toBe(1);
    });
});
