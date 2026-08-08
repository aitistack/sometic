import { getGlobalThis } from "../environment/index.js";

let fallbackCounter = 0;

function createRandomSegment(): string {
    const cryptoApi = (getGlobalThis() as { crypto?: { randomUUID?: () => string } }).crypto;
    if (typeof cryptoApi?.randomUUID === "function") {
        return cryptoApi.randomUUID().replace(/-/g, "");
    }

    fallbackCounter += 1;
    const time = Date.now().toString(36);
    const counter = fallbackCounter.toString(36);
    const noise = Math.random().toString(36).slice(2, 10);
    return `${time}${counter}${noise}`;
}

export function createId(): string {
    return createRandomSegment();
}

export function createPrefixedId(prefix: string): string {
    if (prefix.length === 0) {
        throw new Error("createPrefixedId requires a non-empty prefix");
    }

    return `${prefix}_${createRandomSegment()}`;
}
