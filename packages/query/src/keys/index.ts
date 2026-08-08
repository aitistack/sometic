import type { QueryKey } from "../types.js";

const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);

function serialize(value: unknown, seen: WeakSet<object>): string {
    if (value === null) {
        return "null";
    }
    const kind = typeof value;
    if (kind === "string") {
        return JSON.stringify(value);
    }
    if (kind === "number" || kind === "boolean") {
        return String(value);
    }
    if (kind === "undefined") {
        return "undefined";
    }
    if (kind === "bigint") {
        return `bigint:${String(value)}`;
    }
    if (kind === "symbol" || kind === "function") {
        throw new Error("Query keys must be JSON-serializable (no functions or symbols)");
    }
    if (Array.isArray(value)) {
        return `[${value.map((item) => serialize(item, seen)).join(",")}]`;
    }
    if (value instanceof Date) {
        return `date:${value.toISOString()}`;
    }
    if (value instanceof RegExp) {
        return `regexp:${JSON.stringify(value.source)}:${value.flags}`;
    }
    if (value instanceof Map) {
        const entries = [...value.entries()]
            .map(([key, entryValue]) => `[${serialize(key, seen)},${serialize(entryValue, seen)}]`)
            .sort();
        return `map:{${entries.join(",")}}`;
    }
    if (value instanceof Set) {
        const entries = [...value.values()].map((entryValue) => serialize(entryValue, seen)).sort();
        return `set:{${entries.join(",")}}`;
    }
    if (kind === "object") {
        const record = value as Record<string, unknown>;
        if (seen.has(record)) {
            throw new Error("Query keys must not contain circular references");
        }
        seen.add(record);
        const keys = Object.keys(record)
            .filter((key) => !DANGEROUS_KEYS.has(key))
            .sort();
        return `{${keys.map((key) => `${JSON.stringify(key)}:${serialize(record[key], seen)}`).join(",")}}`;
    }
    return String(value);
}

export function hashQueryKey(queryKey: QueryKey): string {
    return serialize(queryKey, new WeakSet());
}

export function partialMatchKey(target: QueryKey, partial: QueryKey): boolean {
    if (partial.length > target.length) {
        return false;
    }
    for (let index = 0; index < partial.length; index += 1) {
        if (hashQueryKey([partial[index]]) !== hashQueryKey([target[index]])) {
            return false;
        }
    }
    return true;
}

export type { QueryKey };
