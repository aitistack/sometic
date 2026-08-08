# `@sometic/theme`

Framework-neutral theme tokens, CSS variable generation, system preferences, contrast helpers, and a theme controller.

## Install

```bash
pnpm add @sometic/theme
```

## Quick start

```ts
import { createThemeController, applyThemeToElement } from "@sometic/theme";
import { lightTheme, darkTheme } from "@sometic/theme/presets";

const theme = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: "light",
    darkThemeId: "dark",
    mode: "system",
});

applyThemeToElement(document.documentElement, theme.get());
theme.subscribe((snapshot) => {
    applyThemeToElement(document.documentElement, snapshot);
});
```

## License

MIT
