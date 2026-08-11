# Tailwind

Sometic does **not** bundle Tailwind CSS. Theme writes CSS variables and state attributes; you map those into Tailwind’s theme extension (or use arbitrary values) so utilities stay on your design tokens.

## Overview

Recommended pattern:

1. Run `createThemeController` and `applyThemeToElement` on a root (or scope).
2. Point Tailwind colors / spacing / radius at `var(--sometic-…)`.
3. Optionally style with attribute variants for `[data-color-scheme=dark]`, density, and motion.

### When to use

- Apps already on Tailwind that want runtime Sometic themes
- Keeping utility classes while centralizing token values in `@sometic/theme`

### When not to use

- You do not use Tailwind → [Plain CSS](/theming/plain-css) or [Bootstrap](/theming/bootstrap)
- You only need class merging without tokens → `@sometic/styling`
- Expecting Sometic to ship a Tailwind plugin or preset (it does not)

## Installation

Install theme (and Tailwind in your app as usual):

<InstallCommands packages="@sometic/theme" />


Tailwind remains your dependency (`tailwindcss`, PostCSS, etc.). Sometic never takes a runtime dependency on it.

## Usage

### Apply Sometic variables first

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

### Map variables in Tailwind config (v3-style)

```ts
import type { Config } from "tailwindcss";

export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue,svelte}"],
    theme: {
        extend: {
            colors: {
                canvas: "var(--sometic-color-bg)",
                ink: "var(--sometic-color-fg)",
                muted: "var(--sometic-color-muted)",
                primary: "var(--sometic-color-primary)",
                danger: "var(--sometic-color-danger)",
            },
            spacing: {
                "im-1": "var(--sometic-space-1)",
                "im-2": "var(--sometic-space-2)",
                "im-3": "var(--sometic-space-3)",
                "im-4": "var(--sometic-space-4)",
            },
            borderRadius: {
                "im-sm": "var(--sometic-radius-sm)",
                "im-md": "var(--sometic-radius-md)",
                "im-lg": "var(--sometic-radius-lg)",
            },
        },
    },
    plugins: [],
} satisfies Config;
```

### Use utilities in markup

```html
<button class="bg-primary text-ink rounded-im-md px-im-3 py-im-2">Save</button>

<section class="bg-canvas text-ink data-[color-scheme=dark]:bg-canvas">…</section>
```

Attribute names come from the snapshot (`data-color-scheme`, `data-density`, `data-theme`). Exact Tailwind variant syntax depends on your Tailwind major version; the important part is reading Sometic attributes and variables, not a special Sometic plugin.

### Arbitrary values (no config map)

```html
<div class="bg-[var(--sometic-color-bg)] text-[var(--sometic-color-fg)]">Scoped panel</div>
```

Useful for one-offs or when you prefer not to extend `theme`.

### Custom prefix

If you pass `prefix: "acme"` to the controller, map `var(--acme-color-primary)` instead. Keep Tailwind config and theme `prefix` in sync.

## How it works

| Layer                | Responsibility                              |
| -------------------- | ------------------------------------------- |
| `@sometic/theme`     | Resolve tokens → CSS variables + attributes |
| Your Tailwind config | Alias utilities to those variables          |
| Your components      | Use utilities / arbitrary values            |

Dark mode strategy: prefer Sometic’s `data-color-scheme` (or `data-theme`) over Tailwind’s `dark:` class if the controller owns scheme resolution. Mixing `darkMode: "class"` with a separate `dark` class can drift from `mode: "system"` unless you sync them manually.

## API (relevant)

No Tailwind-specific exports. Use the standard theme API:

| Export                  | Package                        |
| ----------------------- | ------------------------------ |
| `createThemeController` | `@sometic/theme`               |
| `applyThemeToElement`   | `@sometic/theme`               |
| `tokensToCssVariables`  | `@sometic/theme/css-variables` |
| Preset themes           | `@sometic/theme/presets`       |

Variable naming: see [CSS variables](/theming/css-variables).

## Edge cases

| Case                             | Guidance                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| FOUC before apply                | Await `hydrated` when persisting; consider inline critical CSS from `serializeCssVariables` |
| Stale utilities after rename     | Update Tailwind maps when you change token keys or prefix                                   |
| Scoped theme root                | Apply to a container; ensure Tailwind content paths still see class names                   |
| Contrast checks for Tailwind hex | Contrast helpers are hex-only; validate token hex strings, not `rgb(var(…))` composites     |

## FAQ

### Does Sometic include a Tailwind preset package?

No. Mapping is intentional app-level glue so you are not locked to one Tailwind major.

### Can I keep `darkMode: 'media'`?

You can, but then Tailwind and Sometic may disagree. Prefer one source of truth: Sometic mode + attributes.

### Where do preferences persist?

[Theme store](/stores/theme) · [Store](/stores/store)

### Is styling’s class resolver required?

No for this Tailwind pattern. Use it when components expose `classes` / slots.

## Related

- [Theming overview](/theming/)
- [CSS variables](/theming/css-variables)
- [Runtime switching](/theming/runtime-switching)
- [Plain CSS](/theming/plain-css)
- [Bootstrap](/theming/bootstrap)
- [Theme store](/stores/theme)
