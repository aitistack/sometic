import { describe, expect, it } from "vitest";
import { createCurrencyInputController } from "./index.js";

describe("createCurrencyInputController", () => {
    it("parses display into numeric value", () => {
        const controller = createCurrencyInputController({
            locale: "en-US",
            currency: "USD",
        });
        controller.setFromDisplay("$12.34");
        expect(controller.value.get()).toBe(12.34);
        expect(controller.getDisplayValue()).toContain("12.34");
    });
});
