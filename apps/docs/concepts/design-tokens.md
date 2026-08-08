# Design tokens

**Design tokens** are named design decisions (color, space, radius, typography, motion) expressed as data and usually published as CSS custom properties. In Sometic, `@sometic/theme` owns tokens, CSS variable generation, system preference handling, contrast helpers, and a theme controller.

## Overview

Styling resolvers (`@sometic/styling`) merge class and style maps. They do not own a token graph. Theme sits beside styling:

```text
@sometic/theme          → tokens, CSS variables, theme store / controller
@sometic/styling        → classes, styles, slots, state attributes
Adapters / your CSS       → apply variables and class recipes
```

Import surfaces (prefer subpaths for size):

| Need                 | Import                        |
| -------------------- | ----------------------------- |
| Theme controller     | `@sometic/theme`               |
| Token helpers        | `@sometic/theme/tokens`        |
| CSS variable helpers | `@sometic/theme/css-variables` |
| Contrast helpers     | `@sometic/theme/contrast`      |
| System preference    | `@sometic/theme/system`        |
| Optional presets     | `@sometic/theme/presets`       |

Presets stay on a subpath so the root entry respects size budgets. See [Tree shaking](/concepts/tree-shaking).

## Runtime theme controller

Create an explicit controller (no import-time browser access):

```ts
import { createThemeController } from "@sometic/theme";

const theme = createThemeController({
    mode: "system", // or "light" | "dark" | custom scheme id
    persist: true,
    // storage adapter supplied in browser code
});

theme.subscribe((snapshot) => {
    // apply dataset / class on documentElement in an effect
});
```

**SSR:** construct and subscribe in client entry or effects. Do not touch `localStorage` or `matchMedia` at module top level.

**Defaults:** CSS variable prefix and storage keys default to `sometic` (see [Beta maturity](/releases/beta) for identity notes).

## CSS variables

Tokens typically publish as custom properties on a scope (document root or a subtree):

```css
:root {
    --sometic-color-bg: #ffffff;
    --sometic-color-fg: #0a0a0a;
    --sometic-radius-md: 0.5rem;
}

[data-theme="dark"] {
    --sometic-color-bg: #0a0a0a;
    --sometic-color-fg: #f5f5f5;
}
```

Components and your CSS consume variables without knowing which theme file wrote them:

```css
[data-slot="root"] {
    background: var(--sometic-color-bg);
    color: var(--sometic-color-fg);
    border-radius: var(--sometic-radius-md);
}
```

You can also pass instance overrides through `cssVariables` on styleable components. See [Styling slots](/concepts/styling-slots).

## Contrast helpers

Theme exposes contrast helpers so accessible pairs can be checked when you author or switch tokens. Use them when generating themes or validating brand palettes; do not treat them as a substitute for real contrast QA on composed UI.

## Modes of consumption

| Mode                 | How tokens reach the page                                      |
| -------------------- | -------------------------------------------------------------- |
| Plain CSS            | Hand-authored variables; optional controller for mode class    |
| Runtime switching    | Controller updates mode; CSS responds to `data-theme` / class  |
| Tailwind / Bootstrap | Map utilities to CSS variables; frameworks stay consumer-owned |

Guides: [Tokens](/theming/tokens), [CSS variables](/theming/css-variables), [Runtime switching](/theming/runtime-switching), [Plain CSS](/theming/plain-css), [Tailwind](/theming/tailwind), [Bootstrap](/theming/bootstrap).

## Theme store relationship

Theme preferences often persist through store-backed persistence (same philosophy as `@sometic/store/persistent`): explicit adapters, disposable controllers, SSR-safe construction. See [Theme store](/stores/theme) and [Theming](/theming/).

## When to use / when not

**Use** when you need shared light/dark (or multi-brand) tokens across React, Vue, and elements, with optional persistence and system preference.

**Do not use** when a single static stylesheet is enough and you never switch themes. You can still use styling slots and state attributes without `@sometic/theme`.

## FAQ

**Is a default visual theme required?** No. Components work unstyled. Tokens are optional.

**Can I rename the CSS prefix?** Beta defaults to `sometic`. Treat legacy names as unsupported; see release notes on [Beta maturity](/releases/beta).

**Where do I put brand colors?** In your token set or presets, then publish as CSS variables. Keep secrets and environment-specific URLs out of token packages.

**Does theme replace component `classes`?** No. Tokens supply values; slots still map structure to your recipes.

## Related links

- [Theming](/theming/)
- [Theme store](/stores/theme)
- [Styling slots](/concepts/styling-slots)
- [State attributes](/concepts/state-attributes)
- [Architecture](/concepts/architecture)
- [Tree shaking](/concepts/tree-shaking)
