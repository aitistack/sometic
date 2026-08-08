import { describe, expect, it } from "vitest";
import { err, isErr, isOk, mapResult, ok, unwrap } from "./index.js";

describe("result", () => {
    it("supports ok and err flows", () => {
        const success = ok(42);
        const failure = err(new Error("nope"));

        expect(isOk(success)).toBe(true);
        expect(isErr(failure)).toBe(true);
        expect(unwrap(success)).toBe(42);
        expect(() => unwrap(failure)).toThrow("nope");
        expect(mapResult(success, (value) => value * 2)).toEqual(ok(84));
        expect(mapResult(failure, (value) => value)).toBe(failure);
    });
});
