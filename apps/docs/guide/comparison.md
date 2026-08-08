# Comparison

How Sometic differs from common alternatives. Choose the tool that matches your constraints.

## The uniqueness test

Ask one question: **do you need portable application behavior** (UI + forms + auth + HTTP + query + app shell) across more than one view layer, or a React-only UI kit?

| Need                                                   | Prefer                                    |
| ------------------------------------------------------ | ----------------------------------------- |
| Pre-styled React UI                                    | MUI, Chakra, Ant Design, shadcn/ui        |
| Headless React primitives only                         | Radix, Headless UI, React Aria            |
| **Same controllers across Vanilla + React + Vue + CE** | **Sometic**                                |
| Auth / HTTP / Head orchestration without SDK lock-in   | **Sometic** (+ optional provider adapters) |
| Copy-paste styled React blocks owned by your repo      | shadcn-style registries                   |

If the answer is “I only ever ship React and I only need widgets,” use a headless or visual kit. If the answer is “behavior must survive a framework change and include session/fetch flows,” Sometic is the fit.

## Portable application behavior (the wedge)

| Capability                         | Typical headless UI kit | Typical visual kit | Sometic                              |
| ---------------------------------- | ----------------------- | ------------------ | ----------------------------------- |
| Cross-framework controllers        | Rare (React-first)      | Rare               | **Core design**                     |
| Unstyled / your design system      | Often                   | No                 | **Default**                         |
| Forms engine                       | Separate library        | Opinionated        | **First-party**                     |
| Auth session + refresh             | Bring your own          | Bring your own     | **Orchestration in `@sometic/auth`** |
| Fetch interceptors + refresh queue | Bring your own          | Bring your own     | **`@sometic/http`**                  |
| Server-state cache (keys/mutate)   | Bring your own          | Bring your own     | **`@sometic/query` (Wave A)**        |
| Document head / SEO                | React-only helpers      | Bring your own     | **`@sometic/head` (portable)**       |
| System composition (epoch binds)   | Bring your own          | Bring your own     | **`@sometic/app-shell`**             |
| Custom elements as first-class     | Rare                    | Rare               | **`sometic-*` adapters**             |

## vs visual UI kits (MUI, Chakra, Ant)

Those libraries ship **design systems**. Sometic ships **behavior engines** and expects your styles (or tokens). Use a kit when you want an opinionated look tomorrow; use Sometic when look and framework must stay portable.

## vs Radix / Headless UI / React Aria

Excellent headless primitives, typically **React-first** and **UI-scoped**. Sometic’s cores are framework-independent; React/Vue/Elements are thin adapters over the same controllers, and auth/HTTP sit in the same product. If you only ship React forever and only need widgets, those libraries may be enough. If you also need Vanilla/CE or Vue **without rewriting behavior**, and you want session/fetch orchestration in-tree, Sometic’s shared engines are the point.

## vs shadcn/ui

shadcn excels at **generated, styled, React** building blocks owned by your repo. Sometic’s CLI can generate wrappers too, but the **logic stays in maintained packages** (auth refresh, form engines, overlay a11y). Hybrid mode: package for patched behavior, source for composition.

## vs ad-hoc System glue (TanStack + Axios + Helmet + Zustand)

You can assemble those libraries yourself. [`@sometic/app-shell`](/guide/app-shell) exists so **session epoch**, query clear on identity change, HTTP replay refusal, theme↔head, store kinds, and mutation↔form share one dispose graph across Vanilla / React / Vue, with documented boundaries (query ≠ store ≠ form drafts). Prefer App Shell when you want that guarantee out of the box; prefer a custom stack when you already standardized on TanStack/Axios/Helmet and only need Sometic for UI adapters.

## vs TanStack Query / SWR

[Sometic Query](/utilities/query) (`@sometic/query`) is a portable Wave A server-state cache: domain keys, observers, mutations, invalidation, and `createHttpQueryFn` next to `@sometic/http` / auth. **TanStack Query** remains the deeper React-centric ecosystem (devtools, plugins, infinite patterns). Prefer Sometic Query when you want the same client across React, Vue, and Vanilla inside the Sometic stack; prefer TanStack or SWR when you need that ecosystem alone or already standardized on them. You can still use Sometic for UI, forms, and auth alongside.

## vs native HTML only

Native controls are always valid. Sometic adds **cross-cutting behavior** (controllable state, validation composition, auth/HTTP, focus/dismiss stacks, positioning) without replacing native semantics.

## vs rolling your own

Fine for a single app and framework. Cost appears when you need the same form/auth/overlay rules in a second framework, SSR safety, nested Escape, and long-term patches. Sometic centralizes that cost in versioned packages.

## Framework breadth (honest)

Wave A (React, Vue, Elements) is the production path. Angular/Svelte/Solid/Preact and Alpine/jQuery/HTMX are **experimental** bind layers in this beta, not full component kits. See [What’s included](/guide/whats-included).

## Related

- [Why Sometic](/guide/why-sometic)
- [Architecture](/concepts/architecture)
- [What’s included](/guide/whats-included)
- [Beta maturity](/releases/beta)
