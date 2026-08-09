import type { AuthController } from "@sometic/auth";
import type { HeadController, HeadPatch } from "@sometic/head";
import type { ThemeController } from "@sometic/theme";

export type BindThemeToHeadOptions = {
    patchId?: string;
    themeColorLight?: string;
    themeColorDark?: string;
};

type BindThemeToHeadResult = {
    dispose: () => void;
};

export function bindThemeToHead(
    theme: ThemeController,
    head: HeadController,
    options: BindThemeToHeadOptions = {},
): BindThemeToHeadResult {
    const patchId = options.patchId ?? "theme";

    const sync = (): void => {
        const snapshot = theme.get();
        const scheme = snapshot.resolvedColorScheme;
        const themeColor =
            scheme === "dark"
                ? (options.themeColorDark ?? "#0c1117")
                : (options.themeColorLight ?? "#ffffff");
        const patch: HeadPatch = {
            htmlAttrs: {
                "data-color-scheme": scheme,
                style: `color-scheme:${scheme}`,
            },
            meta: [{ name: "theme-color", content: themeColor }],
        };
        head.set(patchId, patch);
    };

    sync();
    const stop = theme.subscribe(() => {
        sync();
    });
    return {
        dispose: () => {
            stop();
            head.remove(patchId);
        },
    };
}

type SessionStoreLike = {
    get?: () => unknown;
    set?: (state: never) => void;
    dispose?: () => void;
    clearPersisted?: () => Promise<void>;
};

export type BindAuthToStoresOptions = {
    sessionStores?: readonly SessionStoreLike[];
    resetSessionState?: unknown;
    onEpochChange?: (epoch: number) => void;
};

export function bindAuthToStores(
    auth: AuthController,
    options: BindAuthToStoresOptions = {},
): () => void {
    let lastEpoch = auth.getEpoch();
    return auth.subscribe((session) => {
        const epoch = session.epoch ?? 0;
        if (epoch === lastEpoch) {
            return;
        }
        lastEpoch = epoch;
        for (const store of options.sessionStores ?? []) {
            if (typeof store.set === "function" && options.resetSessionState !== undefined) {
                (store.set as (state: unknown) => void)(options.resetSessionState);
            }
            if (typeof store.clearPersisted === "function") {
                void store.clearPersisted();
            }
        }
        options.onEpochChange?.(epoch);
    });
}
