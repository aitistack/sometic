---
description: >-
    Install Sometic packages from npm (@sometic/core, @sometic/react, @sometic/vue,
    and more). Peer-friendly installs for React, Vue, and vanilla Web Components.
---

# Installation

Install only the packages you need from the `@sometic` scope.

## Core

<InstallCommands packages="@sometic/core" />

## Typical stacks

### React

<InstallCommands packages="@sometic/react @sometic/core @sometic/theme" />

### Vue

<InstallCommands packages="@sometic/vue @sometic/core @sometic/theme" />

### Vanilla / custom elements

<InstallCommands packages="@sometic/elements @sometic/theme" />

## App shell

Auth + HTTP + query composition:

<InstallCommands packages="@sometic/app-shell @sometic/auth @sometic/http @sometic/query" />

Optional peers: `@sometic/head`, `@sometic/theme`, `@sometic/store`, `@sometic/forms`.

## System packages

### Auth

<InstallCommands packages="@sometic/auth" />

### HTTP

<InstallCommands packages="@sometic/http" />

### Query

<InstallCommands packages="@sometic/query" />

### Head

<InstallCommands packages="@sometic/head" />

### Forms

<InstallCommands packages="@sometic/forms" />

### Store

<InstallCommands packages="@sometic/store" />

### Theme

<InstallCommands packages="@sometic/theme" />

## CDN (browser bundles)

Prefer npm + a bundler for apps. Use CDN for demos, HTML-first pages, and progressive enhancement. After publish, jsDelivr mirrors each package. Pin a version in production (`@x.y.z`), not only `@latest`. Docs also mirror the same files under `/cdn/` after build. IIFE (`<script src>` without `type="module"`) is the HTML-first path. ESM is optional.

### Custom elements (Web Components) {#cdn-web-components}

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.iife.js"></script>

<sometic-button type="button">Save</sometic-button>
```

ESM alternative:

```html
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-button type="button">Save</sometic-button>
```

The elements CDN covers **shipped** tags only (button/input/form/selection/overlay feedback/structure feedback/auth-status). Surfaces without custom elements still use `@sometic/dom` or React/Vue. See [Vanilla](/frameworks/vanilla) and [What’s included](/guide/whats-included).

### Browser bundles

Full jsDelivr URLs. Replace `@latest` with a pinned version in production.

| Package                  | IIFE global            | IIFE                                                                                                | ESM                                                                                                |
| ------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `@sometic/elements`      | `SometicElements`      | `https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.iife.js`           | `https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js`           |
| `@sometic/http`          | `SometicHttp`          | `https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.esm.js`                   |
| `@sometic/query`         | `SometicQuery`         | `https://cdn.jsdelivr.net/npm/@sometic/query@latest/dist/cdn/sometic-query.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/query@latest/dist/cdn/sometic-query.esm.js`                 |
| `@sometic/auth`          | `SometicAuth`          | `https://cdn.jsdelivr.net/npm/@sometic/auth@latest/dist/cdn/sometic-auth.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/auth@latest/dist/cdn/sometic-auth.esm.js`                   |
| `@sometic/store`         | `SometicStore`         | `https://cdn.jsdelivr.net/npm/@sometic/store@latest/dist/cdn/sometic-store.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/store@latest/dist/cdn/sometic-store.esm.js`                 |
| `@sometic/theme`         | `SometicTheme`         | `https://cdn.jsdelivr.net/npm/@sometic/theme@latest/dist/cdn/sometic-theme.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/theme@latest/dist/cdn/sometic-theme.esm.js`                 |
| `@sometic/head`          | `SometicHead`          | `https://cdn.jsdelivr.net/npm/@sometic/head@latest/dist/cdn/sometic-head.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/head@latest/dist/cdn/sometic-head.esm.js`                   |
| `@sometic/app-shell`     | `SometicAppShell`      | `https://cdn.jsdelivr.net/npm/@sometic/app-shell@latest/dist/cdn/sometic-app-shell.iife.js`         | `https://cdn.jsdelivr.net/npm/@sometic/app-shell@latest/dist/cdn/sometic-app-shell.esm.js`         |
| `@sometic/core`          | `SometicCore`          | `https://cdn.jsdelivr.net/npm/@sometic/core@latest/dist/cdn/sometic-core.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/core@latest/dist/cdn/sometic-core.esm.js`                   |
| `@sometic/events`        | `SometicEvents`        | `https://cdn.jsdelivr.net/npm/@sometic/events@latest/dist/cdn/sometic-events.iife.js`               | `https://cdn.jsdelivr.net/npm/@sometic/events@latest/dist/cdn/sometic-events.esm.js`               |
| `@sometic/forms`         | `SometicForms`         | `https://cdn.jsdelivr.net/npm/@sometic/forms@latest/dist/cdn/sometic-forms.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/forms@latest/dist/cdn/sometic-forms.esm.js`                 |
| `@sometic/styling`       | `SometicStyling`       | `https://cdn.jsdelivr.net/npm/@sometic/styling@latest/dist/cdn/sometic-styling.iife.js`             | `https://cdn.jsdelivr.net/npm/@sometic/styling@latest/dist/cdn/sometic-styling.esm.js`             |
| `@sometic/accessibility` | `SometicAccessibility` | `https://cdn.jsdelivr.net/npm/@sometic/accessibility@latest/dist/cdn/sometic-accessibility.iife.js` | `https://cdn.jsdelivr.net/npm/@sometic/accessibility@latest/dist/cdn/sometic-accessibility.esm.js` |
| `@sometic/positioning`   | `SometicPositioning`   | `https://cdn.jsdelivr.net/npm/@sometic/positioning@latest/dist/cdn/sometic-positioning.iife.js`     | `https://cdn.jsdelivr.net/npm/@sometic/positioning@latest/dist/cdn/sometic-positioning.esm.js`     |
| `@sometic/dom`           | `SometicDom`           | `https://cdn.jsdelivr.net/npm/@sometic/dom@latest/dist/cdn/sometic-dom.iife.js`                     | `https://cdn.jsdelivr.net/npm/@sometic/dom@latest/dist/cdn/sometic-dom.esm.js`                     |

