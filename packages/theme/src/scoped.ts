import type { Disposable } from "@sometic/core/disposable";
import { createStore } from "@sometic/store";
import { tokensToCssVariables } from "./css-variables/index.js";
import {
    applyThemeToElement,
    type ThemeController,
    type ThemeDefinition,
    type ThemeSnapshot,
} from "./create-theme-controller.js";
import { mergeTokens, type ThemeTokens } from "./tokens/index.js";

export type CreateScopedThemeControllerOptions = {
    parent: ThemeController;
    tokens?: ThemeTokens;
    themes?: readonly ThemeDefinition[];
    themeId?: string;
    prefix?: string;
};

export type ScopedThemeController = Disposable & {
    get(): ThemeSnapshot;
    subscribe(listener: (snapshot: ThemeSnapshot, previous: ThemeSnapshot) => void): () => void;
    applyTo(
        element: {
            style: {
                setProperty(name: string, value: string): void;
                removeProperty(name: string): void;
            };
            setAttribute(name: string, value: string): void;
            removeAttribute(name: string): void;
        },
    ): void;
    readonly hydrated: Promise<void>;
};

function resolveScopedSnapshot(
    parent: ThemeSnapshot,
    options: {
        tokens?: ThemeTokens;
        themes?: readonly ThemeDefinition[];
        themeId?: string;
        prefix: string;
    },
): ThemeSnapshot {
    const scopedTheme =
        options.themeId !== undefined
            ? options.themes?.find((theme) => theme.id === options.themeId)
            : undefined;

    const baseTokens = scopedTheme?.tokens ?? parent.tokens;
    const tokens = options.tokens ? mergeTokens(baseTokens, options.tokens) : baseTokens;
    const resolvedThemeId = scopedTheme?.id ?? parent.resolvedThemeId;
    const cssVariables = tokensToCssVariables(tokens, { prefix: options.prefix });
    const attributes = {
        ...parent.attributes,
        "data-theme": resolvedThemeId,
    };

    return {
        preferences: parent.preferences,
        resolvedColorScheme: parent.resolvedColorScheme,
        resolvedThemeId,
        tokens,
        cssVariables,
        attributes,
    };
}

function buildResolveOptions(
    options: CreateScopedThemeControllerOptions,
    prefix: string,
): {
    tokens?: ThemeTokens;
    themes?: readonly ThemeDefinition[];
    themeId?: string;
    prefix: string;
} {
    const next: {
        tokens?: ThemeTokens;
        themes?: readonly ThemeDefinition[];
        themeId?: string;
        prefix: string;
    } = { prefix };
    if (options.tokens !== undefined) {
        next.tokens = options.tokens;
    }
    if (options.themes !== undefined) {
        next.themes = options.themes;
    }
    if (options.themeId !== undefined) {
        next.themeId = options.themeId;
    }
    return next;
}

export function createScopedThemeController(
    options: CreateScopedThemeControllerOptions,
): ScopedThemeController {
    const prefix = options.prefix ?? "sometic";
    const resolveOptions = buildResolveOptions(options, prefix);
    const snapshotStore = createStore(
        resolveScopedSnapshot(options.parent.get(), resolveOptions),
    );

    let previousVariables: Record<string, string> | undefined = snapshotStore.get().cssVariables;
    let disposed = false;

    const stopParent = options.parent.subscribe((parentSnapshot) => {
        snapshotStore.set(resolveScopedSnapshot(parentSnapshot, resolveOptions));
    });

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
        applyTo(element) {
            const snapshot = snapshotStore.get();
            if (previousVariables !== undefined) {
                applyThemeToElement(element, snapshot, { previousVariables });
            } else {
                applyThemeToElement(element, snapshot);
            }
            previousVariables = snapshot.cssVariables;
        },
        hydrated: options.parent.hydrated,
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            stopParent();
            snapshotStore.dispose();
        },
    };
}
