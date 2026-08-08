import { describe, expect, it } from "vitest";
import {
    getRegistry,
    getRegistryItem,
    resolveItemFiles,
    verifyRegistryChecksums,
} from "./index.js";

describe("@sometic/registry", () => {
    it("lists core templates", () => {
        const names = getRegistry()
            .map((item) => item.name)
            .sort();
        expect(names).toEqual(["button", "config", "theme"]);
    });

    it("resolves button files per framework", () => {
        const item = getRegistryItem("button");
        expect(item).toBeDefined();
        const react = resolveItemFiles(item!, "react", "hybrid");
        expect(react[0]?.path).toBe("button.tsx");
        expect(react[0]?.content).toContain("@sometic/react/button");
        const vanilla = resolveItemFiles(item!, "vanilla", "hybrid");
        expect(vanilla[0]?.content).toContain("@sometic/dom/button");
    });

    it("verifies checksums", () => {
        expect(() => verifyRegistryChecksums()).not.toThrow();
    });
});