Example (HTTP, IIFE then ESM):

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.iife.js"></script>
<script>
    const http = SometicHttp.createHttp({ baseUrl: "/api" });
    http.get("/me").then((me) => {
        console.log(me);
    });
</script>
```

```html
<script type="module">
    import { createHttp } from "https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.esm.js";

    const http = createHttp({ baseUrl: "/api" });
    const me = await http.get("/me");
</script>
```

App shell façade:

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/app-shell@latest/dist/cdn/sometic-app-shell.iife.js"></script>
<script>
    const app = SometicAppShell.createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });
</script>
```

```html
<script type="module">
    import { createSometicApp } from "https://cdn.jsdelivr.net/npm/@sometic/app-shell@latest/dist/cdn/sometic-app-shell.esm.js";
</script>
```

Vanilla `bind*` without a bundler uses `@sometic/dom`:

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/dom@latest/dist/cdn/sometic-dom.iife.js"></script>
<script>
    const button = document.querySelector("button");
    if (button) {
        SometicDom.bindButton(button, () => ({ type: "button" }));
    }
</script>
```

## Experimental Wave B (store bind)

These packages do **not** ship component kits. There is no `@sometic/preact/button`, `@sometic/preact/structure`, or equivalent for Angular / Svelte / Solid. They bind [`@sometic/store`](/stores/) into the host subscription model. For UI, use [Elements](/frameworks/vanilla) or a Wave A adapter ([React](/frameworks/react), [Vue](/frameworks/vue)).

### Preact

Peer: `preact` `^10` (optional). Capabilities: `storeBind` only.

<InstallCommands packages="@sometic/preact @sometic/store" />

See [Preact](/frameworks/preact) for `createPreactStoreBind`. Phase 20 structure components (Tabs, Accordion, Breadcrumb, Command palette, Tree) are on `@sometic/react/structure` and `@sometic/vue/structure`, not Preact.

### Angular, Svelte, Solid

Same Wave B contract: store bind, no component subpaths. Guides: [Angular](/frameworks/angular), [Svelte](/frameworks/svelte), [Solid](/frameworks/solid).
