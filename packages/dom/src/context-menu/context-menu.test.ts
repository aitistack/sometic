import { describe, expect, it } from "vitest";
import { resolveContextMenu } from "./index.js";

describe("resolveContextMenu", () => {
    it("uses fixed coords", () => {
        const view = resolveContextMenu({ open: true, x: 10, y: 20 });
        expect(view.style.left).toBe("10px");
        expect(view.style.top).toBe("20px");
        expect(view.attributes.role).toBe("menu");
    });
});
