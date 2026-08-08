import { resolveCssVariables } from "@sometic/styling/styles";
import type { ThemeTokens, TokenValue } from "../tokens/index.js";

export type TokensToCssVariablesOptions = {
    prefix?: string;
};

function tokenToFlatKey(category: string, key: string, prefix: string): string {
    const base = `${category}-${key}`.replace(/[^a-zA-Z0-9_-]+/g, "-");
    return prefix.length > 0 ? `${prefix}-${base}` : base;
}

export function tokensToCssVariables(
    tokens: ThemeTokens,
    options: TokensToCssVariablesOptions = {},
): Record<string, string> {
    const prefix = options.prefix ?? "sometic";
    const flat: Record<string, TokenValue> = {};
    for (const category of Object.keys(tokens)) {
        const scale = tokens[category];
        if (scale == null) {
            continue;
        }
        for (const key of Object.keys(scale)) {
            const value = scale[key];
            if (value === undefined) {
                continue;
            }
            flat[tokenToFlatKey(category, key, prefix)] = value;
        }
    }
    return resolveCssVariables(flat);
}

export function serializeCssVariables(
    variables: Readonly<Record<string, string>>,
    options: { selector?: string } = {},
): string {
    const selector = options.selector ?? ":root";
    const lines = Object.keys(variables)
        .sort()
        .map((name) => `  ${name}: ${variables[name]};`);
    if (lines.length === 0) {
        return `${selector} {}`;
    }
    return `${selector} {\n${lines.join("\n")}\n}`;
}
