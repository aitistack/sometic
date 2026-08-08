# Framework adapters

**Framework adapters** are thin packages that bind Sometic engines to a UI framework’s props, lifecycle, and rendering model. Behavior stays in foundation and feature packages. Adapters must not fork business logic.

## Overview

```text
@sometic/dom / forms / auth / …   ← behavior engines
            ▲
            │ thin bind
@sometic/react | vue | elements | …
```

Shared adapter conventions live in `@sometic/adapter-contract`. Wave A production targets are React, Vue, Vanilla DOM, and Web Components (`sometic-*`).

## Maturity by wave

| Wave | Packages                               | Label                                      |
| ---- | -------------------------------------- | ------------------------------------------ |
| A    | `react`, `vue`, `elements` (+ engines) | **Beta**                                   |
| B    | `angular`, `svelte`, `solid`, `preact` | **Experimental** (foundation / store-bind) |
| C    | `alpine`, `jquery`, `htmx`             | **Experimental**                           |

See [Beta maturity](/releases/beta) and [Frameworks](/frameworks/) for honest capability notes. Prefer React, Vue, or Elements for production apps in this beta.

## What adapters own

- Mapping props and attributes to engine options
- Wiring events to framework callbacks (`onValueChange`, emits, custom events)
- Lifecycle: create, subscribe, dispose / cleanup on unmount or HTMX swap
- Slots and children projection (`prefix` prop vs Vue `#prefix` vs light DOM children)
- SSR boundaries: no browser registration at import time

## What adapters must not own

- Divergent validation, focus-trap, or refresh-queue logic
- Bundled copies of React/Vue inside the adapter build (peers stay external)
- Hidden singletons that break multi-root pages
- Provider SDKs inside auth core (providers are optional packages)

## Import patterns

Prefer subpaths so unused components drop out:

```ts
import { Button } from "@sometic/react/button";
import { useForm } from "@sometic/react/form";
import { useStore } from "@sometic/react/store";
```

```ts
import { Button } from "@sometic/vue/button";
```

```ts
import "@sometic/elements/button";
// registers <sometic-button> when called in the browser
```

See [Tree shaking](/concepts/tree-shaking) and framework guides under [Frameworks](/frameworks/).

## Example: same engine, two adapters

Button resolve lives in `@sometic/dom`. React and Vue call `resolveButton` each render; `sometic-button` re-resolves on attribute changes. Press gating while `disabled` or `loading` is identical across surfaces.

```tsx
import { Button } from "@sometic/react/button";

<Button loading onClick={() => {}}>
    Save
</Button>;
```

```vue
<script setup lang="ts">
import { Button } from "@sometic/vue/button";
</script>

<template>
    <Button :loading="true" @click="() => {}">Save</Button>
</template>
```

## Custom elements

`@sometic/elements` registers `sometic-*` tags with light DOM by default and optional open shadow via `shadow`. Typed events and tag maps are part of the elements platform. Use Elements when you want framework-agnostic markup or HTML-first progressive enhancement.

## Wave B and C expectations

Experimental adapters expose contracts (often store bind and selected controls) without claiming full component parity with React/Vue. Read each framework page for limits before adopting them in production.

Later-phase catalogs (multi-select polish, date picker UI, data tables, and similar) are not shipped on any adapter in this beta. Menu, Combobox, Tabs, Drawer, and related launch surfaces are available — see [Components](/components/).

## FAQ

**Why not one mega `@sometic/ui` package?** Independent packages and subpaths keep installs intentional and bundles small. See [Package index](/api/packages).

**Can I call engines from vanilla without Elements?** Yes. Use `@sometic/dom` controllers and bind manually. Elements are convenience hosts.

**How do forms differ across React and Vue?** Engines match; lifecycle dispose differs (`useForm` dispose rules). See [Form](/components/form).

**Where is the compatibility matrix?** [Frameworks compatibility](/frameworks/compatibility) and [Beta maturity](/releases/beta).

## Related links

- [Architecture](/concepts/architecture)
- [Frameworks](/frameworks/)
- [React](/frameworks/react)
- [Vue](/frameworks/vue)
- [Vanilla](/frameworks/vanilla)
- [Components](/components/)
- [Package index](/api/packages)
