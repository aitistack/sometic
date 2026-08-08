import { describe, expect, it } from "vitest";
import { resolveBadge } from "./index.js";

describe("badge", () => {
    it("sets tone", () => {
        expect(resolveBadge({ tone: "success" }).attributes["data-tone"]).toBe("success");
    });
});
