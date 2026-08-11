# Theme store

Theme **preferences** (mode, theme id, density, direction, contrast, motion) can persist through `@sometic/store/persistent`. This page documents that bridge. For tokens, CSS variables, system prefs, and applying snapshots to the DOM, use the full [Theming](/theming/) section.

## Overview

`createThemeController` from `@sometic/theme` always keeps preferences in an `@sometic/store` instance:

- **Without** `persist: true`: an in-memory `createStore` holds preferences. `hydrated` resolves immediately.
- **With** `persist: true`: a `createPersistentStore` holds preferences. Default storage is `createMemoryStorage()` unless you pass a web (or custom) adapter. Await `hydrated` before trusting restored values.

A second internal store derives the public `ThemeSnapshot` (tokens, CSS variables, attributes) whenever preferences or system signals change.

### When to use this page

- Wiring `persist`, `storage`, and `storageKey` correctly
- Understanding why theme prefs survive reloads
- Debugging hydrate races or memory-only defaults

### When not to use

- Designing token scales or CSS variable prefixes → [Tokens](/theming/tokens) and [CSS variables](/theming/css-variables)
- Framework-only theme providers without Sometic engines → keep those at the app boundary; this controller stays framework-neutral

## Installation

Theme depends on store already. Install the theme package (and store if you call persistence APIs yourself):

<InstallCommands packages="@sometic/theme @sometic/store" />


## How persistence is wired

From `@sometic/theme`'s controller (simplified):

```ts
import { createStore } from "@sometic/store";
import { createPersistentStore, createMemoryStorage } from "@sometic/store/persistent";

const shouldPersist = options.persist === true;

const persistentStore = shouldPersist
    ? createPersistentStore(initialPreferences, {
          key: options.storageKey ?? "sometic-theme",
          storage: options.storage ?? createMemoryStorage(),
          version: 1,
      })
    : undefined;

const preferenceStore = persistentStore ?? createStore(initialPreferences);
const hydrated = persistentStore?.hydrated ?? Promise.resolve();
```

Important defaults:

| Option       | Default when persisting                      |
| ------------ | -------------------------------------------- |
| `storageKey` | `"sometic-theme"`                            |
| `storage`    | `createMemoryStorage()` (not `localStorage`) |
| `version`    | `1` (fixed by the controller today)          |

If you set `persist: true` but omit `storage`, preferences persist only for the lifetime of that memory adapter instance (useful in tests). For durable browser prefs, pass `createWebStorageAdapter("localStorage")` (or `sessionStorage`).

## Usage

### Persist theme preferences to `localStorage`

::: code-group

```ts [TS]
import { createThemeController, applyThemeToElement } from "@sometic/theme";
import { lightTheme, darkTheme } from "@sometic/theme/presets";
import { createWebStorageAdapter } from "@sometic/store/persistent";

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
    lightThemeId: lightTheme.id,
    darkThemeId: darkTheme.id,
    mode: "system",
    persist: true,
    storageKey: "sometic-theme",
    storage: createWebStorageAdapter("localStorage"),
});

await theme.hydrated;

applyThemeToElement(document.documentElement, theme.get());

theme.subscribe((snapshot) => {
    applyThemeToElement(document.documentElement, snapshot);
});

theme.setMode("dark");
```

```js [JS]
import { createThemeController, applyThemeToElement } from "@sometic/theme";
import { lightTheme, darkTheme } from "@sometic/theme/presets";
import { createWebStorageAdapter } from "@sometic/store/persistent";

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
    lightThemeId: lightTheme.id,
    darkThemeId: darkTheme.id,
    mode: "system",
    persist: true,
    storageKey: "sometic-theme",
    storage: createWebStorageAdapter("localStorage"),
});

await theme.hydrated;

applyThemeToElement(document.documentElement, theme.get());

theme.subscribe((snapshot) => {
    applyThemeToElement(document.documentElement, snapshot);
});

theme.setMode("dark");
```

