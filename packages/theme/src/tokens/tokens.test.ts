import { describe, expect, it } from "vitest";
import { defineTokens, mergeTokens, resolveToken } from "./index.js";

describe("tokens", () => {
    it("defineTokens returns the same object", () => {
        const tokens = defineTokens({ color: { primary: "#000" } });
        expect(tokens.color?.primary).toBe("#000");
    });

    it("mergeTokens layers later categories and keys", () => {
        expect(
            mergeTokens(
                { color: { primary: "a", muted: "m" }, space: { 1: 4 } },
                { color: { primary: "b" } },
            ),
        ).toEqual({
            color: { primary: "b", muted: "m" },
            space: { 1: 4 },
        });
    });

    it("resolveToken reads category.key paths", () => {
        const tokens = defineTokens({ color: { primary: "#111" } });
        expect(resolveToken(tokens, "color.primary")).toBe("#111");
        expect(resolveToken(tokens, "color.missing")).toBeUndefined();
        expect(resolveToken(tokens, "primary")).toBeUndefined();
    });
});
