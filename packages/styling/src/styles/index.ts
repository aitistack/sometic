export type StylePropertyValue = string | number | null | undefined;

export type StyleValue = Readonly<Record<string, StylePropertyValue>>;

export type CssVariables = Readonly<Record<string, StylePropertyValue>>;

function normalizeStyleProperty(value: string | number): string {
    return typeof value === "number" ? String(value) : value;
}

export function resolveStyles(
    ...layers: Array<StyleValue | null | undefined>
): Record<string, string> {
    const result: Record<string, string> = {};
    for (const layer of layers) {
        if (layer == null) {
            continue;
        }
        for (const key of Object.keys(layer)) {
            const value = layer[key];
            if (value === undefined) {
                continue;
            }
            if (value === null) {
                delete result[key];
                continue;
            }
            result[key] = normalizeStyleProperty(value);
        }
    }
    return result;
}

export function resolveCssVariables(
    variables: CssVariables | null | undefined,
): Record<string, string> {
    if (variables == null) {
        return {};
    }
    const result: Record<string, string> = {};
    for (const key of Object.keys(variables)) {
        const value = variables[key];
        if (value == null) {
            continue;
        }
        const name = key.startsWith("--") ? key : `--${key}`;
        result[name] = normalizeStyleProperty(value);
    }
    return result;
}
