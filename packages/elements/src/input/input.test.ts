import { describe, expect, it } from "vitest";
import { registerInputElements } from "./index.js";

describe("elements input", () => {
    it("registers parity tags", () => {
        registerInputElements();
        for (const tag of [
            "sometic-field",
            "sometic-input",
            "sometic-password-input",
            "sometic-otp-input",
            "sometic-number-input",
            "sometic-file-input",
            "sometic-masked-input",
            "sometic-currency-input",
            "sometic-date-input",
        ] as const) {
            expect(customElements.get(tag)).toBeTruthy();
            const el = document.createElement(tag);
            expect(el).toBeInstanceOf(HTMLElement);
        }
    });

    it("emits typed value-change for number input", () => {
        registerInputElements();
        const el = document.createElement("sometic-number-input");
        document.body.appendChild(el);
        let detail: { value: number | null } | null = null;
        el.addEventListener("value-change", ((event: CustomEvent<{ value: number | null }>) => {
            detail = event.detail;
        }) as EventListener);
        const input = el.querySelector("input") ?? el.shadowRoot?.querySelector("input");
        expect(input).toBeTruthy();
        if (input) {
            input.value = "4";
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        expect(detail).toEqual({ value: 4 });
        el.remove();
    });

    it("supports Shadow opt-in on inputs", () => {
        registerInputElements();
        const el = document.createElement("sometic-input");
        el.setAttribute("shadow", "");
        document.body.appendChild(el);
        expect(el.shadowRoot?.querySelector("input")).toBeTruthy();
        el.remove();
    });

    it("renders file face with type-aware icon", () => {
        registerInputElements();
        const el = document.createElement("sometic-file-input");
        el.setAttribute("accept", ".png,.pdf");
        document.body.appendChild(el);
        expect(el.querySelector('[data-slot="face"]')).toBeTruthy();
        expect(el.querySelector('[data-slot="icon"] svg')).toBeTruthy();
        expect(el.getAttribute("data-file-kind")).toBe("file");
        expect(el.querySelector('[data-slot="title"]')?.textContent).toBe("Choose file");
        expect(el.querySelector('[data-slot="hint"]')?.textContent).toBe("");
        const input = el.querySelector("input[type='file']");
        expect(input?.getAttribute("accept")).toContain(".png");
        el.remove();
    });
});
