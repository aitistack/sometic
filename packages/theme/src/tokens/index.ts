export type TokenValue = string | number;

export type TokenScale = Readonly<Record<string, TokenValue>>;

export type ThemeTokens = Readonly<Record<string, TokenScale>>;

export const REQUIRED_SEMANTIC_TOKEN_PATHS = [
    "color.bg",
    "color.fg",
    "color.brand",
    "color.danger",
] as const;

export type SemanticTokenPath = (typeof REQUIRED_SEMANTIC_TOKEN_PATHS)[number];

export type DefineSemanticTokensOptions = {
    readonly strict?: boolean;
};

export function defineTokens<T extends ThemeTokens>(tokens: T): T {
    return tokens;
}

export function defineSemanticTokens<T extends ThemeTokens>(
    tokens: T,
    options: DefineSemanticTokensOptions = {},
): T {
    const missing: string[] = [];
    for (const path of REQUIRED_SEMANTIC_TOKEN_PATHS) {
        const value = resolveToken(tokens, path);
        if (value === undefined) {
            if (path === "color.brand" && resolveToken(tokens, "color.primary") !== undefined) {
                continue;
            }
            missing.push(path);
        }
    }

    if (missing.length > 0 && options.strict !== false) {
        throw new Error(`Missing required semantic token paths: ${missing.join(", ")}`);
    }

    return defineTokens(tokens);
}

export function mergeTokens(...layers: Array<ThemeTokens | null | undefined>): ThemeTokens {
    const result: Record<string, Record<string, TokenValue>> = {};
    for (const layer of layers) {
        if (layer == null) {
            continue;
        }
        for (const category of Object.keys(layer)) {
            const scale = layer[category];
            if (scale == null) {
                continue;
            }
            const target = result[category] ?? (result[category] = {});
            for (const key of Object.keys(scale)) {
                const value = scale[key];
                if (value !== undefined) {
                    target[key] = value;
                }
            }
        }
    }
    return result;
}

export function resolveToken(tokens: ThemeTokens, path: string): TokenValue | undefined {
    const trimmed = path.trim();
    if (trimmed.length === 0) {
        return undefined;
    }
    const separator = trimmed.indexOf(".");
    if (separator <= 0 || separator === trimmed.length - 1) {
        return undefined;
    }
    const category = trimmed.slice(0, separator);
    const key = trimmed.slice(separator + 1);
    const scale = tokens[category];
    if (scale == null) {
        return undefined;
    }
    return scale[key];
}
