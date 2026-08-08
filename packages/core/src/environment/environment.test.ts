import { describe, expect, it } from "vitest";
import {
    canUseDom,
    detectRuntimeCapabilities,
    getGlobalThis,
    isBrowserEnvironment,
    isServerEnvironment,
} from "./index.js";

describe("environment", () => {
    it("returns the same globalThis reference", () => {
        expect(getGlobalThis()).toBe(globalThis);
    });

    it("detects the vitest node environment as server", () => {
        expect(isServerEnvironment()).toBe(true);
        expect(isBrowserEnvironment()).toBe(false);
        expect(canUseDom()).toBe(false);
    });

    it("reports runtime capabilities without import-time browser access", () => {
        const capabilities = detectRuntimeCapabilities();
        expect(capabilities.hasAbortController).toBe(true);
        expect(capabilities.hasDom).toBe(false);
    });

    it("treats a window-shaped global as browser without requiring import-time access", () => {
        const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
        const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

        Object.defineProperty(globalThis, "window", {
            configurable: true,
            value: globalThis,
        });
        Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {
                createElement: () => ({}),
            },
        });

        try {
            expect(isServerEnvironment()).toBe(false);
            expect(isBrowserEnvironment()).toBe(true);
            expect(canUseDom()).toBe(true);
            expect(detectRuntimeCapabilities().hasDom).toBe(true);
        } finally {
            if (originalWindow) {
                Object.defineProperty(globalThis, "window", originalWindow);
            } else {
                Reflect.deleteProperty(globalThis, "window");
            }

            if (originalDocument) {
                Object.defineProperty(globalThis, "document", originalDocument);
            } else {
                Reflect.deleteProperty(globalThis, "document");
            }
        }
    });

    it("returns false from canUseDom when document.createElement is missing", () => {
        const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
        const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");

        Object.defineProperty(globalThis, "window", {
            configurable: true,
            value: globalThis,
        });
        Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {},
        });

        try {
            expect(canUseDom()).toBe(false);
        } finally {
            if (originalWindow) {
                Object.defineProperty(globalThis, "window", originalWindow);
            } else {
                Reflect.deleteProperty(globalThis, "window");
            }

            if (originalDocument) {
                Object.defineProperty(globalThis, "document", originalDocument);
            } else {
                Reflect.deleteProperty(globalThis, "document");
            }
        }
    });
});
