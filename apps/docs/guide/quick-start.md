# Quick start

Sometic is a **behavior system**, not a styled component kit. Start with the **app spine**, then mount the same UI engine through React, Vue, and Web Components.

## 1. App spine (the differentiator)

```bash
pnpm add @sometic/app-shell @sometic/auth @sometic/http @sometic/query @sometic/auth-local
```

```ts
import { createAuth } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";
import { createSometicApp } from "@sometic/app-shell";

const auth = createAuth({
    provider: createLocalAuthProvider({ baseUrl: "https://api.example.com" }),
});

const app = createSometicApp({
    auth,
    baseUrl: "https://api.example.com",
});

app.whenReauth(() => {
    console.log("session epoch", app.epoch);
});

const me = await app.http.get("/me");
```

`createSometicApp` wraps [`createAppShell`](/guide/app-shell): auth-aware HTTP, query client, and session epoch. Engine-level APIs (`createHttp`, `createQueryClient`) remain available when you need them.

## 2. Same button, three surfaces

### React

```bash
pnpm add @sometic/react @sometic/dom
```

```tsx
import { Button } from "@sometic/react/button";

export function Save() {
    return <Button type="button">Save</Button>;
}
```

### Vue

```bash
pnpm add @sometic/vue @sometic/dom
```

```vue
<script setup lang="ts">
import { Button } from "@sometic/vue/button";
</script>

<template>
    <Button type="button">Save</Button>
</template>
```

### Vanilla / Web Components

```bash
pnpm add @sometic/elements @sometic/dom
```

```ts
import { registerButtonElements } from "@sometic/elements/button";

registerButtonElements();
```

```html
<sometic-button type="button">Save</sometic-button>
```

Or load the **CDN bundle** for shipped elements (see [Installation](/guide/installation#cdn-web-components)).

## 3. Document head / theme (optional)

```bash
pnpm add @sometic/head @sometic/theme
```

```ts
import { createHeadController } from "@sometic/head";
import { createThemeController, applyThemeToElement } from "@sometic/theme";

const head = createHeadController({
    initial: { titleTemplate: "%s | My App" },
});
head.set("home", { title: "Home" });

const theme = createThemeController({ defaultMode: "system" });
applyThemeToElement(document.documentElement, theme.get());
```

React: `@sometic/react/head`. Vue: `@sometic/vue/head`. See [Head / SEO](/utilities/head).

## 4. Read the model

1. [App shell](/guide/app-shell)
2. [Architecture](/concepts/architecture)
3. [Why Sometic](/guide/why-sometic)
4. [Comparison](/guide/comparison)
5. [What’s included](/guide/whats-included)

## Related

- [Installation](/guide/installation)
- [Authentication](/authentication/)
- [HTTP](/utilities/http)
- [Query](/utilities/query)
- [Styling](/guide/styling)
