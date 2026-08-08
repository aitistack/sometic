# Quick start

Sometic is a **behavior system**, not a styled component kit. Start by wiring an adapter, then attach app services (auth / HTTP / head). UI engines are included. They are not the product story.

## 1. Pick an adapter

### React

```bash
pnpm add @sometic/react @sometic/dom
```

```tsx
import { Button } from "@sometic/react/button";
import { Tabs, TabTrigger, TabPanel } from "@sometic/react/structure";

export function Save() {
    return <Button type="button">Save</Button>;
}
```

The React package is a **thin shell**. State, focus, and interaction live in shared engines. The same ones Vue and custom elements use.

### Vue

```bash
pnpm add @sometic/vue @sometic/dom
```

### Vanilla / Web Components

```bash
pnpm add @sometic/elements @sometic/dom
```

```ts
import { defineButtonElements } from "@sometic/elements/button";

defineButtonElements();
```

```html
<sometic-button type="button">Save</sometic-button>
```

## 2. Add app services (the differentiator)

### HTTP with auth refresh awareness

```bash
pnpm add @sometic/http @sometic/auth
```

```ts
import { createHttp } from "@sometic/http";

const http = createHttp({
    baseUrl: "https://api.example.com",
});
```

See [HTTP](/utilities/http) and [Authentication](/authentication/).

### Document head / SEO

```bash
pnpm add @sometic/head
```

```ts
import { createHeadController, serializeHead } from "@sometic/head";

const head = createHeadController({
    initial: { titleTemplate: "%s | My App" },
});
head.set("home", { title: "Home" });
```

React: `@sometic/react/head` (`HeadProvider`, `useHead`). Vue: `@sometic/vue/head`. See [Head / SEO](/utilities/head).

### Theme (optional tokens, still your CSS)

```ts
import { createThemeController, applyThemeToElement } from "@sometic/theme";

const theme = createThemeController({ defaultMode: "system" });
applyThemeToElement(document.documentElement, theme.get());
```

## 3. Read the model

Before browsing every component:

1. [Architecture](/concepts/architecture)
2. [Why Sometic](/guide/why-sometic)
3. [Comparison](/guide/comparison)
4. [Bundlers](/concepts/bundlers)

## Related

- [Installation](/guide/installation)
- [What’s included](/guide/whats-included)
- [Styling](/guide/styling)
