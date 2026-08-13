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

Prefer npm + a bundler for apps. Use CDN for demos, HTML-first pages, and progressive enhancement. After publish, jsDelivr mirrors each package. Pin a version in production (`@1.x.x`). Docs also mirror the same files under `/cdn/` after build.

### Custom elements (Web Components)

```html
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-button type="button">Save</sometic-button>
```

IIFE (registers on load):

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.iife.js"></script>
```

The elements CDN covers **shipped** tags only (button/input/form/selection/overlay feedback/structure feedback/auth-status). Surfaces without custom elements still use `@sometic/dom` or React/Vue. See [Vanilla](/frameworks/vanilla) and [What’s included](/guide/whats-included).

### System engines

| Package              | ESM                                   | IIFE global       |
| -------------------- | ------------------------------------- | ----------------- |
| `@sometic/http`      | `…/dist/cdn/sometic-http.esm.js`      | `SometicHttp`     |
| `@sometic/query`     | `…/dist/cdn/sometic-query.esm.js`     | `SometicQuery`    |
| `@sometic/auth`      | `…/dist/cdn/sometic-auth.esm.js`      | `SometicAuth`     |
| `@sometic/store`     | `…/dist/cdn/sometic-store.esm.js`     | `SometicStore`    |
| `@sometic/theme`     | `…/dist/cdn/sometic-theme.esm.js`     | `SometicTheme`    |
| `@sometic/head`      | `…/dist/cdn/sometic-head.esm.js`      | `SometicHead`     |
| `@sometic/app-shell` | `…/dist/cdn/sometic-app-shell.esm.js` | `SometicAppShell` |

Example (HTTP):

```html
<script type="module">
    import { createHttp } from "https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.esm.js";

    const http = createHttp({ baseUrl: "/api" });
    const me = await http.get("/me");
</script>
```

App shell façade:

```html
<script type="module">
    import { createSometicApp } from "https://cdn.jsdelivr.net/npm/@sometic/app-shell@latest/dist/cdn/sometic-app-shell.esm.js";
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
