import { describe, expect, it } from "vitest";
import { resolveSkeleton } from "./index.js";

describe("skeleton", () => {
    it("is aria-hidden", () => {
        expect(resolveSkeleton().attributes["aria-hidden"]).toBe("true");
    });
});
