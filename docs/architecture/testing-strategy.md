# Testing Strategy

## Layers

| Layer            | Tooling (Phase 1+)                      | Focus                                                                  |
| ---------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| Unit             | Vitest                                  | State, events, validation, errors, edges, cleanup, concurrency         |
| Integration      | Vitest + Testing Library where relevant | Package collaboration, adapters, DOM/forms, refresh flows, SSR         |
| E2E              | Playwright                              | Keyboard, focus, forms, theme, auth with test provider, playgrounds    |
| Accessibility    | axe + manual checklists + Playwright    | Roles, names, focus, keyboard, live regions, RTL, reduced motion       |
| Memory / cleanup | Vitest                                  | Listeners, observers, timers, subscriptions, AbortController, remounts |
| Performance      | Bench scripts + size tooling            | Import cost, updates, theme switch, large forms/tables, budgets        |

## Module Maturity Gates

| Level                  | Minimum tests                                           | Docs bar                                                   | Public claim   |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------- | -------------- |
| 1 Foundation           | Unit + basic docs                                       | Not FAQ-complete yet                                       | Not releasable |
| 2 Production candidate | + integration, a11y, SSR, adapter, size, **edge suite** | Comparison + FAQ + troubleshooting required                | Beta minimum   |
| 3 Stable               | + compatibility, performance, upgrade/migration         | FAQ kept current; no obvious unanswered consumer questions | Stable         |

Level 2+ modules must satisfy `world-class-quality.md` (edges in code + tests; why-this / why-not / under-the-hood docs).

## Mandatory Themes Across Packages

- Reentrancy and race safety (async validation, auth refresh, HTTP queues)
- Disposal and leak absence after repeated mount/unmount
- SSR: no import-time browser access; hydration paths where applicable
- Cross-tab loop prevention for store/auth
- Framework contract tests: same conceptual behavior across adapters
- **Edge completeness:** empty/invalid inputs, cancellation, disabled/loading/error paths, multi-instance safety — see `world-class-quality.md` checklist

## Coverage Policy

- Meaningful coverage over line-chasing; critical paths (auth refresh, form submit, focus trap) require explicit cases
- `pnpm test:coverage` becomes a CI gate once baselines exist (Phase 1 introduces config; thresholds tighten per package)

## Accessibility Testing

Automated checks catch regressions; they do not certify WCAG compliance. Manual keyboard and screen-reader notes live in consumer docs for interactive components.

## Fixture and Test Provider Rules

- Auth: deterministic `@aitistack` test provider for unit/docs/playgrounds
- HTTP: test adapters / mocked fetch
- Never hit real third-party auth in CI by default

## Playgrounds

Each Wave A framework playground is an executable specification. Playground build failures block release of the corresponding adapter.

**Mandate (Phase 7+):** every interactive / browser-visible module must ship a clickable demo in `apps/playground-vanilla` (and in the matching framework playground when that adapter ships UI). Run `pnpm build && pnpm playground:vanilla`. Docs pages do not replace the playground.

## Related

- `accessibility-standard.md`
- `performance-budgets.md`
- `quality-gates` in Phase 1 tooling
