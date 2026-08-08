import { describe, expect, it } from "vitest";
import { createToggleButtonController, resolveToggleButton } from "./index.js";

describe("toggle-button", () => {
    it("exposes aria-pressed", () => {
        expect(resolveToggleButton({ pressed: true }).attributes["aria-pressed"]).toBe("true");
        expect(resolveToggleButton({ pressed: false }).attributes["data-pressed"]).toBe("false");
    });

    it("toggles controllable pressed state", () => {
        const controller = createToggleButtonController({ defaultPressed: false });
        controller.toggle();
        expect(controller.pressed.get()).toBe(true);
        expect(controller.resolve().attributes["aria-pressed"]).toBe("true");
    });
});
