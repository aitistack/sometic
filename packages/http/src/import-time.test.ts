// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";

describe("http import-time", () => {
    const restore: Array<() => void> = [];

    afterEach(() => {
        while (restore.length > 0) {
            restore.pop()?.();
        }
    });

    it("does not read window or localStorage while loading", async () => {
        const accesses: string[] = [];
        const define = (key: "window" | "localStorage"): void => {
            const previous = Object.getOwnPropertyDescriptor(globalThis, key);
            Object.defineProperty(globalThis, key, {
                configurable: true,
                get() {
                    accesses.push(key);
                    return undefined;
                },
            });
            restore.push(() => {
                if (previous) {
                    Object.defineProperty(globalThis, key, previous);
                } else {
                    Reflect.deleteProperty(globalThis, key);
                }
            });
        };
        define("window");
        define("localStorage");
        await import("./index.js");
        expect(accesses).toEqual([]);
    }, 20_000);
});
