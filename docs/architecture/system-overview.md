# System Overview

## Mental Model

```text
┌─────────────────────────────────────────────────────────────┐
│  Consumer apps / playgrounds / docs                          │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│  Framework adapters (react, vue, angular, …)                 │
│  Vanilla DOM / Web Components / Alpine / jQuery / HTMX       │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│  Feature packages                                            │
│  theme · forms · validation · auth · http · dom · elements   │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│  Foundation packages                                         │
│  core · events · store · styling · accessibility · date-core │
└─────────────────────────────────────────────────────────────┘
```

Optional adapter packages (auth providers, date libraries, Immer, Axios) attach beside features via peer dependencies — never inside foundation cores.

## Runtime Guarantees

- No browser globals at module import time
- Explicit instantiation for shared state (no hidden singletons)
- Safe for SSR and for multiple app roots on one page
- Disposable resources with verified cleanup
- Native form/focus/keyboard semantics preserved unless insufficient

## Delivery Surfaces

| Surface                    | Purpose                                           |
| -------------------------- | ------------------------------------------------- |
| npm packages (`@sometic/*`) | Maintained logic, types, updates                  |
| CLI + registry             | `init` / `add` in package, source, or hybrid mode |
| Docs app                   | Consumer and maintainer documentation             |
| Playgrounds                | Per-framework verification and examples           |

## Component Architecture Pattern

Every interactive component family follows:

1. **Behavior engine** (framework-independent) — state, events, a11y attributes, slots contract
2. **Styling resolution** — classes/styles/CSS variables/state `data-*` attributes
3. **Framework adapter** — thin binding to props, refs, slots, lifecycle
4. **Optional default theme** — never required

## Auth and HTTP Relationship

```text
UI / route guards (UX only)
        ↓
auth core (session, refresh coordination, capabilities)
        ↓
http client (interceptors, queue-after-refresh)
        ↓
provider adapters (local REST, Firebase, Supabase, OIDC)
```

Backend APIs remain the enforcement boundary for authorization.

## Source of Truth Hierarchy

1. Accepted ADRs in `docs/decisions/`
2. Architecture docs in `docs/architecture/`
3. Contributing guide and public coding standards
4. Implementation and tests
5. Consumer docs (must match public APIs)

Conflicts resolve upward: change ADR/architecture first, then code and docs.
