import { describe, expect, it } from "vitest";
import { SometicError, createError, isSometicError } from "./index.js";

describe("error", () => {
    it("preserves code, cause, and details", () => {
        const cause = new Error("root");
        const error = createError({
            code: "TEST_CODE",
            message: "failed",
            cause,
            details: { field: "email" },
        });

        expect(error).toBeInstanceOf(SometicError);
        expect(error.code).toBe("TEST_CODE");
        expect(error.cause).toBe(cause);
        expect(error.details).toEqual({ field: "email" });
        expect(isSometicError(error)).toBe(true);
        expect(isSometicError(new Error("x"))).toBe(false);
    });
});
