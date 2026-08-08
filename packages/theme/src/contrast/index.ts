import { resolveToken, type ThemeTokens, type TokenValue } from "../tokens/index.js";

export type RgbColor = {
    readonly r: number;
    readonly g: number;
    readonly b: number;
};

export type WcagLevel = "AA" | "AAA";

export type TextSize = "normal" | "large";

export type ContrastViolation = {
    readonly path: string;
    readonly ratio: number;
    readonly required: number;
};

export type ContrastAuditResult = {
    readonly ok: boolean;
    readonly violations: readonly ContrastViolation[];
};

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function parseHexColor(input: string): RgbColor | undefined {
    const trimmed = input.trim();
    const match = HEX_RE.exec(trimmed);
    if (!match) {
        return undefined;
    }
    let hex = match[1]!;
    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((ch) => ch + ch)
            .join("");
    }
    return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
    };
}

function channelLuminance(channel: number): number {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: RgbColor): number {
    return (
        0.2126 * channelLuminance(color.r) +
        0.7152 * channelLuminance(color.g) +
        0.0722 * channelLuminance(color.b)
    );
}

export function contrastRatio(foreground: RgbColor, background: RgbColor): number {
    const left = relativeLuminance(foreground);
    const right = relativeLuminance(background);
    const lighter = Math.max(left, right);
    const darker = Math.min(left, right);
    return (lighter + 0.05) / (darker + 0.05);
}

function requiredContrast(level: WcagLevel, size: TextSize): number {
    if (level === "AAA") {
        return size === "large" ? 4.5 : 7;
    }
    return size === "large" ? 3 : 4.5;
}

export function meetsWcagContrast(
    foreground: RgbColor | string,
    background: RgbColor | string,
    level: WcagLevel = "AA",
    size: TextSize = "normal",
): boolean {
    const fg = typeof foreground === "string" ? parseHexColor(foreground) : foreground;
    const bg = typeof background === "string" ? parseHexColor(background) : background;
    if (fg == null || bg == null) {
        return false;
    }
    return contrastRatio(fg, bg) >= requiredContrast(level, size);
}

export function pickContrastingColor(
    background: RgbColor | string,
    light: string,
    dark: string,
): string {
    const bg = typeof background === "string" ? parseHexColor(background) : background;
    const lightRgb = parseHexColor(light);
    const darkRgb = parseHexColor(dark);
    if (bg == null || lightRgb == null || darkRgb == null) {
        return dark;
    }
    return contrastRatio(lightRgb, bg) >= contrastRatio(darkRgb, bg) ? light : dark;
}

const DEFAULT_PAIRS: ReadonlyArray<{
    foreground: string;
    background: string;
    path: string;
}> = [
    { foreground: "color.fg", background: "color.bg", path: "color.fg/color.bg" },
    { foreground: "color.brand", background: "color.bg", path: "color.brand/color.bg" },
    { foreground: "color.primary", background: "color.bg", path: "color.primary/color.bg" },
    { foreground: "color.danger", background: "color.bg", path: "color.danger/color.bg" },
];

function requiredAuditRatio(level: WcagLevel): number {
    return level === "AAA" ? 7 : 4.5;
}

function asColorString(value: TokenValue | undefined): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }
    return value;
}

export function auditThemeContrast(
    tokens: ThemeTokens,
    level: WcagLevel = "AA",
): ContrastAuditResult {
    const required = requiredAuditRatio(level);
    const violations: ContrastViolation[] = [];
    const seen = new Set<string>();

    for (const pair of DEFAULT_PAIRS) {
        if (seen.has(pair.path)) {
            continue;
        }
        const foregroundValue = asColorString(resolveToken(tokens, pair.foreground));
        const backgroundValue = asColorString(resolveToken(tokens, pair.background));
        if (foregroundValue === undefined || backgroundValue === undefined) {
            continue;
        }
        const foreground = parseHexColor(foregroundValue);
        const background = parseHexColor(backgroundValue);
        if (foreground == null || background == null) {
            continue;
        }
        seen.add(pair.path);
        const ratio = contrastRatio(foreground, background);
        if (ratio < required) {
            violations.push({
                path: pair.path,
                ratio,
                required,
            });
        }
    }

    return {
        ok: violations.length === 0,
        violations,
    };
}

export function assertThemeContrast(tokens: ThemeTokens, level: WcagLevel = "AA"): void {
    const result = auditThemeContrast(tokens, level);
    if (result.ok) {
        return;
    }
    const detail = result.violations
        .map(
            (item) =>
                `${item.path} ratio ${item.ratio.toFixed(2)} < required ${String(item.required)}`,
        )
        .join("; ");
    throw new Error(`Theme contrast audit failed (${level}): ${detail}`);
}
