import { describe, expect, it } from "vitest";
import { collectClassTokens, createClassResolver, resolveClasses } from "./index.js";

describe("resolveClasses", () => {
    it("joins strings and skips falsy values", () => {
        expect(resolveClasses("a", false, null, undefined, "b", true)).toBe("a b");
    });

    it("flattens arrays and dictionaries", () => {
        expect(resolveClasses(["a", ["b", { c: true, d: false }]], { e: true })).toBe("a b c e");
    });

    it("splits whitespace inside strings", () => {
        expect(resolveClasses("  a   b  ", "c")).toBe("a b c");
    });

    it("accepts numbers as tokens", () => {
        expect(resolveClasses(1, "x")).toBe("1 x");
    });

    it("supports a consumer-provided merger", () => {
        const resolve = createClassResolver({
            merge: (tokens) => [...new Set(tokens)].join(" "),
        });
        expect(resolve("a", "a", "b")).toBe("a b");
    });

    it("collectClassTokens returns the token list", () => {
        expect(collectClassTokens("a", { b: true })).toEqual(["a", "b"]);
    });
});
