import { describe, expect, it } from "vitest";
import {
    createAccordionController,
    getAccordionKeyboardAction,
    shouldMountAccordionPanel,
} from "./index.js";

describe("accordion", () => {
    it("toggles single and multiple values", () => {
        const single = createAccordionController({ type: "single", defaultValue: "a" });
        expect(single.isOpen("a")).toBe(true);
        single.toggle("a");
        expect(single.isOpen("a")).toBe(false);
        single.toggle("b");
        expect(single.isOpen("b")).toBe(true);

        const multiple = createAccordionController({ type: "multiple", defaultValue: ["a"] });
        multiple.toggle("b");
        expect(multiple.isOpen("a")).toBe(true);
        expect(multiple.isOpen("b")).toBe(true);
    });

    it("respects collapsible=false in single mode", () => {
        const accordion = createAccordionController({
            type: "single",
            defaultValue: "a",
            collapsible: false,
        });
        accordion.toggle("a");
        expect(accordion.isOpen("a")).toBe(true);
    });

    it("computes keyboard focus and toggle actions", () => {
        const items = [{ value: "a" }, { value: "b", disabled: true }, { value: "c" }];
        expect(
            getAccordionKeyboardAction({ key: " " }, { items, currentValue: "a" }),
        ).toEqual({ toggle: "a" });
        expect(
            getAccordionKeyboardAction({ key: "ArrowDown" }, { items, currentValue: "a" }),
        ).toEqual({ focus: "c" });
        expect(
            getAccordionKeyboardAction({ key: "Home" }, { items, currentValue: "c" }),
        ).toEqual({ focus: "a" });
    });

    it("respects lazyMount panel policy", () => {
        expect(shouldMountAccordionPanel({ open: false, lazyMount: true })).toBe(false);
        expect(shouldMountAccordionPanel({ open: true, lazyMount: true })).toBe(true);
        expect(shouldMountAccordionPanel({ open: false, forceMount: true })).toBe(true);
    });
});
