import type { Disposable } from "@sometic/core/disposable";
import { createStore } from "@sometic/store";
import type { StorageAdapter } from "@sometic/store/persistent";
import { createPersistentStore, createMemoryStorage } from "@sometic/store/persistent";
import { tokensToCssVariables } from "./css-variables/index.js";
import {
    getPrefersMoreContrast,
    getPrefersReducedMotion,
    getSystemColorScheme,
    subscribePrefersMoreContrast,
    subscribePrefersReducedMotion,
    subscribeSystemColorScheme,
} from "./system/index.js";
import type { ThemeTokens } from "./tokens/index.js";

export type ThemeMode = "light" | "dark" | "system";

export type ThemeDensity = "comfortable" | "compact" | "spacious" | (string & {});

export type ThemeDirection = "ltr" | "rtl";

export type SystemAwareFlag = boolean | "system";

export type ThemeDefinition = {
    readonly id: string;
    readonly tokens: ThemeTokens;
    readonly colorScheme?: "light" | "dark";
};

export type ThemePreferences = {
    readonly mode: ThemeMode;
    readonly themeId: string;
    readonly density: ThemeDensity;
    readonly direction: ThemeDirection;
    readonly highContrast: SystemAwareFlag;
    readonly reducedMotion: SystemAwareFlag;
};

export type ThemeSnapshot = {
    readonly preferences: ThemePreferences;
    readonly resolvedColorScheme: "light" | "dark";
    readonly resolvedThemeId: string;
    readonly tokens: ThemeTokens;
    readonly cssVariables: Record<string, string>;
    readonly attributes: Record<string, string>;
};

export type CreateThemeControllerOptions = {
    themes: readonly ThemeDefinition[];
    defaultThemeId: string;
    lightThemeId?: string;
    darkThemeId?: string;
    mode?: ThemeMode;
    density?: ThemeDensity;
    direction?: ThemeDirection;
    highContrast?: SystemAwareFlag;
    reducedMotion?: SystemAwareFlag;
    prefix?: string;
    storage?: StorageAdapter;
    storageKey?: string;
    persist?: boolean;
};

export type ThemeController = Disposable & {
    get(): ThemeSnapshot;
    subscribe(listener: (snapshot: ThemeSnapshot, previous: ThemeSnapshot) => void): () => void;
    registerTheme(theme: ThemeDefinition): void;
    unregisterTheme(id: string): void;
    setMode(mode: ThemeMode): void;
    setTheme(themeId: string): void;
    setDensity(density: ThemeDensity): void;
    setDirection(direction: ThemeDirection): void;
    setHighContrast(value: SystemAwareFlag): void;
    setReducedMotion(value: SystemAwareFlag): void;
    readonly hydrated: Promise<void>;
};

type PersistedPreferences = ThemePreferences;

function resolveBooleanFlag(flag: SystemAwareFlag, systemValue: boolean): boolean {
    return flag === "system" ? systemValue : flag;
}

function snapshotKey(snapshot: ThemeSnapshot): string {
    return [
        snapshot.resolvedThemeId,
        snapshot.resolvedColorScheme,
        snapshot.preferences.mode,
        snapshot.preferences.themeId,
        snapshot.preferences.density,
        snapshot.preferences.direction,
        String(snapshot.preferences.highContrast),
        String(snapshot.preferences.reducedMotion),
        JSON.stringify(snapshot.cssVariables),
        JSON.stringify(snapshot.attributes),
    ].join("|");
}

function buildAttributes(
    preferences: ThemePreferences,
    resolvedThemeId: string,
    resolvedColorScheme: "light" | "dark",
    highContrast: boolean,
    reducedMotion: boolean,
): Record<string, string> {
    const attrs: Record<string, string> = {
        "data-theme": resolvedThemeId,
        "data-color-scheme": resolvedColorScheme,
        "data-density": preferences.density,
        dir: preferences.direction,
    };
    if (highContrast) {
        attrs["data-high-contrast"] = "true";
    }
    if (reducedMotion) {
        attrs["data-reduced-motion"] = "true";
    }
    return attrs;
}

