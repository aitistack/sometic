import { describe, expect, it } from "vitest";
import { createSelectController, resolveSelect } from "./index.js";

describe("select", () => {
    it("resolves options and value", () => {
        const view = resolveSelect({
            value: "b",
            options: [
                { value: "a", label: "A" },
                { value: "b", label: "B" },
            ],
        });
        expect(view.value).toBe("b");
        expect(view.options).toHaveLength(2);
    });

    it("updates via controller", () => {
        const controller = createSelectController({
            defaultValue: null,
            options: [{ value: "x", label: "X" }],
        });
        controller.setValue("x");
        expect(controller.value.get()).toBe("x");
        expect(controller.resolve().value).toBe("x");
    });
});
