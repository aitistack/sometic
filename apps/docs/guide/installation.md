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

## Experimental Wave B (store bind)

These packages do **not** ship component kits. There is no `@sometic/preact/button`, `@sometic/preact/structure`, or equivalent for Angular / Svelte / Solid. They bind [`@sometic/store`](/stores/) into the host subscription model. For UI, use [Elements](/frameworks/vanilla) or a Wave A adapter ([React](/frameworks/react), [Vue](/frameworks/vue)).

### Preact

Peer: `preact` `^10` (optional). Capabilities: `storeBind` only.

<InstallCommands packages="@sometic/preact @sometic/store" />

See [Preact](/frameworks/preact) for `createPreactStoreBind`. Phase 20 structure components (Tabs, Accordion, Breadcrumb, Command palette, Tree) are on `@sometic/react/structure` and `@sometic/vue/structure`, not Preact.

### Angular, Svelte, Solid

Same Wave B contract: store bind, no component subpaths. Guides: [Angular](/frameworks/angular), [Svelte](/frameworks/svelte), [Solid](/frameworks/solid).
