import { detectRuntimeCapabilities } from "@sometic/core/environment";

export type ColorSchemePreference = "light" | "dark" | "no-preference";

export type SystemPreferenceQuery = "color-scheme" | "reduced-motion" | "more-contrast";

export type SystemUnsubscribe = () => void;

type MatchMediaLike = {
    matches: boolean;
    addEventListener?: (type: "change", listener: () => void) => void;
    removeEventListener?: (type: "change", listener: () => void) => void;
    addListener?: (listener: () => void) => void;
    removeListener?: (listener: () => void) => void;
};

function getMatchMedia(): ((query: string) => MatchMediaLike) | undefined {
    if (!detectRuntimeCapabilities().hasMatchMedia) {
        return undefined;
    }
    const candidate = globalThis as { matchMedia?: (query: string) => MatchMediaLike };
    return typeof candidate.matchMedia === "function"
        ? candidate.matchMedia.bind(candidate)
        : undefined;
}

function queryMedia(query: string): MatchMediaLike | undefined {
    const matchMedia = getMatchMedia();
    if (!matchMedia) {
        return undefined;
    }
    try {
        return matchMedia(query);
    } catch {
        return undefined;
    }
}

export function getSystemColorScheme(): ColorSchemePreference {
    const dark = queryMedia("(prefers-color-scheme: dark)");
    if (dark?.matches) {
        return "dark";
    }
    const light = queryMedia("(prefers-color-scheme: light)");
    if (light?.matches) {
        return "light";
    }
    return "no-preference";
}

export function getPrefersReducedMotion(): boolean {
    return queryMedia("(prefers-reduced-motion: reduce)")?.matches === true;
}

export function getPrefersMoreContrast(): boolean {
    return queryMedia("(prefers-contrast: more)")?.matches === true;
}

function subscribeMedia(query: string, listener: () => void): SystemUnsubscribe {
    const media = queryMedia(query);
    if (!media) {
        return () => undefined;
    }
    if (typeof media.addEventListener === "function") {
        media.addEventListener("change", listener);
        return () => {
            media.removeEventListener?.("change", listener);
        };
    }
    if (typeof media.addListener === "function") {
        media.addListener(listener);
        return () => {
            media.removeListener?.(listener);
        };
    }
    return () => undefined;
}

export function subscribeSystemColorScheme(
    listener: (scheme: ColorSchemePreference) => void,
): SystemUnsubscribe {
    const notify = (): void => {
        listener(getSystemColorScheme());
    };
    const stopDark = subscribeMedia("(prefers-color-scheme: dark)", notify);
    const stopLight = subscribeMedia("(prefers-color-scheme: light)", notify);
    return () => {
        stopDark();
        stopLight();
    };
}

export function subscribePrefersReducedMotion(
    listener: (value: boolean) => void,
): SystemUnsubscribe {
    return subscribeMedia("(prefers-reduced-motion: reduce)", () => {
        listener(getPrefersReducedMotion());
    });
}

export function subscribePrefersMoreContrast(
    listener: (value: boolean) => void,
): SystemUnsubscribe {
    return subscribeMedia("(prefers-contrast: more)", () => {
        listener(getPrefersMoreContrast());
    });
}
