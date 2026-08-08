import { describe, expect, it } from "vitest";
import { STYLE_OVERRIDE_PRIORITY, resolveStyleable } from "./resolve-styleable.js";

describe("resolveStyleable", () => {
    it("documents override priority order", () => {
        expect([...STYLE_OVERRIDE_PRIORITY]).toEqual([
            "behavior",
            "defaults",
            "variants",
            "state",
            "user",
            "cssVariables",
        ]);
    });

    it("applies deterministic class and style layers", () => {
        const resolved = resolveStyleable({
            behavior: { className: "sr-only", style: { position: "absolute" } },
            defaults: { className: "btn", style: { color: "black" } },
            variants: { className: "btn-md", style: { fontSize: "14px" } },
            state: { className: { "is-disabled": true }, style: { opacity: 0.5 } },
            user: { className: "my-btn", style: { color: "navy" } },
            cssVariables: { "btn-pad": "8px" },
        });

        expect(resolved.className).toBe("sr-only btn btn-md is-disabled my-btn");
        expect(resolved.style).toEqual({
            position: "absolute",
            color: "navy",
            fontSize: "14px",
            opacity: "0.5",
            "--btn-pad": "8px",
        });
    });

    it("skips defaults and variants when unstyled", () => {
        const resolved = resolveStyleable({
            unstyled: true,
            behavior: { className: "sr-only", style: { clip: "1px" } },
            defaults: { className: "btn", style: { color: "black" } },
            variants: { className: "btn-lg", style: { fontSize: "18px" } },
            state: { className: "is-loading" },
            user: { className: "custom", style: { color: "tomato" } },
            cssVariables: { accent: "red" },
        });

        expect(resolved.className).toBe("sr-only is-loading custom");
        expect(resolved.style).toEqual({
            clip: "1px",
            color: "tomato",
            "--accent": "red",
        });
    });

    it("uses consumer merge for class tokens", () => {
        const resolved = resolveStyleable({
            defaults: { className: "a a" },
            user: { className: "a b" },
            merge: (tokens) => [...new Set(tokens)].join("-"),
        });
        expect(resolved.className).toBe("a-b");
    });
});
