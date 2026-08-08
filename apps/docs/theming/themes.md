# Themes

A **theme** is a named `ThemeDefinition`: an `id`, a token map, and an optional `colorScheme` (`"light"` or `"dark"`). The controller registers one or more themes and resolves which one is active from mode, system preference, and the current theme id.

## Overview

Themes are registration units. Mode (`light` / `dark` / `system`) decides which scheme and which of `lightThemeId` / `darkThemeId` to prefer. `setTheme` selects a concrete id and may exit `system` mode when you pin a theme while mode was `system`.

### When to use

- Shipping light and dark (or multi-brand) token sets
- Mapping OS preference to specific theme ids
- Registering themes at runtime (feature flags, white-label)

### When not to use

- Editing a single token without a theme boundary → [Tokens](/theming/tokens)
- DOM apply / subscribe patterns → [Runtime switching](/theming/runtime-switching)
- Persistence wiring → [Theme store](/stores/theme)

## Installation

See [Installation](/theming/installation). Presets:

```ts
import { lightTheme, darkTheme, lightTokens, darkTokens } from "@sometic/theme/presets";
```

## Usage

### Register themes with the controller

```ts
import { createThemeController } from "@sometic/theme";
import { lightTheme, darkTheme } from "@sometic/theme/presets";

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
    lightThemeId: lightTheme.id,
    darkThemeId: darkTheme.id,
    mode: "system",
    density: "comfortable",
    direction: "ltr",
});
```

### Custom theme definition

```ts
import { defineTokens } from "@sometic/theme/tokens";
import type { ThemeDefinition } from "@sometic/theme";

const oceanTokens = defineTokens({
    color: {
        bg: "#0b1f2a",
        fg: "#e8f4f8",
        primary: "#38bdf8",
        danger: "#f87171",
    },
    space: { 1: "0.25rem", 2: "0.5rem", 3: "0.75rem", 4: "1rem" },
    radius: { sm: "0.25rem", md: "0.5rem", lg: "0.75rem" },
});

const oceanDark: ThemeDefinition = {
    id: "ocean-dark",
    colorScheme: "dark",
    tokens: oceanTokens,
};
```

### Switch mode and theme id

```ts
theme.setMode("dark"); // mode dark + themeId → darkThemeId
theme.setMode("light"); // mode light + themeId → lightThemeId
theme.setMode("system"); // follow prefers-color-scheme

theme.setTheme("ocean-dark"); // pins that id; if mode was system, mode becomes colorScheme of that theme (or "light")
```

### Register / unregister at runtime

```ts
theme.registerTheme(oceanDark);

theme.unregisterTheme("ocean-dark");
```

You cannot unregister the last remaining theme. Unregistering the active `themeId` falls back to another registered id.

## How it works

### Resolution order (simplified)

1. Read preferences (`mode`, `themeId`, density, direction, flags).
2. Resolve `resolvedColorScheme`:
    - `mode === "system"` → OS dark ? `"dark"` : `"light"` (no-preference treated as light for scheme)
    - else → `"dark"` or `"light"` from mode
3. Pick preferred theme id:
    - `system` → `darkThemeId` or `lightThemeId`
    - else → `preferences.themeId`
4. Fallbacks if missing: `themeId` → `lightThemeId` → first registered theme.
5. Build CSS variables from that theme’s tokens; build attributes.

### `setMode("dark")` and `themeId`

Setting mode to `"dark"` or `"light"` also moves `themeId` to `darkThemeId` / `lightThemeId` so resolved tokens match the scheme. Setting `"system"` updates mode only and lets light/dark ids drive resolution from the OS.

### Snapshot attributes

| Attribute             | Source                                       |
| --------------------- | -------------------------------------------- |
| `data-theme`          | `resolvedThemeId`                            |
| `data-color-scheme`   | `resolvedColorScheme`                        |
| `data-density`        | preferences.density                          |
| `dir`                 | preferences.direction                        |
| `data-high-contrast`  | present when resolved high contrast is true  |
| `data-reduced-motion` | present when resolved reduced motion is true |

## API

### `ThemeDefinition`