:::

### Without persistence

Omit `persist` (or set `false`). Preferences reset on reload; `hydrated` is already resolved.

```ts
const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
});

await theme.hydrated; // resolves immediately
```

### Custom storage adapter

Any `StorageAdapter` from `@sometic/store/persistent` works (`getItem` / `setItem` / `removeItem`, sync or async):

```ts
import type { StorageAdapter } from "@sometic/store/persistent";

const cookieLike: StorageAdapter = {
    name: "cookie-bridge",
    getItem(key) {
        return readCookie(key);
    },
    setItem(key, value) {
        writeCookie(key, value);
    },
    removeItem(key) {
        clearCookie(key);
    },
};

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
    persist: true,
    storage: cookieLike,
    storageKey: "theme-prefs",
});
```

## What gets persisted

Only **preferences**, not the full snapshot:

- `mode`, `themeId`, `density`, `direction`
- `highContrast`, `reducedMotion` flags (including `"system"`)

Resolved color scheme, token maps, and CSS variable objects are recomputed after hydrate from registered themes and current system signals.

## Edge cases

| Case                                     | Behavior                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `persist: true` + default memory storage | Survives within the process, not across reloads in a new JS realm                            |
| Apply DOM before `hydrated`              | May flash default prefs; await hydrate first for durable storage                             |
| Storage quota / private mode             | Handled by persistent store error path; controller keeps running with last good memory state |
| SSR                                      | No import-time `window`; pass memory storage or hydrate only on the client                   |
| Changing `storageKey`                    | Old key is orphaned; migrate manually if needed                                              |
| Controller `dispose`                     | Disposes preference and snapshot stores; stop applying after dispose                         |

Deep API for modes, tokens, contrast, and scoped roots: [Theming](/theming/), [Runtime switching](/theming/runtime-switching), [Installation](/theming/installation).

## How it works (store side)

1. Preferences land in `createStore` or `createPersistentStore`.
2. Preference changes rebuild a snapshot store (custom equality over a stable snapshot key).
3. System `matchMedia` subscriptions rebuild when mode or flags are `"system"`.
4. You call `get` / `subscribe` on the controller and typically `applyThemeToElement`.

Persistence mechanics (envelopes, migrations, `onPersistError`) are documented on [Store](/stores/store#persistent-store). The theme controller currently ships `version: 1` without custom migrations; treat preference shape as stable or clear storage if you fork the controller.

## FAQ

### Does theme require React?

No. Controllers are framework-agnostic. Bind with `subscribe` + `applyThemeToElement`, or wrap with adapter hooks later.

### Why is my theme not surviving reload?

Confirm `persist: true` **and** a durable `storage` adapter. Memory storage is the default when `storage` is omitted.

### Should I call `createPersistentStore` myself for theme?

Usually no. Prefer `createThemeController({ persist: true, storage, storageKey })`. Use the persistent store directly for non-theme app prefs.

### Is `hydrated` required when not persisting?

It resolves immediately, so awaiting is harmless and keeps one code path.

### Can I use Immer for theme prefs?

Not through the controller. Preferences use the plain store / persistent store. See [Immer adapter](/stores/store-immer) for app state elsewhere.

### Where are CSS variables documented?

[CSS variables](/theming/css-variables) and [Tokens](/theming/tokens).

### Does this sync theme across tabs?

Not automatically. Preference writes go to storage; another tab does not get a live store subscription unless you add [cross-tab](/stores/store#cross-tab-store) yourself or listen to `storage` events and recreate/apply. Out of the box, a reload in another tab picks up persisted prefs via hydrate.

### Bundle impact?

Theme controller stays on the theme package budget; persistence code comes from `@sometic/store/persistent` when you enable persist.

## Related

- [Theming hub](/theming/)
- [Runtime switching](/theming/runtime-switching)
- [Store persistence](/stores/store#persistent-store)
- [Stores hub](/stores/)
- [API packages](/api/packages)
