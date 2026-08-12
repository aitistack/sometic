import { describe, expect, it } from "vitest";
import {
    collapseBreadcrumbItems,
    resolveBreadcrumb,
    resolveBreadcrumbEllipsis,
    resolveBreadcrumbItem,
} from "./index.js";

describe("breadcrumb", () => {
    it("resolves nav and current item attributes", () => {
        expect(resolveBreadcrumb().attributes["aria-label"]).toBe("Breadcrumb");
        expect(resolveBreadcrumbItem({ current: true }).attributes["aria-current"]).toBe("page");
        expect(resolveBreadcrumbEllipsis().attributes["data-slot"]).toBe("ellipsis");
    });

    it("collapses middle items when maxItems is set", () => {
        const items = [
            { id: "1", label: "Home" },
            { id: "2", label: "Docs" },
            { id: "3", label: "Guide" },
            { id: "4", label: "Intro" },
        ];
        const result = collapseBreadcrumbItems(items, 3);
        expect(result.items).toHaveLength(3);
        expect(result.items[1]).toEqual({ id: "__breadcrumb_ellipsis__", ellipsis: true });
        expect(result.collapsed.map((item) => item.id)).toEqual(["2", "3"]);
    });
});
