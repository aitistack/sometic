import { describe, expect, it } from "vitest";
import { createCheckboxController, resolveCheckbox } from "./index.js";

describe("checkbox", () => {
    it("resolves checked and indeterminate", () => {
        expect(resolveCheckbox({ checked: true }).attributes["aria-checked"]).toBe("true");
        expect(resolveCheckbox({ indeterminate: true }).attributes["aria-checked"]).toBe("mixed");
    });

    it("toggles via controller", () => {
        const controller = createCheckboxController({ defaultChecked: false });
        controller.toggle();
        expect(controller.checked.get()).toBe(true);
    });
});
