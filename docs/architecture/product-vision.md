# Product Vision

## Promise

> One behavior model. Every JavaScript framework. Your styling system.

Sometic (`@sometic`) is a universal application primitive ecosystem: shared behavior engines, framework-native adapters, browser-native integrations, optional styling, and design-token theming — published as independent npm packages with an explicit CLI install experience (Sometic by aitiStack).

## Problem

Teams rebuild the same application behavior for every framework and styling stack: forms, auth refresh, theme switching, accessible overlays, table state, and more. Visual UI libraries lock consumers into one look, one framework, or both. Behavior that should be portable becomes duplicated, inconsistent, and hard to secure or update.

## Solution

Separate **behavior** from **rendering** and **styling**:

1. Framework-independent cores own state, events, validation, auth orchestration, and interaction engines.
2. Thin adapters expose native DX for React, Vue, Angular, Svelte, Solid, Preact, Vanilla DOM, Web Components, and later Alpine/jQuery/HTMX.
3. Styling is a consumer choice: unstyled, minimal defaults, tokens, Tailwind, Bootstrap, CSS Modules, Sass, inline styles, or CSS variables — without hard dependencies on any CSS framework.
4. Security-sensitive and frequently patched logic stays in maintained packages; the CLI can generate project-owned wrappers and compositions (hybrid mode recommended).

## Principles

1. Shared behavior in framework-independent cores
2. Thin, native framework adapters — never duplicate business logic
3. Native HTML semantics first
4. Accessibility is a core responsibility, not an add-on
5. Minimal dependencies and minimal bundle size
6. Tree-shakable APIs with intentional subpath exports
7. Strong TypeScript and useful JavaScript IntelliSense
8. Documentation and tests are first-class deliverables
9. Explicit, injectable, SSR-safe, multi-app-safe state
10. Honest maturity labels — no “stable” without Level 3 readiness
11. **World-class only** — production-grade depth, full edge coverage, FAQs so complete consumers never ask “why under the hood?” or “why this instead of that?”

## World-Class Consumer Experience

The product succeeds when a senior engineer can adopt a module without unanswered questions:

- Why this exists and when not to use it
- Why this approach under the hood (and what was rejected)
- Why use this instead of native-only, roll-your-own, or common alternatives
- What happens on every important edge (empty, invalid, cancel, race, SSR, a11y, cleanup)

Shallow or demo-quality components are out of scope for public release. Prefer fewer phenomenal modules over many mediocre ones. See `world-class-quality.md`.

## Success Criteria

- One conceptual Button/Input/Form/Auth model across primary frameworks
- Gzip budgets met or explicitly documented when missed (see performance budgets)
- SSR-safe cores and adapters
- Client-side auth/authorization clearly documented as UX-only; backends enforce independently
- Public beta ships a narrow, **world-class** module set before breadth expansion
- Every public beta module has comparison docs, FAQ, edge tests, and no obvious unanswered consumer questions

## Product Positioning

| We are                               | We are not                                   |
| ------------------------------------ | -------------------------------------------- |
| Application primitive system         | Another visual UI kit                        |
| Behavior + adapters + optional theme | A Tailwind-only or Bootstrap-only library    |
| Provider-agnostic auth orchestration | A Firebase/Supabase wrapper product          |
| Fetch-first HTTP orchestration       | An Axios replacement mandate                 |
| Hybrid CLI (package + source)        | A postinstall-prompt installer               |
| World-class, FAQ-complete modules    | Demo components that leave “why?” unanswered |

## Naming (ADR-0012)

| Item                  | Locked value                  |
| --------------------- | ----------------------------- |
| Product name          | Sometic                       |
| Parent brand          | Sometic                     |
| npm scope             | `@sometic`                    |
| Monorepo root name    | `sometic-packages`            |
| Custom element prefix | `sometic-*`                   |
| CLI package (planned) | `@sometic/cli`                |
| Docs URL              | https://sometic.dev |

## Out of Scope (cores)

Mandatory React/Vue/Angular/etc., mandatory Tailwind/Bootstrap, mandatory Firebase/Supabase/Axios/Immer/dayjs/date-fns, mandatory icon or schema libraries, claiming security certifications that do not exist, building a VS Code extension before APIs stabilize.
