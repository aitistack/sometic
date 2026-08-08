# Installation

Install `@sometic/theme` to get the theme controller, tokens, CSS variable helpers, contrast utilities, system preference helpers, and optional light/dark presets.

## Overview

Theme is a workspace package with declared dependencies on `@sometic/core`, `@sometic/store`, and `@sometic/styling`. Your package manager should install those transitively when you add theme. Install store explicitly when you call persistence APIs yourself (for example `createWebStorageAdapter`).

### When to use this page

- First-time install for an app or library
- Choosing which subpath imports to use
- Confirming Node / ESM expectations

### When not to use

- Designing token scales → [Tokens](/theming/tokens)
- Wiring `persist` / `storage` → [Theme store](/stores/theme)

## Install

::: code-group

```bash [npm]
npm install @sometic/theme
```

```bash [pnpm]
pnpm add @sometic/theme
```

```bash [yarn]
yarn add @sometic/theme
```

```bash [bun]
bun add @sometic/theme
```

:::

### With persistence helpers

If your app constructs storage adapters directly:

::: code-group

```bash [npm]
npm install @sometic/theme @sometic/store
```

```bash [pnpm]
pnpm add @sometic/theme @sometic/store
```

```bash [yarn]
yarn add @sometic/theme @sometic/store
```

```bash [bun]
bun add @sometic/theme @sometic/store
```

:::

## Usage

### Root entry (controller)

```ts
import {
    createThemeController,
    applyThemeToElement,
    type ThemeController,
    type ThemeSnapshot,
} from "@sometic/theme";
```

### Subpath imports

```ts
import { defineTokens, mergeTokens, resolveToken } from "@sometic/theme/tokens";
import { tokensToCssVariables, serializeCssVariables } from "@sometic/theme/css-variables";
import {
    parseHexColor,
    contrastRatio,
    meetsWcagContrast,
    pickContrastingColor,
} from "@sometic/theme/contrast";
import { getSystemColorScheme, subscribeSystemColorScheme } from "@sometic/theme/system";
import { lightTheme, darkTheme } from "@sometic/theme/presets";
```

Import only what you need. Presets are optional so the root bundle stays lean.

### Minimal bootstrap

```ts
import { createThemeController, applyThemeToElement } from "@sometic/theme";
import { lightTheme, darkTheme } from "@sometic/theme/presets";

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
    lightThemeId: lightTheme.id,
    darkThemeId: darkTheme.id,
});

applyThemeToElement(document.documentElement, theme.get());
```

## How it works

| Concern         | Detail                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| Module format   | ESM (`"type": "module"`), tree-shakeable, `sideEffects: false`         |
| Types           | Bundled `.d.ts` via package exports                                    |
| Peers           | Framework packages are **not** peers; theme is framework-neutral       |
| Runtime deps    | `@sometic/core`, `@sometic/store`, `@sometic/styling`                  |
| Node            | `>=20.18.0` (package engines)                                          |
| Browser globals | Never accessed at import time; `matchMedia` is lazy via system helpers |

Published exports (from `package.json`):

| Export            | Path                              |
| ----------------- | --------------------------------- |
| `.`               | Controller + apply helper + types |
| `./tokens`        | Token define / merge / resolve    |
| `./css-variables` | Flatten + serialize               |
| `./contrast`      | Hex / WCAG helpers                |
| `./system`        | Preference getters + subscribers  |
| `./presets`       | `lightTheme` / `darkTheme`        |
| `./package.json`  | Package metadata                  |

## Edge cases

| Case                      | Behavior                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| SSR / no `window`         | Safe to import; system helpers return light / `no-preference` / false without `matchMedia` |
| Missing transitive deps   | Install fails or types break; reinstall workspace deps                                     |
| Deep imports into `dist/` | Unsupported; use public exports only                                                       |
| Presets on root entry     | Not re-exported; import `@sometic/theme/presets`                                           |

## FAQ

### Does theme require React or Vue?

No. Bind with `subscribe` + `applyThemeToElement` in any environment.

### Do I need to install styling and store separately?

Theme lists them as dependencies. Install store yourself when you import `@sometic/store/persistent` adapters in app code.

### Why are presets a separate subpath?

To protect the root controller size budget (about 3 KB gzip for the theme root entry).

### Can I use this in CommonJS?

The package is ESM. Use an ESM-capable bundler or Node ESM.

### Where do I document persistence?

[Theme store](/stores/theme) covers `persist`, `storage`, `storageKey`, and hydrate. [Store](/stores/store) covers the store primitives.

## Related

- [Theming overview](/theming/)
- [Tokens](/theming/tokens)
- [Themes](/theming/themes)
- [Runtime switching](/theming/runtime-switching)
- [Theme store](/stores/theme)
- [Store](/stores/store)
