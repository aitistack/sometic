import { describe, expect, it } from "vitest";
import { createSwitchController, resolveSwitch } from "./index.js";

describe("switch", () => {
    it("uses switch role", () => {
        expect(resolveSwitch({ checked: true }).attributes.role).toBe("switch");
        expect(resolveSwitch({ checked: true }).attributes["aria-checked"]).toBe("true");
    });

    it("toggles via controller", () => {
        const controller = createSwitchController();
        controller.setChecked(true);
        expect(controller.checked.get()).toBe(true);
    });
});
