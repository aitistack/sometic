import { describe, expect, it } from "vitest";
import { resolveProgress } from "./index.js";

describe("progress", () => {
    it("sets valuemax", () => {
        expect(resolveProgress({ value: 40, max: 100 }).attributes["aria-valuenow"]).toBe("40");
    });
});