function createSnapshot(
    themes: Map<string, ThemeDefinition>,
    preferences: ThemePreferences,
    options: {
        lightThemeId: string;
        darkThemeId: string;
        prefix: string;
        systemScheme: "light" | "dark";
        systemHighContrast: boolean;
        systemReducedMotion: boolean;
    },
): ThemeSnapshot {
    const resolvedColorScheme =
        preferences.mode === "system"
            ? options.systemScheme
            : preferences.mode === "dark"
              ? "dark"
              : "light";

    const preferredId =
        preferences.mode === "system"
            ? resolvedColorScheme === "dark"
                ? options.darkThemeId
                : options.lightThemeId
            : preferences.themeId;

    const theme =
        themes.get(preferredId) ??
        themes.get(preferences.themeId) ??
        themes.get(options.lightThemeId) ??
        themes.values().next().value;

    if (theme == null) {
        throw new Error("No themes registered");
    }

    const highContrast = resolveBooleanFlag(preferences.highContrast, options.systemHighContrast);
    const reducedMotion = resolveBooleanFlag(
        preferences.reducedMotion,
        options.systemReducedMotion,
    );

    const cssVariables = tokensToCssVariables(theme.tokens, { prefix: options.prefix });
    const attributes = buildAttributes(
        preferences,
        theme.id,
        resolvedColorScheme,
        highContrast,
        reducedMotion,
    );

    return {
        preferences,
        resolvedColorScheme,
        resolvedThemeId: theme.id,
        tokens: theme.tokens,
        cssVariables,
        attributes,
    };
}

export function applyThemeToElement(
    element: {
        style: {
            setProperty(name: string, value: string): void;
            removeProperty(name: string): void;
        };
        setAttribute(name: string, value: string): void;
        removeAttribute(name: string): void;
    },
    snapshot: ThemeSnapshot,
    options: { previousVariables?: Readonly<Record<string, string>> } = {},
): void {
    const previous = options.previousVariables;
    if (previous) {
        for (const name of Object.keys(previous)) {
            if (!(name in snapshot.cssVariables)) {
                element.style.removeProperty(name);
            }
        }
    }
    for (const name of Object.keys(snapshot.cssVariables)) {
        element.style.setProperty(name, snapshot.cssVariables[name]!);
    }
    element.style.setProperty("color-scheme", snapshot.resolvedColorScheme);
    for (const name of Object.keys(snapshot.attributes)) {
        element.setAttribute(name, snapshot.attributes[name]!);
    }
    if (!snapshot.attributes["data-high-contrast"]) {
        element.removeAttribute("data-high-contrast");
    }
    if (!snapshot.attributes["data-reduced-motion"]) {
        element.removeAttribute("data-reduced-motion");
    }
}

