# Architecture (consumer view)

Sometic is a **portable application behavior system**: shared controllers for UI, forms, auth, HTTP, query (server state), and document head, with thin framework adapters and your styling system. It is not a visual component library that owns your look and feel.

**Product promise:** one behavior model, every supported JavaScript stack, your design system.

## Mental model

Think in four layers. Dependencies flow one way only: adapters and integrations depend on features; features depend on foundation; foundation never imports frameworks or apps.

```text
Consumer app
    │
    ▼
Framework adapters (react, vue, elements, …)
    │
    ▼
Feature packages (forms, auth, http, query, theme, dom, …)
    │
    ▼
Foundation (core, events, store, styling, accessibility, date-core)
```

Optional peers (auth providers, date libraries, Immer) sit beside features. They never become hard dependencies of foundation packages.

## What ships where

| Layer        | Examples                                                               | You install when…                                         |
| ------------ | ---------------------------------------------------------------------- | --------------------------------------------------------- |
| Foundation   | `@sometic/core`, `events`, `store`, `styling`, `accessibility`         | You need shared contracts, state, or styling hooks        |
| Features     | `theme`, `validation`, `forms`, `auth`, `http`, `query`, `head`, `dom` | You need product behavior (forms, sessions, fetches, SEO) |
| Integrations | `elements`, `auth-local`, `date-native`, …                             | You want custom elements or a concrete provider           |
| Adapters     | `react`, `vue`, Wave B/C packages                                      | You bind engines to a UI framework                        |
| Tooling      | `cli`, `registry`                                                      | You scaffold or add templates                             |

Prefer **subpath imports** (`@sometic/react/button`) so unused surfaces stay out of the bundle. See [Tree shaking](/concepts/tree-shaking).

## Component pattern

Every interactive family follows the same shape:

1. **Behavior engine** (framework-independent): state, events, a11y attributes, slots contract.
2. **Styling resolution**: classes, styles, CSS variables, stable `data-*` state attributes.
3. **Framework adapter**: thin props, refs, slots, and lifecycle binding.
4. **Optional theme**: tokens and CSS variables when you opt in; never required.

Adapters must not reimplement business logic. If React and Vue diverge in behavior, that is a bug.

## Runtime guarantees

**SSR-safe imports:** packages do not read `window`, `document`, `localStorage`, `matchMedia`, or `customElements` at import time. Create controllers and register elements in browser or effect code.

**Explicit state:** no hidden module-level singletons for app state. You create stores, forms, and auth clients; you dispose them when done.

**Native semantics first:** real `<button>`, `<input>`, `<form>`, focus, keyboard, autofill, and labels stay primary. High-level events exist only where native events are insufficient.

**Multi-root safe:** multiple app roots on one page can each own their own store, theme controller, and auth client.

## Auth, HTTP, and Query

```text
UI / route guards (UX only)
        ▼
auth core (session, refresh coordination, capabilities)
        ▼
http client (interceptors, queue-after-refresh)
        ▼
query client (keys, cache, invalidate / optimistic mutate)
        ▼
UI adapters (React / Vue / Vanilla observers)
```

Transport and 401 refresh live on HTTP + auth. Provider adapters (`auth-local`, Firebase, Supabase, OIDC) plug into auth core — they never become HTTP or query dependencies. **Server data stays in `@sometic/query`**, not `@sometic/store`. After re-auth, invalidate or refetch active queries. Your backend remains the authorization enforcement boundary. See [Authentication](/authentication/), [HTTP](/utilities/http), and [Query](/utilities/query).

## Delivery surfaces

| Surface                     | Role                                                 |
| --------------------------- | ---------------------------------------------------- |
| npm packages (`@sometic/*`) | Maintained logic, types, updates                     |
| CLI + registry              | Explicit `init` / `add` (no interactive postinstall) |
| Docs site                   | Consumer guides and maturity labels                  |

## Stability honesty

Public beta labels live on [Beta maturity](/releases/beta). In short:

- **Beta:** Wave A foundations, forms, auth, HTTP, query, React, Vue, Elements, CLI.
- **Experimental:** Wave B (Angular, Svelte, Solid, Preact) and Wave C (Alpine, jQuery, HTMX) contracts.
- **Deferred:** richer selection polish, date/time picker UI, remaining nav chrome, Floating UI adapter, and missing custom elements. Command palette, Tree, data-table engines, and app primitive engines ship as listed in [What’s included](/guide/whats-included). Menu, Combobox, Drawer, and Tabs also ship.

## When to use Sometic

**Use** when you want one behavior model across React, Vue, and vanilla/custom elements, with your own CSS system and optional tokens.

**Do not use** when you need a full design-system skin out of the box, or when you only need a single framework-specific widget with no shared engine.

## FAQ

**Why engines separate from adapters?** So behavior is tested once and frameworks stay thin. Fixing a focus-trap or validation race in the engine benefits every adapter.

**Why not ship Tailwind or Bootstrap inside cores?** Styling must stay consumer-owned. Pass class names; optionally supply a merge function. See [Styling slots](/concepts/styling-slots).

**Where do I start?** Install the engine you need plus one adapter. Example path: `@sometic/forms` + `@sometic/react/form`, or `@sometic/dom` + `@sometic/elements`.

**Are packages independently versioned?** Yes, via Changesets. Coordinated bumps happen when cross-package APIs move together. See [Releases](/releases/).

## Related links

- [Controlled state](/concepts/controlled-state)
- [Uncontrolled state](/concepts/uncontrolled-state)
- [Framework adapters](/concepts/framework-adapters)
- [Design tokens](/concepts/design-tokens)
- [Package index](/api/packages)
- [Store](/stores/store)
- [Components](/components/)
- [Forms](/forms/)
