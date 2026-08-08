import { describe, expect, it } from "vitest";
import { resolveSpinner } from "./index.js";

describe("spinner", () => {
    it("is a polite status", () => {
        expect(resolveSpinner().attributes.role).toBe("status");
    });
});
