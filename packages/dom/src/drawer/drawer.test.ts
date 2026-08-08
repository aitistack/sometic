import { describe, expect, it } from "vitest";
import { resolveDrawer } from "./index.js";

describe("resolveDrawer", () => {
    it("sets side and dialog role", () => {
        const view = resolveDrawer({ open: true, side: "left" });
        expect(view.attributes.role).toBe("dialog");
        expect(view.attributes["data-side"]).toBe("left");
        expect(view.attributes["aria-modal"]).toBe("true");
    });
});
