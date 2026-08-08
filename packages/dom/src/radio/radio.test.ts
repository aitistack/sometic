import { describe, expect, it } from "vitest";
import { createRadioGroupController, resolveRadio } from "./index.js";

describe("radio", () => {
    it("resolves item checked state", () => {
        expect(resolveRadio({ value: "a", checked: true }).nativeAttributes.type).toBe("radio");
    });

    it("tracks group value", () => {
        const group = createRadioGroupController({ name: "plan", defaultValue: "a" });
        expect(group.resolveItem("a").checked).toBe(true);
        group.setValue("b");
        expect(group.resolveItem("b").checked).toBe(true);
        expect(group.resolveItem("a").checked).toBe(false);
    });
});
