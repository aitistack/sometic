# Theme — API

## `createThemeController(options)`

Options: `themes`, `defaultThemeId`, optional `lightThemeId` / `darkThemeId`, `mode`, `density`, `direction`, `highContrast`, `reducedMotion`, `prefix`, `persist`, `storage`, `storageKey`.

Returns:

- `get()` → `ThemeSnapshot`
- `subscribe(listener)`
- `setMode` / `setTheme` / `setDensity` / `setDirection` / `setHighContrast` / `setReducedMotion`
- `registerTheme` / `unregisterTheme`
- `hydrated` (resolves immediately when not persisting)
- `dispose()`

Snapshot fields: `preferences`, `resolvedColorScheme`, `resolvedThemeId`, `tokens`, `cssVariables`, `attributes` (`data-theme`, `data-color-scheme`, `data-density`, `dir`, optional contrast/motion flags).

## `applyThemeToElement(element, snapshot)`

Writes CSS variables via `style.setProperty` and snapshot attributes onto any element-like object (document root or scoped container).

## Tokens (`./tokens`)

`defineTokens`, `mergeTokens`, `resolveToken(tokens, "color.primary")`.

## CSS variables (`./css-variables`)

`tokensToCssVariables(tokens, { prefix })` → `--prefix-category-key` map.  
`serializeCssVariables(vars, { selector })` → CSS text block.

## Contrast (`./contrast`)

`parseHexColor`, `relativeLuminance`, `contrastRatio`, `meetsWcagContrast`, `pickContrastingColor`.

## System (`./system`)

`getSystemColorScheme`, `getPrefersReducedMotion`, `getPrefersMoreContrast`, plus subscribe helpers. Lazy `matchMedia` — safe when unavailable (SSR).

## Presets (`./presets`)

`lightTheme` / `darkTheme` minimal token sets for demos and tests.
