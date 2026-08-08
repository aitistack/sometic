import { describe, expect, it } from "vitest";
import { createNumberInputController } from "./index.js";

describe("createNumberInputController", () => {
    it("parses empty as null and clamps", () => {
        const controller = createNumberInputController({ min: 0, max: 10 });
        controller.setFromString("");
        expect(controller.value.get()).toBeNull();
        controller.setFromString("15");
        expect(controller.value.get()).toBe(10);
    });
});
