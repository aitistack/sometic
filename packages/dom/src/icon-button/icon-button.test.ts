import { describe, expect, it } from "vitest";
import { resolveIconButton } from "./index.js";

describe("resolveIconButton", () => {
    it("requires aria-label", () => {
        expect(() => resolveIconButton({ "aria-label": "  " })).toThrow(/aria-label/);
        expect(resolveIconButton({ "aria-label": "Close" }).attributes["aria-label"]).toBe("Close");
    });
});
