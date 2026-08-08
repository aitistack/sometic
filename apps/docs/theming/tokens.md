# Tokens

Design tokens in Sometic are plain nested maps: categories (`color`, `space`, …) → keys → string or number values. `@sometic/theme/tokens` gives you typed helpers to define, merge, and look up those maps. The theme controller turns the active theme’s tokens into CSS variables.

## Overview

Tokens are data, not CSS frameworks. You own the scale names; Sometic does not force a Material or Bootstrap palette. Presets ship a small `color` / `space` / `radius` set for demos and tests only.

### When to use

- Defining brand and semantic scales for runtime themes
- Merging base + brand + environment layers
- Looking up a single token by `"category.key"` path

### When not to use

- Class name merging → `@sometic/styling`
- Full compile-time token pipelines → Style Dictionary (or similar), then `defineTokens` on the output
- Switching themes at runtime → [Themes](/theming/themes) and [Runtime switching](/theming/runtime-switching)

## Installation

See [Installation](/theming/installation). Import tokens from the subpath:

```ts
import {
    defineTokens,
    mergeTokens,
    resolveToken,
    type ThemeTokens,
    type TokenScale,
    type TokenValue,
} from "@sometic/theme/tokens";
```

## Usage

### Define a token map

```ts
import { defineTokens } from "@sometic/theme/tokens";

const brandTokens = defineTokens({
    color: {
        bg: "#ffffff",
        fg: "#111827",
        primary: "#2563eb",
        danger: "#dc2626",
    },
    space: {
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
    },
    radius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "0.75rem",
    },
});
```

`defineTokens` returns the same object with a preserved generic type. It does not mutate or validate color formats.

### Merge layers

Later layers win per category key. `null` / `undefined` layers are skipped.

```ts
import { defineTokens, mergeTokens } from "@sometic/theme/tokens";

const base = defineTokens({
    color: { bg: "#ffffff", fg: "#111827", primary: "#2563eb" },
});

const darkOverrides = defineTokens({
    color: { bg: "#0b1220", fg: "#f9fafb" },
});

const darkTokens = mergeTokens(base, darkOverrides);
// color.bg → "#0b1220", color.primary still "#2563eb"
```

### Resolve a path

Paths use a single `.` between category and key (`"color.primary"`). Nested paths beyond one level are not supported in this helper.

```ts
import { resolveToken } from "@sometic/theme/tokens";

resolveToken(brandTokens, "color.primary"); // "#2563eb"
resolveToken(brandTokens, "space.2"); // "0.5rem"
resolveToken(brandTokens, "missing.key"); // undefined
resolveToken(brandTokens, ""); // undefined
```

### Feed tokens into a theme definition

```ts
import { defineTokens } from "@sometic/theme/tokens";
import type { ThemeDefinition } from "@sometic/theme";

const tokens = defineTokens({
    color: { bg: "#fff", fg: "#111", primary: "#2563eb" },
});

const brandLight: ThemeDefinition = {
    id: "brand-light",
    colorScheme: "light",
    tokens,
};
```

## How it works

| Concept       | Shape                                  |
| ------------- | -------------------------------------- |
| `TokenValue`  | `string \| number`                     |
| `TokenScale`  | `Readonly<Record<string, TokenValue>>` |
| `ThemeTokens` | `Readonly<Record<string, TokenScale>>` |

Categories are one level deep. Keys may be numeric-looking strings (`"1"`, `"2"`) as with space scales. Numbers are allowed as values (for example raw font weights); CSS variable serialization stringifies them through styling’s normalizers.

Token → CSS variable flattening (default prefix `sometic`):

| Token path      | CSS variable              |
| --------------- | ------------------------- |
| `color.primary` | `--sometic-color-primary` |
| `space.2`       | `--sometic-space-2`       |
| `radius.md`     | `--sometic-radius-md`     |

Non-alphanumeric characters in category/key are replaced with `-` during flattening. See [CSS variables](/theming/css-variables).

## API

### `defineTokens(tokens)`

| Parameter | Type                    | Description |
| --------- | ----------------------- | ----------- |
| `tokens`  | `T extends ThemeTokens` | Token map   |

**Returns:** `T` (identity helper for inference).

### `mergeTokens(...layers)`

| Parameter | Type                                      | Description                  |
| --------- | ----------------------------------------- | ---------------------------- |
| `layers`  | `Array<ThemeTokens \| null \| undefined>` | Layers to merge left → right |

**Returns:** `ThemeTokens` (new object; shallow-per-category merge).

### `resolveToken(tokens, path)`

| Parameter | Type          | Description      |
| --------- | ------------- | ---------------- |
| `tokens`  | `ThemeTokens` | Source map       |
| `path`    | `string`      | `"category.key"` |

**Returns:** `TokenValue \| undefined`.

## Edge cases

| Case                                 | Behavior                                                    |
| ------------------------------------ | ----------------------------------------------------------- |
| Empty path / no `.` / trailing `.`   | `resolveToken` → `undefined`                                |
| Missing category or key              | `undefined` (no throw)                                      |
| `mergeTokens()` with no layers       | Empty object                                                |
| `null` / `undefined` layer           | Skipped                                                     |
| Overlapping keys                     | Last layer wins                                             |
| Invalid hex in a color token         | Still stored; contrast helpers may reject later             |
| Deep nesting (`color.brand.primary`) | Not a supported `resolveToken` path; use flat category keys |

## FAQ

### Are tokens CSS variables already?

No. Tokens are JS data. The controller (or `tokensToCssVariables`) produces the variable map.

### Can I reference another token inside a value?

Not as a built-in alias language. Put the final CSS value (or `var(--…)`) string yourself if you need references.

### Do presets use `defineTokens`?

Yes. Import `lightTokens` / `darkTokens` from `@sometic/theme/presets` or copy the pattern for your brand.

### Where do preferences persist?

Token maps are not persisted. Preferences (mode, theme id, …) can persist via the controller; see [Theme store](/stores/theme) and [Store](/stores/store).

### Why not put tokens in `@sometic/styling`?

Architecture: styling resolves classes and styles; theme owns tokens and generation.

## Related

- [Theming overview](/theming/)
- [Themes](/theming/themes)
- [CSS variables](/theming/css-variables)
- [Installation](/theming/installation)
- [Theme store](/stores/theme)
