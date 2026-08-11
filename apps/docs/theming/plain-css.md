# Plain CSS

Style against Sometic CSS variables and snapshot attributes without Tailwind, Bootstrap, or another CSS framework. This is the default mental model: theme owns tokens and runtime resolution; you own the stylesheet.

## Overview

After `applyThemeToElement`, a root (or scoped) element carries:

- Inline custom properties such as `--sometic-color-primary`
- Attributes such as `data-theme`, `data-color-scheme`, `data-density`, and `dir`
- Optional `data-high-contrast` / `data-reduced-motion` when those flags resolve true

Your CSS references those hooks. No Sometic CSS file is required (presets are token data, not a stylesheet).

### When to use

- Lightweight apps and design systems with hand-authored CSS
- SSR critical CSS via `serializeCssVariables`
- Documenting the minimal contract other frameworks build on

### When not to use

- You already standardize on Tailwind or Bootstrap → those dedicated pages
- You only need class/slot merging → `@sometic/styling`

## Installation

<InstallCommands packages="@sometic/theme" />


## Usage

### Apply and subscribe

```ts
import { createThemeController, applyThemeToElement } from "@sometic/theme";
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

const root = document.documentElement;
applyThemeToElement(root, theme.get());
theme.subscribe((snapshot) => {
    applyThemeToElement(root, snapshot);
});
```

### Author CSS against variables

```css
:root {
    color-scheme: light dark;
}

body {
    margin: 0;
    background: var(--sometic-color-bg);
    color: var(--sometic-color-fg);
    font-family: system-ui, sans-serif;
}

.button {
    appearance: none;
    border: 0;
    border-radius: var(--sometic-radius-md);
    background: var(--sometic-color-primary);
    color: #ffffff;
    padding: var(--sometic-space-2) var(--sometic-space-3);
}

.button:focus-visible {
    outline: 2px solid var(--sometic-color-primary);
    outline-offset: 2px;
}

.muted {
    color: var(--sometic-color-muted);
}
```

### React to attributes

```css
[data-color-scheme="dark"] .surface {
    box-shadow: none;
}

[data-density="compact"] .button {
    padding: var(--sometic-space-1) var(--sometic-space-2);
}

[data-density="spacious"] .button {
    padding: var(--sometic-space-3) var(--sometic-space-4);
}

[data-reduced-motion="true"] * {
    transition: none !important;
    animation: none !important;
}

[data-high-contrast="true"] .button {
    outline: 2px solid currentColor;
}

[dir="rtl"] .nav {
    flex-direction: row-reverse;
}
```

### SSR / critical CSS without a DOM

```ts
import { tokensToCssVariables, serializeCssVariables } from "@sometic/theme/css-variables";
import { lightTokens } from "@sometic/theme/presets";

const css = serializeCssVariables(tokensToCssVariables(lightTokens), {
    selector: ":root",
});
// inject `css` into an HTML <style> tag on first paint
```

On the client, still run the controller so system mode and user toggles update live.

### Scoped plain CSS

```ts
const host = document.querySelector("#widget");
if (host instanceof HTMLElement) {
    applyThemeToElement(host, theme.get());
}
```

```css
#widget {
    background: var(--sometic-color-bg);
    color: var(--sometic-color-fg);
}

#widget .button {
    background: var(--sometic-color-primary);
}
```

## How it works

| Mechanism                      | Consumer CSS                                   |
| ------------------------------ | ---------------------------------------------- |
| `var(--sometic-…)`             | Colors, space, radius, any category you define |
| `[data-theme="…"]`             | Per-registered-theme tweaks                    |
| `[data-color-scheme="…"]`      | Light/dark flourishes beyond token swaps       |
| `[data-density="…"]`           | Comfortable / compact / spacious               |
| `[dir="rtl"]`                  | Logical layout mirrors                         |
| `[data-high-contrast="true"]`  | Stronger borders / focus                       |
| `[data-reduced-motion="true"]` | Disable motion                                 |

Token → variable naming is documented under [CSS variables](/theming/css-variables). Prefer changing tokens over hard-coding duplicate hex values in CSS.

## API (relevant)

| Export                                           | Role                                |
| ------------------------------------------------ | ----------------------------------- |
| `createThemeController`                          | Runtime prefs + snapshot            |
| `applyThemeToElement`                            | Write variables + attributes        |
| `tokensToCssVariables` / `serializeCssVariables` | Offline CSS text                    |
| `defineTokens`                                   | Build token maps                    |
| Contrast helpers                                 | Validate hex pairs (hex only today) |

### Snapshot attributes reference

| Attribute             | When present                              |
| --------------------- | ----------------------------------------- |
| `data-theme`          | Always (resolved theme id)                |
| `data-color-scheme`   | Always (`light` or `dark`)                |
| `data-density`        | Always                                    |
| `dir`                 | Always (`ltr` or `rtl`)                   |
| `data-high-contrast`  | Only when resolved high contrast is true  |
| `data-reduced-motion` | Only when resolved reduced motion is true |

## Edge cases

| Case                         | Behavior / tip                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| Missing variable             | CSS ignores `var()` fallback unless you provide one: `var(--sometic-color-bg, #fff)`                |
| Theme key removed            | Pass `previousVariables` into `applyThemeToElement` to clear stale inline props                     |
| `color-scheme` CSS property  | Optional; Sometic sets `data-color-scheme` but does not set the CSS `color-scheme` property for you |
| Contrast of `#fff` on images | Helpers are hex-on-hex; they do not sample pixels                                                   |
| Persistence                  | Preferences only; see [Theme store](/stores/theme) · [Store](/stores/store)                         |

## FAQ

### Do I need a CSS-in-JS library?

No. Plain CSS, CSS modules, or Lightning CSS all work.

### Are presets a stylesheet?

No. They are JS token objects. You still apply via the controller or serialize yourself.

### Can I mix plain CSS with Tailwind?

Yes. Many apps use variables globally and utilities locally. Keep one scheme source of truth.

### Hex-only contrast?

Yes for current helpers. Soft limit: parse hex today; wider CSS colors later. Invalid hex fails closed.

### Where is persistence documented?

[Theme store](/stores/theme) and [Store](/stores/store).

## Related

- [Theming overview](/theming/)
- [CSS variables](/theming/css-variables)
- [Runtime switching](/theming/runtime-switching)
- [Tokens](/theming/tokens)
- [Themes](/theming/themes)
- [Tailwind](/theming/tailwind)
- [Bootstrap](/theming/bootstrap)
- [Theme store](/stores/theme)
