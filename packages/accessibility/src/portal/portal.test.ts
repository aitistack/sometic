import { describe, expect, it } from "vitest";
import { createPortalRoot } from "./index.js";

describe("portal", () => {
    it("creates and removes a portal root", () => {
        const portal = createPortalRoot({ id: "sometic-portal" });
        const element = portal.ensure();
        expect(element).toBeTruthy();
        expect(document.getElementById("sometic-portal")).toBe(element);
        portal.dispose();
        expect(document.getElementById("sometic-portal")).toBeNull();
    });
});
