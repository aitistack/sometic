# ADR-0018: Data & business package map

- **Status:** Accepted
- **Date:** 2026-08-12
- **Deciders:** Sometic maintainers
- **Tags:** architecture | api

## Context

Phase 21 introduces data-table state, filter/query builders, upload queues, activity, approval, and notifications. Putting all of that into `@sometic/dom` or `@sometic/query` would blur ownership: DOM packages would own non-DOM state, and the existing query **cache** package would collide with a query **builder** product surface.

## Decision

Ship framework-free feature packages for non-DOM engines:

- `@sometic/data-table` — table/grid state, URL sync helpers, virtual window math
- `@sometic/query-builder` — filter AST / combinators (distinct from `@sometic/query`)
- `@sometic/upload` — upload/download queue and transport interface
- `@sometic/activity`, `@sometic/approval`, `@sometic/notifications` — respective state engines

Presentation resolve/controllers live under `@sometic/dom/*` (`data-table`, `upload`, `permission-matrix`, `notification-center`, `status`). Wave A adapters (`@sometic/react/data`, `@sometic/vue/data`) stay thin. `@sometic/query` remains the server-state **cache** only; tables may compose it for server mode. Schema form extends `@sometic/forms` / `@sometic/validation` instead of a new form stack. Permission matrix UI binds existing `@sometic/auth` policies.

## Alternatives Considered

1. Put table/builder state inside `@sometic/dom`: rejected (DOM package becomes a data god package).
2. Rename or overload `@sometic/query` for builders: rejected (cache vs builder collision; existing consumers).
3. Single `@sometic/data` mega-package: rejected (tree-shake and ownership suffer).

## Reasons

- Preserves one-way dependency direction and package boundaries.
- Clear npm names for consumer mental model (`query` = cache, `query-builder` = filters).
- Matches prior pattern (forms/query engines + dom controllers + thin adapters).

## Consequences

- More publishable packages and size budgets.
- Docs must repeatedly disambiguate `@sometic/query` vs `@sometic/query-builder`.
- Custom elements for data surfaces deferred (honest Wave A parity with Phase 20 structure).

## Risks

- Catalog size risking shallow quality. Mitigate with sequential per-module Level 2 gates.
- Accidental builder APIs landing in `@sometic/query`. Mitigate via packages:validate and FAQ/ADR callouts.

## Migration Impact

Additive. No rename of `@sometic/query`. New packages are opt-in installs.

## Enforcement

- Dependency rules / packages:validate
- ADR index + package map
- Consumer FAQ comparison pages
- Phase 21 completion checklist

## References

- Related ADRs: ADR-0002, ADR-0010, ADR-0016
- Related architecture docs: `docs/architecture/package-map.md`, `docs/architecture/dependency-rules.md`
- Related phases: Phase 21