export function createThemeController(options: CreateThemeControllerOptions): ThemeController {
    if (options.themes.length === 0) {
        throw new Error("createThemeController requires at least one theme");
    }

    const themes = new Map<string, ThemeDefinition>();
    for (const theme of options.themes) {
        themes.set(theme.id, theme);
    }

    if (!themes.has(options.defaultThemeId)) {
        throw new Error(`Unknown defaultThemeId "${options.defaultThemeId}"`);
    }

    const lightThemeId = options.lightThemeId ?? options.defaultThemeId;
    const darkThemeId = options.darkThemeId ?? options.defaultThemeId;
    const prefix = options.prefix ?? "sometic";

    const initialPreferences: ThemePreferences = {
        mode: options.mode ?? "system",
        themeId: options.defaultThemeId,
        density: options.density ?? "comfortable",
        direction: options.direction ?? "ltr",
        highContrast: options.highContrast ?? false,
        reducedMotion: options.reducedMotion ?? "system",
    };

    let systemScheme: "light" | "dark" = getSystemColorScheme() === "dark" ? "dark" : "light";
    let systemHighContrast = getPrefersMoreContrast();
    let systemReducedMotion = getPrefersReducedMotion();

    const build = (preferences: ThemePreferences): ThemeSnapshot =>
        createSnapshot(themes, preferences, {
            lightThemeId,
            darkThemeId,
            prefix,
            systemScheme,
            systemHighContrast,
            systemReducedMotion,
        });

    const shouldPersist = options.persist === true;
    const persistentStore = shouldPersist
        ? createPersistentStore<PersistedPreferences>(initialPreferences, {
              key: options.storageKey ?? "sometic-theme",
              storage: options.storage ?? createMemoryStorage(),
              version: 1,
          })
        : undefined;
    const preferenceStore =
        persistentStore ?? createStore<PersistedPreferences>(initialPreferences);
    const hydrated = persistentStore?.hydrated ?? Promise.resolve();

    const snapshotStore = createStore(build(preferenceStore.get()), {
        equalityFn: (left, right) => snapshotKey(left) === snapshotKey(right),
    });

    const rebuild = (): void => {
        snapshotStore.set(build(preferenceStore.get()));
    };

    const stopPrefs = preferenceStore.subscribe(() => {
        rebuild();
    });

    const stopScheme = subscribeSystemColorScheme((scheme) => {
        systemScheme = scheme === "dark" ? "dark" : "light";
        if (preferenceStore.get().mode === "system") {
            rebuild();
        }
    });

    const stopContrast = subscribePrefersMoreContrast((value) => {
        systemHighContrast = value;
        if (preferenceStore.get().highContrast === "system") {
            rebuild();
        }
    });

    const stopMotion = subscribePrefersReducedMotion((value) => {
        systemReducedMotion = value;
        if (preferenceStore.get().reducedMotion === "system") {
            rebuild();
        }
    });

    let disposed = false;

    const updatePreferences = (patch: Partial<ThemePreferences>): void => {
        preferenceStore.update((current) => ({
            mode: patch.mode ?? current.mode,
            themeId: patch.themeId ?? current.themeId,
            density: patch.density ?? current.density,
            direction: patch.direction ?? current.direction,
            highContrast: patch.highContrast ?? current.highContrast,
            reducedMotion: patch.reducedMotion ?? current.reducedMotion,
        }));
    };

    return {
        get disposed() {
            return disposed;
        },
        get() {
            return snapshotStore.get();
        },
        subscribe(listener) {
            return snapshotStore.subscribe(listener);
        },
        registerTheme(theme) {
            themes.set(theme.id, theme);
            rebuild();
        },
        unregisterTheme(id) {
            if (themes.size <= 1) {
                throw new Error("Cannot unregister the last theme");
            }
            if (!themes.has(id)) {
                return;
            }
            themes.delete(id);
            const current = preferenceStore.get();
            if (current.themeId === id) {
                const fallback = themes.keys().next().value!;
                updatePreferences({ themeId: fallback });
                return;
            }
            rebuild();
        },
        setMode(mode) {
            if (mode === "dark") {
                updatePreferences({ mode, themeId: darkThemeId });
                return;
            }
            if (mode === "light") {
                updatePreferences({ mode, themeId: lightThemeId });
                return;
            }
            updatePreferences({ mode });
        },
        setTheme(themeId) {
            const theme = themes.get(themeId);
            if (theme == null) {
                throw new Error(`Unknown theme id "${themeId}"`);
            }
            const current = preferenceStore.get();
            if (current.mode === "system") {
                updatePreferences({
                    themeId,
                    mode: theme.colorScheme ?? "light",
                });
                return;
            }
            updatePreferences({ themeId });
        },
        setDensity(density) {
            updatePreferences({ density });
        },
        setDirection(direction) {
            updatePreferences({ direction });
        },
        setHighContrast(value) {
            updatePreferences({ highContrast: value });
        },
        setReducedMotion(value) {
            updatePreferences({ reducedMotion: value });
        },
        hydrated,
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            stopPrefs();
            stopScheme();
            stopContrast();
            stopMotion();
            preferenceStore.dispose();
            snapshotStore.dispose();
        },
    };
}
