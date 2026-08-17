# `@sometic/theme`

Runtime design-token and theme management for framework-independent JavaScript apps.

`@sometic/theme` provides `createThemeController` and `applyThemeToElement` so you can register themes, resolve light/dark/system modes, density and direction, high-contrast and reduced-motion preferences, and apply CSS variables plus data attributes to a host element. Contrast helpers and semantic token definitions live on dedicated subpaths.

Sometic separates behavior from visuals. Theme exists so portable engines can respect user and system preferences without shipping a locked visual language or depending on Tailwind/Bootstrap at runtime. Controllers are disposable, hydratable with optional persistence via [`@sometic/store`](https://www.npmjs.com/package/@sometic/store), and safe to use from any adapter that can set attributes and CSS custom properties.

Standout features include multi-theme registration, `system` color scheme with preference subscriptions, scoped controllers (`createScopedThemeController`), `defineSemanticTokens` with required paths, contrast audit helpers (`auditThemeContrast`, `assertThemeContrast`), and snapshots that expose tokens, CSS variables, and attributes together. Subpaths cover tokens, css-variables, contrast, system, and presets.

In the ecosystem, theme depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core), [`@sometic/store`](https://www.npmjs.com/package/@sometic/store), and [`@sometic/styling`](https://www.npmjs.com/package/@sometic/styling). Pair it with component packages and docs theming pages. Introduction: [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction).

## Install

```bash
pnpm add @sometic/theme
```

```bash
npm install @sometic/theme
```

```bash
yarn add @sometic/theme
```

## Usage

Create a controller and apply a snapshot to the document element:

```ts
import { applyThemeToElement, createThemeController, defineSemanticTokens } from "@sometic/theme";

const lightTokens = defineSemanticTokens({
    color: {
        bg: "#ffffff",
        fg: "#111111",
        brand: "#0b6bcb",
        danger: "#c62828",
    },
});

const theme = createThemeController({
    themes: [{ id: "light", tokens: lightTokens, colorScheme: "light" }],
    defaultThemeId: "light",
    mode: "system",
    persist: false,
});

const unsubscribe = theme.subscribe((snapshot) => {
    applyThemeToElement(document.documentElement, snapshot);
});

theme.setMode("dark");
```

Audit contrast against WCAG levels:

```ts
import { auditThemeContrast } from "@sometic/theme";

const result = auditThemeContrast({
    color: {
        bg: "#ffffff",
        fg: "#111111",
        brand: "#0b6bcb",
        danger: "#c62828",
    },
});

if (!result.ok) {
    console.warn(result.violations);
}
```

## CDN

Docs: [https://sometic.dev/stores/theme](https://sometic.dev/stores/theme).

### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/theme@1.1.2/dist/cdn/sometic-theme.iife.js"></script>
<script>
    const theme = SometicTheme.createThemeController({ themes: [], defaultThemeId: "light" });
</script>
```

### Module script

```html
<script type="module">
    import { createThemeController } from "https://cdn.jsdelivr.net/npm/@sometic/theme@1.1.2/dist/cdn/sometic-theme.esm.js";

    const theme = createThemeController({ themes: [], defaultThemeId: "light" });
</script>
```

## Peers / when not to use

Runtime dependencies: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core), [`@sometic/store`](https://www.npmjs.com/package/@sometic/store), [`@sometic/styling`](https://www.npmjs.com/package/@sometic/styling). No framework peers. Do not use theme as a CSS-in-JS library or as a replacement for static design-token pipelines when you only need build-time CSS. Prefer class/slot resolvers in [`@sometic/styling`](https://www.npmjs.com/package/@sometic/styling) when you are only merging classes without runtime mode switching.

## Docs

- Introduction: [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction)
- Theme store: [https://sometic.dev/stores/theme](https://sometic.dev/stores/theme)
- Themes: [https://sometic.dev/theming/themes](https://sometic.dev/theming/themes)
- Design tokens: [https://sometic.dev/concepts/design-tokens](https://sometic.dev/concepts/design-tokens)
- Styling guide: [https://sometic.dev/guide/styling](https://sometic.dev/guide/styling)
- Core on npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)
- Theme on npm: [https://www.npmjs.com/package/@sometic/theme](https://www.npmjs.com/package/@sometic/theme)

## License

MIT
