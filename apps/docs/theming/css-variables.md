# CSS variables

Theme tokens become a flat map of CSS custom properties. `@sometic/theme/css-variables` exposes the same helpers the controller uses: `tokensToCssVariables` and `serializeCssVariables`. `applyThemeToElement` writes those properties onto an element with `style.setProperty`.

## Overview

Default naming is `--{prefix}-{category}-{key}` with prefix `sometic`. Values pass through `@sometic/styling`’s `resolveCssVariables`, which ensures names start with `--` and normalizes property values to strings.

### When to use

- Understanding what the controller writes to the DOM
- Generating a static CSS block for SSR or critical CSS
- Custom prefixes for multi-tenant or embedded widgets
- Cleaning up removed variables when snapshots change

### When not to use

- Class / slot resolution → `@sometic/styling`
- Defining token scales → [Tokens](/theming/tokens)
- Framework theme providers without Sometic tokens → out of scope

## Installation

See [Installation](/theming/installation).

```ts
import {
    tokensToCssVariables,
    serializeCssVariables,
    type TokensToCssVariablesOptions,
} from "@sometic/theme/css-variables";
```

## Usage

### Flatten tokens

```ts
import { defineTokens } from "@sometic/theme/tokens";
import { tokensToCssVariables } from "@sometic/theme/css-variables";

const tokens = defineTokens({
    color: { primary: "#2563eb", bg: "#ffffff" },
    space: { 2: "0.5rem" },
});

const vars = tokensToCssVariables(tokens);
// {
//   "--sometic-color-primary": "#2563eb",
//   "--sometic-color-bg": "#ffffff",
//   "--sometic-space-2": "0.5rem",
// }

const branded = tokensToCssVariables(tokens, { prefix: "acme" });
// "--acme-color-primary", …
```

### Serialize for a stylesheet

```ts
import { serializeCssVariables } from "@sometic/theme/css-variables";

const cssText = serializeCssVariables(vars, { selector: ":root" });
/*
:root {
  --sometic-color-bg: #ffffff;
  --sometic-color-primary: #2563eb;
  --sometic-space-2: 0.5rem;
}
*/
```

Empty maps serialize to `:root {}` (or your selector).

### Apply via the controller

```ts
import { createThemeController, applyThemeToElement } from "@sometic/theme";
import { lightTheme, darkTheme } from "@sometic/theme/presets";

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: lightTheme.id,
    lightThemeId: lightTheme.id,
    darkThemeId: darkTheme.id,
    prefix: "sometic",
});

const root = document.documentElement;
let previous = theme.get().cssVariables;

applyThemeToElement(root, theme.get());

theme.subscribe((snapshot) => {
    applyThemeToElement(root, snapshot, { previousVariables: previous });
    previous = snapshot.cssVariables;
});
```

Passing `previousVariables` removes properties that no longer exist in the new snapshot (important when themes differ in token keys).

### Consume in CSS

```css
.button {
    background: var(--sometic-color-primary);
    color: var(--sometic-color-fg);
    border-radius: var(--sometic-radius-md);
    padding: var(--sometic-space-2) var(--sometic-space-3);
}

[data-color-scheme="dark"] .panel {
    background: var(--sometic-color-bg);
}
```

## How it works

1. Walk each category and key in `ThemeTokens`.
2. Build a flat key: `{prefix}-{category}-{key}` (or `{category}-{key}` if prefix is `""`), sanitizing non `[a-zA-Z0-9_-]` to `-`.
3. Call `resolveCssVariables` so each name becomes `--…` and values are strings.
4. Controller stores the result on `ThemeSnapshot.cssVariables`.
5. `applyThemeToElement` sets each property; optional previous map drives removals.
6. Attributes (`data-theme`, `data-color-scheme`, …) are set alongside variables.

| Token           | Prefix              | Result name               |
| --------------- | ------------------- | ------------------------- |
| `color.primary` | `sometic` (default) | `--sometic-color-primary` |
| `color.primary` | `acme`              | `--acme-color-primary`    |
| `color.primary` | `""`                | `--color-primary`         |

## API

### `tokensToCssVariables(tokens, options?)`

| Parameter        | Type          | Description         |
| ---------------- | ------------- | ------------------- |
| `tokens`         | `ThemeTokens` | Source tokens       |
| `options.prefix` | `string`      | Default `"sometic"` |

**Returns:** `Record<string, string>` (keys include leading `--`).

### `serializeCssVariables(variables, options?)`

| Parameter          | Type                               | Description       |
| ------------------ | ---------------------------------- | ----------------- |
| `variables`        | `Readonly<Record<string, string>>` | Variable map      |
| `options.selector` | `string`                           | Default `":root"` |

**Returns:** CSS text block with sorted property names.

### `applyThemeToElement(element, snapshot, options?)` (root package)

| Parameter                   | Type                                | Description          |
| --------------------------- | ----------------------------------- | -------------------- |
| `element`                   | Element-like (`style` + attributes) | Target root or scope |
| `snapshot`                  | `ThemeSnapshot`                     | Active snapshot      |
| `options.previousVariables` | `Readonly<Record<string, string>>`  | Optional cleanup map |

Removes `data-high-contrast` / `data-reduced-motion` when those flags are inactive.

## Edge cases

| Case                           | Behavior                                                                 |
| ------------------------------ | ------------------------------------------------------------------------ |
| Missing category scale         | Skipped                                                                  |
| `undefined` token value        | Skipped                                                                  |
| Empty token map                | `{}`; serialize → `selector {}`                                          |
| Theme A has keys theme B lacks | Without `previousVariables`, stale inline props can linger               |
| Scoped element                 | Variables inherit to descendants; attributes stay on that element        |
| SSR                            | Serialize to CSS string; do not call `applyThemeToElement` without a DOM |

## FAQ

### Does Sometic inject a global stylesheet?

No. Runtime apply uses inline custom properties on the target element, or you inject `serializeCssVariables` output yourself.

### Can I use these variables from Tailwind or Bootstrap?

Yes. Map them in config or utilities. See [Tailwind](/theming/tailwind) and [Bootstrap](/theming/bootstrap). Sometic does not bundle those frameworks.

### Who owns `resolveCssVariables`?

`@sometic/styling`. Theme depends on it; styling does not own tokens.

### Do persisted preferences include CSS variables?

No. Persistence stores preference fields only. Variables are derived. See [Theme store](/stores/theme) and [Store](/stores/store).

## Related

- [Theming overview](/theming/)
- [Tokens](/theming/tokens)
- [Themes](/theming/themes)
- [Runtime switching](/theming/runtime-switching)
- [Plain CSS](/theming/plain-css)
- [Theme store](/stores/theme)
