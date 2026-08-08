import { describe, expect, it } from "vitest";
import { registerFormElements } from "./index.js";

describe("elements form", () => {
    it("registers sometic-form idempotently with optional registry", () => {
        registerFormElements(customElements);
        registerFormElements(customElements);
        expect(customElements.get("sometic-form")).toBeTruthy();
        const el = document.createElement("sometic-form");
        expect(el).toBeInstanceOf(HTMLElement);
    });
});
