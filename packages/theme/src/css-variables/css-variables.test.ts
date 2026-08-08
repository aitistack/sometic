import { describe, expect, it } from "vitest";
import { serializeCssVariables, tokensToCssVariables } from "./index.js";
import { defineTokens } from "../tokens/index.js";

describe("css-variables", () => {
    it("flattens tokens with prefix", () => {
        const vars = tokensToCssVariables(
            defineTokens({ color: { primary: "#2563eb" }, space: { 2: "0.5rem" } }),
            { prefix: "sometic" },
        );
        expect(vars).toEqual({
            "--sometic-color-primary": "#2563eb",
            "--sometic-space-2": "0.5rem",
        });
    });

    it("serializes a CSS block", () => {
        expect(serializeCssVariables({ "--a": "1", "--b": "2" }, { selector: ".scope" })).toBe(
            ".scope {\n  --a: 1;\n  --b: 2;\n}",
        );
    });
});
