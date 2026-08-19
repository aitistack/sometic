---
description: >-
    Sometic (@sometic) is an open-source portable application behavior system for
    TypeScript: shared controllers for UI, forms, auth, HTTP, query, stores, and
    theming with React, Vue, and Web Components adapters.
---

# Introduction

**Sometic** (`@sometic`) is an open-source **portable application behavior system** for TypeScript.

Shared controllers power UI engines, forms, authentication, HTTP, query, stores, theming, accessibility, overlays, and app-shell composition. Thin adapters expose native DX for React, Vue, and vanilla custom elements (`sometic-*`). You keep your styling system.

**Not** another pre-styled component kit. The product is the **one behavior model**. Components are how you touch it.

## What you get today (beta)

- **Foundation:** `@sometic/core`, `events`, `store`, `styling`, `theme`, `accessibility`, `positioning`, `dom`
- **App spine:** `auth` (+ optional provider adapters), `http`, `query`, **`app-shell`** (`createSometicApp` / `createAppShell`), `forms`, `head`
- **UI engines + adapters:** Button / Field / Selection / Overlay / Structure / Data families via `react`, `vue`, `elements` (honest CE inventory in [What’s included](/guide/whats-included))
- **Tooling:** `@sometic/cli`, `@sometic/registry`

Full inventory and honesty labels: [What’s included](/guide/whats-included).

## Maturity

Public **beta**. Maturity is a label, not a shared npm version. See [Beta maturity](/releases/beta).

## Next

- [App shell](/guide/app-shell) — easiest spine entry
- [Architecture](/concepts/architecture) — mental model
- [Why Sometic](/guide/why-sometic) — positioning
- [Quick start](/guide/quick-start) — React, Vue, CE, then services
- [Authentication](/authentication/) · [HTTP](/utilities/http) · [Query](/utilities/query) · [Components](/components/)
