import { describe, expect, it } from "vitest";
import { resolveAlert } from "./index.js";

describe("alert", () => {
    it("uses assertive alert for danger", () => {
        const view = resolveAlert({ tone: "danger" });
        expect(view.attributes.role).toBe("alert");
        expect(view.attributes["aria-live"]).toBe("assertive");
        expect(view.attributes["data-tone"]).toBe("danger");
    });

    it("defaults to polite status", () => {
        const view = resolveAlert();
        expect(view.attributes.role).toBe("status");
        expect(view.live).toBe("polite");
    });
});
