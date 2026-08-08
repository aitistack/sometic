import { describe, expect, it } from "vitest";
import {
    assertThemeContrast,
    auditThemeContrast,
    contrastRatio,
    meetsWcagContrast,
    parseHexColor,
    pickContrastingColor,
    relativeLuminance,
} from "./index.js";
import { defineSemanticTokens } from "../tokens/index.js";
import { lightTokens } from "../presets/index.js";

describe("contrast", () => {
    it("parses hex colors including shorthand", () => {
        expect(parseHexColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
        expect(parseHexColor("#112233")).toEqual({ r: 17, g: 34, b: 51 });
        expect(parseHexColor("nope")).toBeUndefined();
    });

    it("computes luminance and contrast", () => {
        const white = parseHexColor("#ffffff")!;
        const black = parseHexColor("#000000")!;
        expect(relativeLuminance(white)).toBeCloseTo(1, 5);
        expect(relativeLuminance(black)).toBeCloseTo(0, 5);
        expect(contrastRatio(black, white)).toBeCloseTo(21, 5);
    });

    it("checks WCAG thresholds", () => {
        expect(meetsWcagContrast("#000", "#fff", "AAA")).toBe(true);
        expect(meetsWcagContrast("#bbbbbb", "#fff", "AA")).toBe(false);
    });

    it("picks the more contrasting foreground", () => {
        expect(pickContrastingColor("#000000", "#ffffff", "#111111")).toBe("#ffffff");
        expect(pickContrastingColor("#ffffff", "#ffffff", "#111111")).toBe("#111111");
    });

    it("audits theme token contrast", () => {
        const ok = auditThemeContrast(lightTokens, "AA");
        expect(ok.ok).toBe(true);
        expect(ok.violations).toEqual([]);

        const weak = {
            color: {
                bg: "#ffffff",
                fg: "#eeeeee",
                primary: "#dddddd",
                danger: "#cccccc",
            },
        };
        const bad = auditThemeContrast(weak, "AA");
        expect(bad.ok).toBe(false);
        expect(bad.violations.length).toBeGreaterThan(0);
        expect(() => assertThemeContrast(weak)).toThrow(/Theme contrast audit failed/);
    });

    it("accepts primary as brand for semantic tokens", () => {
        expect(() => defineSemanticTokens(lightTokens)).not.toThrow();
        expect(() =>
            defineSemanticTokens({
                color: {
                    bg: "#fff",
                    fg: "#000",
                },
            }),
        ).toThrow(/Missing required semantic token paths/);
    });
});
