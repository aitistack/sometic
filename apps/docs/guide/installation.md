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

Prefer npm + a bundler for apps. Use CDN for demos, HTML-first pages, and progressive enhancement. jsDelivr mirrors each package after publish. The docs site also mirrors the same files under `/cdn/` after build.

Pick one format:

- **Simple script**: classic `<script src="…iife.js">` (no bundler, no `type="module"`)
- **Module script**: `<script type="module">` with `import` from `…esm.js`

### Custom elements (Web Components) {#cdn-web-components}

#### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.iife.js"></script>

<sometic-button type="button">Save</sometic-button>
```

#### Module script

```html
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-button type="button">Save</sometic-button>
```

The elements CDN covers **shipped** tags only (button/input/form/selection/overlay feedback/structure feedback/auth-status). Surfaces without custom elements still use `@sometic/dom` or React/Vue. See [Vanilla](/frameworks/vanilla) and [What’s included](/guide/whats-included).

### Browser bundles

| Package                  | Global                 | Simple script                                                                                      | Module script                                                                                     |
| ------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `@sometic/elements`      | `SometicElements`      | `https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.iife.js`           | `https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.esm.js`           |
| `@sometic/http`          | `SometicHttp`          | `https://cdn.jsdelivr.net/npm/@sometic/http@2.0.1/dist/cdn/sometic-http.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/http@2.0.1/dist/cdn/sometic-http.esm.js`                   |
| `@sometic/query`         | `SometicQuery`         | `https://cdn.jsdelivr.net/npm/@sometic/query@2.0.1/dist/cdn/sometic-query.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/query@2.0.1/dist/cdn/sometic-query.esm.js`                 |
| `@sometic/auth`          | `SometicAuth`          | `https://cdn.jsdelivr.net/npm/@sometic/auth@1.1.1/dist/cdn/sometic-auth.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/auth@1.1.1/dist/cdn/sometic-auth.esm.js`                   |
| `@sometic/store`         | `SometicStore`         | `https://cdn.jsdelivr.net/npm/@sometic/store@1.1.1/dist/cdn/sometic-store.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/store@1.1.1/dist/cdn/sometic-store.esm.js`                 |
| `@sometic/theme`         | `SometicTheme`         | `https://cdn.jsdelivr.net/npm/@sometic/theme@1.1.1/dist/cdn/sometic-theme.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/theme@1.1.1/dist/cdn/sometic-theme.esm.js`                 |
| `@sometic/head`          | `SometicHead`          | `https://cdn.jsdelivr.net/npm/@sometic/head@0.1.1/dist/cdn/sometic-head.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/head@0.1.1/dist/cdn/sometic-head.esm.js`                   |
| `@sometic/app-shell`     | `SometicAppShell`      | `https://cdn.jsdelivr.net/npm/@sometic/app-shell@3.0.2/dist/cdn/sometic-app-shell.iife.js`         | `https://cdn.jsdelivr.net/npm/@sometic/app-shell@3.0.2/dist/cdn/sometic-app-shell.esm.js`         |
| `@sometic/core`          | `SometicCore`          | `https://cdn.jsdelivr.net/npm/@sometic/core@1.0.5/dist/cdn/sometic-core.iife.js`                   | `https://cdn.jsdelivr.net/npm/@sometic/core@1.0.5/dist/cdn/sometic-core.esm.js`                   |
| `@sometic/events`        | `SometicEvents`        | `https://cdn.jsdelivr.net/npm/@sometic/events@1.0.5/dist/cdn/sometic-events.iife.js`               | `https://cdn.jsdelivr.net/npm/@sometic/events@1.0.5/dist/cdn/sometic-events.esm.js`               |
| `@sometic/forms`         | `SometicForms`         | `https://cdn.jsdelivr.net/npm/@sometic/forms@1.1.1/dist/cdn/sometic-forms.iife.js`                 | `https://cdn.jsdelivr.net/npm/@sometic/forms@1.1.1/dist/cdn/sometic-forms.esm.js`                 |
| `@sometic/styling`       | `SometicStyling`       | `https://cdn.jsdelivr.net/npm/@sometic/styling@1.0.5/dist/cdn/sometic-styling.iife.js`             | `https://cdn.jsdelivr.net/npm/@sometic/styling@1.0.5/dist/cdn/sometic-styling.esm.js`             |
| `@sometic/accessibility` | `SometicAccessibility` | `https://cdn.jsdelivr.net/npm/@sometic/accessibility@1.0.5/dist/cdn/sometic-accessibility.iife.js` | `https://cdn.jsdelivr.net/npm/@sometic/accessibility@1.0.5/dist/cdn/sometic-accessibility.esm.js` |
| `@sometic/positioning`   | `SometicPositioning`   | `https://cdn.jsdelivr.net/npm/@sometic/positioning@0.1.5/dist/cdn/sometic-positioning.iife.js`     | `https://cdn.jsdelivr.net/npm/@sometic/positioning@0.1.5/dist/cdn/sometic-positioning.esm.js`     |
| `@sometic/dom`           | `SometicDom`           | `https://cdn.jsdelivr.net/npm/@sometic/dom@2.0.1/dist/cdn/sometic-dom.iife.js`                     | `https://cdn.jsdelivr.net/npm/@sometic/dom@2.0.1/dist/cdn/sometic-dom.esm.js`                     |

#### Simple script (HTTP)

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/http@2.0.1/dist/cdn/sometic-http.iife.js"></script>
<script>
    const http = SometicHttp.createHttp({ baseUrl: "/api" });
    http.get("/me").then((me) => {
        console.log(me);
    });
</script>
```

#### Module script (HTTP)

```html
<script type="module">
    import { createHttp } from "https://cdn.jsdelivr.net/npm/@sometic/http@2.0.1/dist/cdn/sometic-http.esm.js";

    const http = createHttp({ baseUrl: "/api" });
    const me = await http.get("/me");
</script>
```

#### Simple script (app shell)

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/app-shell@3.0.2/dist/cdn/sometic-app-shell.iife.js"></script>
<script>
    const app = SometicAppShell.createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });
</script>
```

#### Module script (app shell)

```html
<script type="module">
    import { createSometicApp } from "https://cdn.jsdelivr.net/npm/@sometic/app-shell@3.0.2/dist/cdn/sometic-app-shell.esm.js";

    const app = createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });
</script>
```

#### Simple script (Vanilla `bind*` via `@sometic/dom`)

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/dom@2.0.1/dist/cdn/sometic-dom.iife.js"></script>
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
