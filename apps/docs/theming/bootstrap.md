# Bootstrap

Sometic does **not** bundle Bootstrap. Theme supplies CSS variables and state attributes; Bootstrap (or Bootstrap utility classes via your styling slots) remains an optional consumer choice.

## Overview

Two complementary approaches:

1. **CSS variables bridge** - override Bootstrap's CSS variable surface (or your Sass build) with Sometic token values at runtime.
2. **Attribute-driven CSS** - keep Bootstrap markup/components, and add small CSS that keys off `data-color-scheme`, `data-theme`, `data-density`, and `dir`.

`@sometic/styling` can resolve class strings for slots; it still does not depend on Bootstrap at runtime.

### When to use

- Existing Bootstrap apps adopting Sometic runtime themes
- Gradual migration: Bootstrap layout + Sometic tokens

### When not to use

- Greenfield utility-first stacks → [Tailwind](/theming/tailwind) or [Plain CSS](/theming/plain-css)
- Expecting Sometic to ship Bootstrap Sass partials or a theme pack (it does not)

## Installation

<InstallCommands packages="@sometic/theme" />

Install Bootstrap yourself (`bootstrap` package, CDN, or Sass pipeline). Sometic never lists Bootstrap as a dependency.

## Usage

### Controller bootstrap (same for any CSS framework)

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
```

### Bridge Sometic variables into Bootstrap’s variable names

Bootstrap 5 reads many `--bs-*` custom properties. You can assign them from Sometic variables in your CSS:

```css
:root,
[data-theme] {
    --bs-body-bg: var(--sometic-color-bg);
    --bs-body-color: var(--sometic-color-fg);
    --bs-primary: var(--sometic-color-primary);
    --bs-danger: var(--sometic-color-danger);
    --bs-border-radius: var(--sometic-radius-md);
}
```

When the controller updates `--sometic-*` on the root, Bootstrap-aware components that consume `--bs-*` follow.

### Attribute hooks for density and scheme

```css
[data-density="compact"] .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

[data-color-scheme="dark"] .card {
    --bs-card-bg: var(--sometic-color-bg);
    --bs-card-color: var(--sometic-color-fg);
}

[dir="rtl"] .input-group {
    /* direction already set on the theme root via applyThemeToElement */
}
```

### Optional: styling slots with Bootstrap class strings

```ts
import { resolveClasses } from "@sometic/styling/classes";

const buttonClass = resolveClasses({
    defaults: "btn btn-primary",
    user: "px-3",
});
```

This is ordinary class merging. Theme tokens still come from `@sometic/theme`, not from styling.

## How it works

| Layer           | Role                                             |
| --------------- | ------------------------------------------------ |
| Sometic theme   | Snapshot → `--sometic-*` + `data-*` / `dir`      |
| Your bridge CSS | Map to `--bs-*` or component overrides           |
| Bootstrap       | Components and utilities as you already use them |

Sometic’s architecture rejects baking Bootstrap into the core. Hybrid mode (package logic + source-owned visuals) is intentional: you own the Bootstrap glue.

## API (relevant)

No Bootstrap-specific exports.

| Need            | Use                                            |
| --------------- | ---------------------------------------------- |
| Runtime theme   | `createThemeController`, `applyThemeToElement` |
| Token maps      | `@sometic/theme/tokens`                        |
| Static CSS dump | `serializeCssVariables`                        |
| Class strings   | `@sometic/styling` (optional)                  |

## Edge cases

| Case                         | Guidance                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Bootstrap dark mode helpers  | Prefer Sometic `data-color-scheme` as source of truth to avoid double toggles                     |
| Sass `$primary` compile-time | Runtime variables cannot change compiled Sass color math; use CSS variables for runtime switching |
| CDN Bootstrap + scoped theme | Apply snapshot on a wrapper; bridge CSS must target that scope                                    |
| Contrast auditing            | Hex helpers only; Bootstrap may expose non-hex computed styles                                    |

## FAQ

### Will Sometic ever require Bootstrap?

No. Optional consumer styling only.

### Can I use Bootstrap Icons or JS components?

Yes, independently. Theme does not manage Bootstrap’s JavaScript plugins.

### How do I persist the user’s Bootstrap-facing theme?

Persist Sometic preferences: [Theme store](/stores/theme) · [Store](/stores/store). Bootstrap sees the resulting variables/attributes.

### Tailwind vs Bootstrap with Sometic?

Same engine. Choose the CSS system your app already uses; both pages describe mapping only.

## Related

- [Theming overview](/theming/)
- [CSS variables](/theming/css-variables)
- [Plain CSS](/theming/plain-css)
- [Tailwind](/theming/tailwind)
- [Runtime switching](/theming/runtime-switching)
- [Theme store](/stores/theme)
