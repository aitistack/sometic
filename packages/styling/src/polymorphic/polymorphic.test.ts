import { describe, expect, it } from "vitest";
import { resolvePolymorphicAs } from "./index.js";

describe("resolvePolymorphicAs", () => {
    it("returns default when as is missing or blank", () => {
        expect(resolvePolymorphicAs(undefined, "button")).toBe("button");
        expect(resolvePolymorphicAs(null, "button")).toBe("button");
        expect(resolvePolymorphicAs("   ", "button")).toBe("button");
    });

    it("returns trimmed as when provided", () => {
        expect(resolvePolymorphicAs("a", "button")).toBe("a");
        expect(resolvePolymorphicAs("  span  ", "button")).toBe("span");
    });
});