| Field         | Type                | Required | Description                            |
| ------------- | ------------------- | -------- | -------------------------------------- |
| `id`          | `string`            | yes      | Stable theme id                        |
| `tokens`      | `ThemeTokens`       | yes      | Token map                              |
| `colorScheme` | `"light" \| "dark"` | no       | Used when `setTheme` exits system mode |

### `CreateThemeControllerOptions` (theme-related)

| Option                   | Type                         | Default          | Description                                      |
| ------------------------ | ---------------------------- | ---------------- | ------------------------------------------------ |
| `themes`                 | `readonly ThemeDefinition[]` | (required)       | Initial registry; must be non-empty              |
| `defaultThemeId`         | `string`                     | (required)       | Must exist in `themes`                           |
| `lightThemeId`           | `string`                     | `defaultThemeId` | Preferred id for light / system-light            |
| `darkThemeId`            | `string`                     | `defaultThemeId` | Preferred id for dark / system-dark              |
| `mode`                   | `ThemeMode`                  | `"system"`       | Initial mode                                     |
| `density`                | `ThemeDensity`               | `"comfortable"`  | Comfortable / compact / spacious / custom string |
| `direction`              | `ThemeDirection`             | `"ltr"`          | `ltr` or `rtl`                                   |
| `highContrast`           | `SystemAwareFlag`            | `false`          | `true` \| `false` \| `"system"`                  |
| `reducedMotion`          | `SystemAwareFlag`            | `"system"`       | `true` \| `false` \| `"system"`                  |
| `prefix`                 | `string`                     | `"sometic"`       | CSS variable prefix                              |
| `persist`                | `boolean`                    | `false`          | Prefer [Theme store](/stores/theme)              |
| `storage` / `storageKey` | adapter / string             | see store docs   | Persistence                                      |

### Controller theme methods

| Method                                                                 | Description                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| `registerTheme(theme)`                                                 | Add or replace by id; rebuilds snapshot        |
| `unregisterTheme(id)`                                                  | Remove; throws if last theme; no-op if unknown |
| `setMode(mode)`                                                        | Update mode (and themeId for light/dark)       |
| `setTheme(themeId)`                                                    | Select id; throws if unknown                   |
| `setDensity` / `setDirection` / `setHighContrast` / `setReducedMotion` | Preference setters                             |

### Presets (`@sometic/theme/presets`)

| Export                       | Description                   |
| ---------------------------- | ----------------------------- |
| `lightTokens` / `darkTokens` | Minimal token maps            |
| `lightTheme` / `darkTheme`   | `{ id, colorScheme, tokens }` |

## Edge cases

| Case                         | Behavior                                                |
| ---------------------------- | ------------------------------------------------------- |
| Empty `themes` array         | Throws at create                                        |
| Unknown `defaultThemeId`     | Throws at create                                        |
| Unknown `setTheme(id)`       | Throws                                                  |
| Unregister last theme        | Throws                                                  |
| Unregister active theme      | Switches `themeId` to another registered id             |
| `mode: "system"` + OS change | Snapshot rebuilds when scheme subscription fires        |
| Missing preferred id         | Falls back through themeId → lightThemeId → first theme |

## FAQ

### What does `setMode("dark")` do to `themeId`?

It sets mode to `dark` and moves `themeId` to `darkThemeId` so tokens match.

### Why aren’t presets on the root entry?

Size budget: keep `@sometic/theme` lean; import presets when needed.

### Can I have more than two themes?

Yes. Register as many as you need. `lightThemeId` / `darkThemeId` only matter for light/dark/system resolution shortcuts.

### Do themes persist automatically?

Only preference fields persist when `persist: true`. Token maps live in memory (or your module graph). See [Theme store](/stores/theme) and [Store](/stores/store).

### Is `colorScheme` on the definition required?

No. It matters when `setTheme` is called while mode is `system`: mode becomes `theme.colorScheme ?? "light"`.

## Related

- [Theming overview](/theming/)
- [Tokens](/theming/tokens)
- [Runtime switching](/theming/runtime-switching)
- [CSS variables](/theming/css-variables)
- [Theme store](/stores/theme)
- [Store](/stores/store)
