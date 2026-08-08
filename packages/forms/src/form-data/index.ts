import { getAt, parsePath, setAt } from "@sometic/validation";

export function valuesToFormData(
    values: Record<string, unknown>,
    formData = new FormData(),
): FormData {
    const walk = (value: unknown, path: string): void => {
        if (value === undefined || value === null) {
            return;
        }
        if (typeof File !== "undefined" && value instanceof File) {
            formData.append(path, value);
            return;
        }
        if (typeof Blob !== "undefined" && value instanceof Blob) {
            formData.append(path, value);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                walk(item, path === "" ? String(index) : `${path}[${index}]`);
            });
            return;
        }
        if (typeof value === "object") {
            for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
                walk(nested, path === "" ? key : `${path}.${key}`);
            }
            return;
        }
        formData.append(path, String(value));
    };
    walk(values, "");
    return formData;
}

export function formDataToValues<T extends Record<string, unknown> = Record<string, unknown>>(
    formData: FormData,
): T {
    let values: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
        const existing = getAt(values, key);
        if (existing === undefined) {
            values = setAt(values, key, value);
            continue;
        }
        if (Array.isArray(existing)) {
            values = setAt(values, key, [...existing, value]);
        } else {
            values = setAt(values, key, [existing, value]);
        }
    }
    return values as T;
}

export function serializeValues(values: Record<string, unknown>): string {
    return JSON.stringify(values);
}

export function parseValues<T extends Record<string, unknown>>(raw: string): T {
    return JSON.parse(raw) as T;
}

export function listPaths(values: unknown, prefix = ""): string[] {
    if (values === null || values === undefined) {
        return prefix ? [prefix] : [];
    }
    if (Array.isArray(values)) {
        return values.flatMap((item, index) =>
            listPaths(item, prefix === "" ? `[${index}]` : `${prefix}[${index}]`),
        );
    }
    if (typeof values === "object") {
        return Object.entries(values as Record<string, unknown>).flatMap(([key, value]) =>
            listPaths(value, prefix === "" ? key : `${prefix}.${key}`),
        );
    }
    return prefix ? [prefix] : [];
}

export function assertPath(path: string): void {
    parsePath(path);
}
