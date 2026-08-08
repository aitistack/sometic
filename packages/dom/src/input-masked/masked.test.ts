import { describe, expect, it } from "vitest";
import { createMaskedInputController, formatMasked } from "./index.js";

describe("masked input", () => {
    it("formats phone-like masks", () => {
        expect(formatMasked("1234567", "(###) ###").display).toBe("(123) 456");
        expect(formatMasked("1234567", "(###) ###").raw).toBe("123456");
    });

    it("stores raw digits", () => {
        const controller = createMaskedInputController({ mask: "###-##" });
        controller.applyInput("12a345");
        expect(controller.rawValue.get()).toBe("12345");
        expect(controller.getDisplayValue()).toBe("123-45");
    });
});
