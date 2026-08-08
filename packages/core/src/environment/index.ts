export type GlobalThisLike = typeof globalThis;

export interface RuntimeCapabilities {
    readonly hasDom: boolean;
    readonly hasWindow: boolean;
    readonly hasDocument: boolean;
    readonly hasCryptoRandomUuid: boolean;
    readonly hasAbortController: boolean;
    readonly hasBroadcastChannel: boolean;
    readonly hasMatchMedia: boolean;
    readonly hasLocalStorage: boolean;
    readonly hasSessionStorage: boolean;
}

export function getGlobalThis(): GlobalThisLike {
    return globalThis;
}

export function isServerEnvironment(): boolean {
    return typeof (globalThis as { window?: unknown }).window === "undefined";
}

export function isBrowserEnvironment(): boolean {
    return !isServerEnvironment();
}

export function canUseDom(): boolean {
    const candidate = globalThis as {
        window?: unknown;
        document?: { createElement?: unknown };
    };

    return (
        typeof candidate.window !== "undefined" &&
        typeof candidate.document !== "undefined" &&
        typeof candidate.document.createElement === "function"
    );
}

export function detectRuntimeCapabilities(): RuntimeCapabilities {
    const candidate = globalThis as {
        window?: unknown;
        document?: { createElement?: unknown };
        crypto?: { randomUUID?: unknown };
        AbortController?: unknown;
        BroadcastChannel?: unknown;
        matchMedia?: unknown;
        localStorage?: { getItem?: unknown };
        sessionStorage?: { getItem?: unknown };
    };

    const hasWindow = typeof candidate.window !== "undefined";
    const hasDocument =
        typeof candidate.document !== "undefined" &&
        typeof candidate.document.createElement === "function";

    return {
        hasDom: hasWindow && hasDocument,
        hasWindow,
        hasDocument,
        hasCryptoRandomUuid: typeof candidate.crypto?.randomUUID === "function",
        hasAbortController: typeof candidate.AbortController === "function",
        hasBroadcastChannel: typeof candidate.BroadcastChannel === "function",
        hasMatchMedia: typeof candidate.matchMedia === "function",
        hasLocalStorage: typeof candidate.localStorage?.getItem === "function",
        hasSessionStorage: typeof candidate.sessionStorage?.getItem === "function",
    };
}
