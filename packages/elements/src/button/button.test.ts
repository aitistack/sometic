import { describe, expect, it } from "vitest";
import { registerButtonElements } from "./index.js";

describe("elements button", () => {
    it("registers and upgrades sometic-button", () => {
        registerButtonElements();
        const el = document.createElement("sometic-button");
        el.textContent = "OK";
        document.body.appendChild(el);
        const inner = el.querySelector("button");
        expect(inner?.getAttribute("data-slot")).toBe("root");
        expect(inner?.textContent).toContain("OK");
        el.remove();
    });

    it("is idempotent across registries", () => {
        registerButtonElements();
        registerButtonElements();
        expect(customElements.get("sometic-button")).toBeTruthy();
        expect(customElements.get("sometic-async-button")).toBeTruthy();
    });

    it("defaults to Light DOM and supports Shadow opt-in", () => {
        registerButtonElements();
        const light = document.createElement("sometic-button");
        light.textContent = "Light";
        document.body.appendChild(light);
        expect(light.shadowRoot).toBeNull();
        expect(light.querySelector("button")).toBeTruthy();
        light.remove();

        const shadow = document.createElement("sometic-button");
        shadow.setAttribute("shadow", "");
        shadow.textContent = "Shadow";
        document.body.appendChild(shadow);
        expect(shadow.shadowRoot).toBeTruthy();
        expect(shadow.shadowRoot?.querySelector("button")).toBeTruthy();
        expect(shadow.querySelector("button")).toBeNull();
        shadow.remove();
    });

    it("maps tags to constructors", () => {
        registerButtonElements();
        const el = document.createElement("sometic-async-button");
        expect(el).toBeInstanceOf(HTMLElement);
        expect(el.localName).toBe("sometic-async-button");
    });
});
