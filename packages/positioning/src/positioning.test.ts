import { describe, expect, it } from "vitest";

import { computePosition } from "./index.js";

describe("computePosition", () => {
    it("places floating below the reference for bottom placement", () => {
        const reference = { x: 100, y: 100, width: 50, height: 20 };
        const floating = { x: 0, y: 0, width: 40, height: 30 };

        const result = computePosition(
            reference,
            floating,
            {
                placement: "bottom",
                offset: 8,
                flip: false,
                shift: false,
            },
            { width: 1000, height: 1000 },
        );

        expect(result.x).toBe(105);
        expect(result.y).toBe(128);
        expect(result.placement).toBe("bottom");
        expect(result.middlewareData.flipped).toBe(false);
        expect(result.middlewareData.shifted).toBe(false);
    });

    it("flips to top when bottom would overflow the viewport", () => {
        const reference = { x: 100, y: 900, width: 50, height: 20 };
        const floating = { x: 0, y: 0, width: 40, height: 100 };

        const result = computePosition(
            reference,
            floating,
            {
                placement: "bottom",
                offset: 8,
                shift: false,
            },
            { width: 1000, height: 1000 },
        );

        expect(result.middlewareData.flipped).toBe(true);
        expect(result.placement).toBe("top");
        expect(result.x).toBe(105);
        expect(result.y).toBe(792);
    });

    it("shifts horizontally when floating overflows the viewport", () => {
        const reference = { x: 980, y: 100, width: 50, height: 20 };
        const floating = { x: 0, y: 0, width: 100, height: 30 };

        const result = computePosition(
            reference,
            floating,
            {
                placement: "bottom",
                offset: 8,
                flip: false,
                padding: 8,
            },
            { width: 1000, height: 1000 },
        );

        expect(result.middlewareData.shifted).toBe(true);
        expect(result.x).toBe(892);
        expect(result.y).toBe(128);
    });

    it("parses top-start placement alignment", () => {
        const reference = { x: 100, y: 200, width: 80, height: 40 };
        const floating = { x: 0, y: 0, width: 60, height: 30 };

        const result = computePosition(
            reference,
            floating,
            {
                placement: "top-start",
                offset: 8,
                flip: false,
                shift: false,
            },
            { width: 1000, height: 1000 },
        );

        expect(result.placement).toBe("top-start");
        expect(result.x).toBe(100);
        expect(result.y).toBe(162);
    });
});
