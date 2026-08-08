import { describe, expect, it } from "vitest";
import { resolveBreadcrumb, resolveBreadcrumbItem } from "./index.js";

describe("breadcrumb", () => {
    it("marks current item", () => {
        expect(resolveBreadcrumb().attributes["aria-label"]).toBe("Breadcrumb");
        expect(resolveBreadcrumbItem({ current: true }).attributes["aria-current"]).toBe("page");
    });
});
