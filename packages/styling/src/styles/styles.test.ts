import { describe, expect, it } from "vitest";
import { resolveCssVariables, resolveStyles } from "./index.js";

describe("resolveStyles", () => {
    it("merges layers with later values winning", () => {
        expect(
            resolveStyles({ color: "red", opacity: 1 }, { color: "blue" }, { display: "block" }),
        ).toEqual({ color: "blue", opacity: "1", display: "block" });
    });

    it("skips undefined and deletes on null", () => {
        expect(
            resolveStyles({ color: "red", margin: "1px" }, { color: null, margin: undefined }),
        ).toEqual({ margin: "1px" });
    });

    it("ignores null layers", () => {
        expect(resolveStyles(null, undefined, { color: "navy" })).toEqual({ color: "navy" });
    });
});

describe("resolveCssVariables", () => {
    it("prefixes bare names and preserves -- names", () => {
        expect(resolveCssVariables({ "btn-bg": "navy", "--gap": 8 })).toEqual({
            "--btn-bg": "navy",
            "--gap": "8",
        });
    });

    it("skips nullish values", () => {
        expect(resolveCssVariables({ a: null, b: undefined, c: "1" })).toEqual({ "--c": "1" });
    });

    it("returns empty object for nullish input", () => {
        expect(resolveCssVariables(null)).toEqual({});
        expect(resolveCssVariables(undefined)).toEqual({});
    });
});
