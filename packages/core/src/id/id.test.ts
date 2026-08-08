import { describe, expect, it } from "vitest";
import { createId, createPrefixedId } from "./index.js";

describe("id", () => {
    it("creates unique ids", () => {
        const left = createId();
        const right = createId();
        expect(left).not.toBe(right);
        expect(left.length).toBeGreaterThan(8);
    });

    it("creates prefixed ids and rejects empty prefixes", () => {
        expect(createPrefixedId("btn")).toMatch(/^btn_/);
        expect(() => createPrefixedId("")).toThrow(/non-empty prefix/);
    });
});
