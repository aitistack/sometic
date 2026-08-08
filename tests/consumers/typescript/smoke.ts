import {
    canUseDom,
    createAsyncOperation,
    createControllableState,
    createDisposable,
    createId,
    getGlobalThis,
    isBrowserEnvironment,
    isServerEnvironment,
    ok,
} from "@sometic/core";
import type { GlobalThisLike } from "@sometic/core";
import { createEventEmitter } from "@sometic/events";
import { createStore, select } from "@sometic/store";
import { resolveClasses, resolveStyleable } from "@sometic/styling";
import { createThemeController } from "@sometic/theme";
import { lightTheme } from "@sometic/theme/presets";
import { createFocusTrap, matchesKey } from "@sometic/accessibility";
import { resolveButton } from "@sometic/dom/button";

const globalRef: GlobalThisLike = getGlobalThis();

export function assertEnvironmentTypes(): boolean {
    const store = createStore({ count: 0 });
    const count = select(store, (state) => state.count);
    const theme = createThemeController({
        themes: [lightTheme],
        defaultThemeId: "light",
        mode: "light",
    });
    const themeOk = theme.get().resolvedThemeId === "light";
    theme.dispose();
    return (
        globalRef === globalThis &&
        typeof isServerEnvironment() === "boolean" &&
        typeof isBrowserEnvironment() === "boolean" &&
        typeof canUseDom() === "boolean" &&
        typeof createId() === "string" &&
        ok(1).ok &&
        createControllableState({ defaultValue: 0 }).get() === 0 &&
        typeof createAsyncOperation(async () => 1).execute === "function" &&
        !createDisposable(() => undefined).disposed &&
        createEventEmitter<{ ping: number }>().listenerCount("ping") === 0 &&
        count.get() === 0 &&
        resolveClasses("a", { b: true }) === "a b" &&
        resolveStyleable({ defaults: { className: "btn" }, user: { className: "x" } }).className ===
            "btn x" &&
        themeOk &&
        typeof createFocusTrap === "function" &&
        typeof matchesKey === "function" &&
        resolveButton({ loading: true }).attributes["aria-busy"] === "true"
    );
}
