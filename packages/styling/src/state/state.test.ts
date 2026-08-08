import { describe, expect, it } from "vitest";
import { STATE_ATTRIBUTE_KEYS, resolveStateAttributes } from "./index.js";

describe("resolveStateAttributes", () => {
    it("emits only true boolean flags with default true value", () => {
        expect(
            resolveStateAttributes({
                disabled: true,
                loading: false,
                invalid: true,
            }),
        ).toEqual({
            [STATE_ATTRIBUTE_KEYS.disabled]: "true",
            [STATE_ATTRIBUTE_KEYS.invalid]: "true",
        });
    });

    it("supports empty-string boolean values", () => {
        expect(resolveStateAttributes({ selected: true }, { booleanValue: "" })).toEqual({
            [STATE_ATTRIBUTE_KEYS.selected]: "",
        });
    });

    it("encodes indeterminate checked", () => {
        expect(resolveStateAttributes({ checked: "indeterminate" })).toEqual({
            [STATE_ATTRIBUTE_KEYS.checked]: "indeterminate",
        });
        expect(resolveStateAttributes({ checked: true })).toEqual({
            [STATE_ATTRIBUTE_KEYS.checked]: "true",
        });
        expect(resolveStateAttributes({ checked: false })).toEqual({});
    });

    it("writes orientation size and variant strings", () => {
        expect(
            resolveStateAttributes({
                orientation: "vertical",
                size: "md",
                variant: "solid",
            }),
        ).toEqual({
            [STATE_ATTRIBUTE_KEYS.orientation]: "vertical",
            [STATE_ATTRIBUTE_KEYS.size]: "md",
            [STATE_ATTRIBUTE_KEYS.variant]: "solid",
        });
    });

    it("omits empty string enum values", () => {
        expect(resolveStateAttributes({ size: "", variant: "ghost" })).toEqual({
            [STATE_ATTRIBUTE_KEYS.variant]: "ghost",
        });
    });
});
