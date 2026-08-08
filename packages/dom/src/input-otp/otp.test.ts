import { describe, expect, it } from "vitest";
import { createOtpInputController } from "./index.js";

describe("createOtpInputController", () => {
    it("applies paste and clamps length", () => {
        const controller = createOtpInputController({ length: 4 });
        controller.applyPaste("12a34b56");
        expect(controller.value.get()).toBe("1234");
    });

    it("sets and clears digits by index", () => {
        const controller = createOtpInputController({ length: 4 });
        controller.setCharAt(0, "1");
        controller.setCharAt(1, "2");
        expect(controller.value.get()).toBe("12");
        controller.setCharAt(0, "");
        expect(controller.value.get()).toBe("2");
    });
});
