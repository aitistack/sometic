# Theming

`@sometic/theme` is the runtime design-token and theme engine for Sometic. It owns token maps, CSS variable generation, system preference detection, WCAG contrast helpers (hex today), light/dark presets, and a framework-neutral theme controller that produces a stable `ThemeSnapshot` you can bind in any UI stack.

::: tip System standout: contrast, scoped brand, color-scheme
Applies CSS `color-scheme` with `data-color-scheme`. Use `auditThemeContrast` / `assertThemeContrast`, `createScopedThemeController`, and `defineSemanticTokens`. Sync document head via [`bindThemeToHead`](/guide/app-shell).
:::

<CopyPrompt surface="theming" />

This section is the consumer guide for theming. Preference persistence lives on the [Theme store](/stores/theme) bridge page; the underlying store primitives are documented under [Store](/stores/store).

## Overview

Sometic theming is **behavior first**, not a shipped visual kit:

- You define tokens (`color`, `space`, `radius`, or your own categories).
- The controller resolves mode, theme id, density, direction, high contrast, and reduced motion into one snapshot.
- You apply that snapshot to `document.documentElement` or any scoped element via `applyThemeToElement`.
- Your CSS (plain, Tailwind, Bootstrap, or anything else) reads CSS variables and `data-*` attributes. Sometic does not bundle Tailwind or Bootstrap.

### When to use

- Runtime light / dark / system switching across Vanilla, React, Vue, or other adapters
- Token → CSS variable pipelines with a stable prefix
- Scoped themes on a subtree (not only `:root`)
- Density, RTL (`dir`), high-contrast, and reduced-motion flags as attributes
- Preference persistence across reloads via `@sometic/store/persistent`

### When not to use

- Class / style / slot resolution only → `@sometic/styling`
- Compile-time Figma → code token CI → use Style Dictionary (or similar) and feed results into `defineTokens`
- A full visual CSS product as the deliverable → optional presets plus your own CSS
- Framework-only providers with no shared engine → keep those at the app boundary; this package stays framework-neutral

## Package map

| Surface          | Import                         | Role                                                            |
| ---------------- | ------------------------------ | --------------------------------------------------------------- |
| Theme controller | `@sometic/theme`               | `createThemeController`, `applyThemeToElement`, snapshot types  |
| Tokens           | `@sometic/theme/tokens`        | `defineTokens`, `mergeTokens`, `resolveToken`                   |
| CSS variables    | `@sometic/theme/css-variables` | `tokensToCssVariables`, `serializeCssVariables`                 |
| Contrast         | `@sometic/theme/contrast`      | Hex parse, luminance, WCAG ratio helpers                        |
| System prefs     | `@sometic/theme/system`        | Color scheme, reduced motion, more contrast (lazy `matchMedia`) |
| Presets          | `@sometic/theme/presets`       | Minimal `lightTheme` / `darkTheme` for demos and tests          |

Presets stay on a subpath so the root controller can stay within its gzip size budget.

## Architecture boundary

| Package            | Owns                                                              | Does not own                   |
| ------------------ | ----------------------------------------------------------------- | ------------------------------ |
| `@sometic/theme`   | Tokens, generation, mode resolution, attributes, contrast helpers | Class merging, framework hooks |
| `@sometic/styling` | Classes, styles, slots, state attrs, `resolveCssVariables`        | Design tokens                  |
| `@sometic/store`   | Preference store, persistence adapters                            | Theme token math               |

Theme depends on styling’s `resolveCssVariables` and on store for subscriptions and optional persistence. Styling never owns tokens.

## Quick start

```ts
import { createThemeController, applyThemeToElement } from "@sometic/theme";
import { lightTheme, darkTheme } from "@sometic/theme/presets";

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
    lightThemeId: lightTheme.id,
    darkThemeId: darkTheme.id,
    mode: "system",
});

applyThemeToElement(document.documentElement, theme.get());

theme.subscribe((snapshot) => {
    applyThemeToElement(document.documentElement, snapshot);
});

theme.setMode("dark");
```

CSS then consumes variables such as `var(--sometic-color-primary)` and attributes such as `[data-color-scheme="dark"]`.

## Snapshot shape

Every `get()` / `subscribe` callback receives a `ThemeSnapshot`:

| Field                 | Type (conceptually)      | Meaning                                                                                  |
| --------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| `preferences`         | `ThemePreferences`       | Raw prefs: mode, themeId, density, direction, highContrast, reducedMotion                |
| `resolvedColorScheme` | `"light" \| "dark"`      | Effective scheme after system resolution                                                 |
| `resolvedThemeId`     | `string`                 | Theme actually used for tokens                                                           |
| `tokens`              | `ThemeTokens`            | Active token map                                                                         |
| `cssVariables`        | `Record<string, string>` | Flat `--prefix-category-key` map                                                         |
| `attributes`          | `Record<string, string>` | `data-theme`, `data-color-scheme`, `data-density`, `dir`, optional contrast/motion flags |

## Docs in this section

| Page                                            | What you will learn                                 |
| ----------------------------------------------- | --------------------------------------------------- |
| [Installation](/theming/installation)           | Install commands, peers, subpath imports            |
| [Tokens](/theming/tokens)                       | `defineTokens`, merge, resolve paths                |
| [Themes](/theming/themes)                       | Register themes, mode vs theme id, presets          |
| [Runtime switching](/theming/runtime-switching) | Controller API, subscribe, dispose, scoped apply    |
| [CSS variables](/theming/css-variables)         | Naming, serialize for SSR, apply cleanup            |
| [Tailwind](/theming/tailwind)                   | Map variables into Tailwind theme extensions        |
| [Bootstrap](/theming/bootstrap)                 | Drive Bootstrap-styled UIs from variables and attrs |
| [Plain CSS](/theming/plain-css)                 | Style with variables and state attributes only      |

## Persistence

Pass `persist: true` with a storage adapter from `@sometic/store/persistent`. Defaults to in-memory storage unless you pass a web adapter, so durable browser prefs are explicit. Await `hydrated` before trusting restored values.

Deep dive: [Theme store](/stores/theme) · [Store](/stores/store)

## Contrast honesty

Contrast helpers parse **hex** colors (`#rgb` / `#rrggbb`) today. `rgb()`, `hsl()`, and OKLCH strings are not supported yet; invalid input fails closed (`meetsWcagContrast` → `false`, `parseHexColor` → `undefined`). Treat wider color spaces as a future extension, not current API.

## Comparison (short)

| Approach                             | Fit                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Hand-written `:root` variables       | Fine for static sites; Sometic adds registration, system mode, persistence, density/RTL, and a snapshot for any binding |
| `next-themes` / React-only providers | Great in Next.js; Sometic stays framework-neutral so Vanilla/Vue/Svelte share one engine                                |
| Style Dictionary                     | Compile-time pipelines; use both: generate at build time, switch at runtime with this package                           |

## Related

- [Installation](/theming/installation)
- [Tokens](/theming/tokens)
- [Themes](/theming/themes)
- [Runtime switching](/theming/runtime-switching)
- [CSS variables](/theming/css-variables)
- [Theme store](/stores/theme)
- [Store](/stores/store)
- [Styling guide](/guide/styling)
