import { describe, expect, it } from "vitest";
import { createImmerStore } from "./index.js";

describe("createImmerStore", () => {
    it("updates nested state through produce", () => {
        const store = createImmerStore({ count: 0, nested: { ok: true } });
        store.produce((draft) => {
            draft.count += 1;
            draft.nested.ok = false;
        });
        expect(store.get()).toEqual({ count: 1, nested: { ok: false } });
        store.dispose();
    });
});
