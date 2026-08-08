import { describe, expect, it, vi } from "vitest";
import {
    getPrefersMoreContrast,
    getPrefersReducedMotion,
    getSystemColorScheme,
    subscribeSystemColorScheme,
} from "./index.js";

describe("system preferences", () => {
    it("returns no-preference without matchMedia", () => {
        const original = globalThis.matchMedia;
        // @ts-expect-error test override
        delete globalThis.matchMedia;
        expect(getSystemColorScheme()).toBe("no-preference");
        expect(getPrefersReducedMotion()).toBe(false);
        expect(getPrefersMoreContrast()).toBe(false);
        globalThis.matchMedia = original;
    });

    it("reads and subscribes to matchMedia when available", () => {
        const listeners = new Set<() => void>();
        const media = {
            matches: true,
            addEventListener: (_type: string, listener: () => void) => {
                listeners.add(listener);
            },
            removeEventListener: (_type: string, listener: () => void) => {
                listeners.delete(listener);
            },
        };
        const matchMedia = vi.fn((query: string) => {
            if (query.includes("dark")) {
                return media;
            }
            return {
                matches: false,
                addEventListener: () => undefined,
                removeEventListener: () => undefined,
            };
        });
        vi.stubGlobal("matchMedia", matchMedia);

        expect(getSystemColorScheme()).toBe("dark");
        const seen: string[] = [];
        const stop = subscribeSystemColorScheme((scheme) => {
            seen.push(scheme);
        });
        for (const listener of listeners) {
            listener();
        }
        expect(seen.length).toBeGreaterThan(0);
        stop();
        vi.unstubAllGlobals();
    });
});
