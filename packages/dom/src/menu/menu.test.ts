import { describe, expect, it } from "vitest";
import { resolveMenu, resolveMenuItem } from "./index.js";

describe("menu", () => {
    it("resolves menu role", () => {
        expect(resolveMenu({ open: true }).attributes.role).toBe("menu");
    });
    it("resolves menuitem", () => {
        expect(resolveMenuItem({ disabled: true }).attributes.role).toBe("menuitem");
        expect(resolveMenuItem({ disabled: true }).attributes["aria-disabled"]).toBe("true");
    });
});
