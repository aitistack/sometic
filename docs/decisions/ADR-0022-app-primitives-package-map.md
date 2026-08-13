# ADR-0022: App primitives package map

- **Status:** Accepted
- **Date:** 2026-08-13
- **Deciders:** Sometic maintainers
- **Tags:** architecture | api

## Context

Phase 22 ships application differentiators: feature flags, app-level drafts, durable offline mutation queue, undo/redo, command registry, conflict resolution, and a richer permission controller. Stuffing these into `app-shell`, `forms`, or `dom` would create god packages and blur session-lite vs durable concerns.

## Decision

Ship framework-free feature packages:

- `@sometic/feature-flags` — flag definitions, evaluation, overrides
- `@sometic/drafts` — entity/document draft persistence (distinct from `@sometic/forms/drafts`)
- `@sometic/commands` — command registry / execute bus
- `@sometic/history` — undo/redo stack of reversible entries
- `@sometic/conflict` — conflict records and merge strategies
- `@sometic/offline-queue` — durable mutation outbox (distinct from session `mutationQueue` in app-shell)

Richer permission control extends `@sometic/auth` via `createPermissionController`. Optional composition wires through `@sometic/app-shell` / `createSometicApp`. Command palette UI stays in `@sometic/dom`; it may consume `@sometic/commands` later.

## Alternatives Considered

1. Single `@sometic/app-primitives` mega-package: rejected (tree-shake and ownership).
2. Put offline queue inside `@sometic/query`: rejected (cache vs outbox collision).
3. Put undo inside `@sometic/activity`: rejected (audit log ≠ history stack).
4. New `@sometic/permissions` package: rejected (policies already live in auth).

## Reasons

- Matches ADR-0018 feature-package pattern.
- Keeps session-lite and durable queues honest and separate.
- Preserves one-way dependency direction.

## Consequences

- More publishable packages and docs surfaces.
- Consumers must learn forms drafts vs app drafts, session queue vs offline queue, commands vs command palette.

## Risks

- Catalog breadth risking shallow quality. Mitigate with Level 2 gates per module.
- Accidental merge of session and durable queues. Mitigate via FAQ and ADR callouts.

## Migration Impact

Additive. Opt-in installs. No rename of existing session mutation queue or form drafts.

## Enforcement

- Dependency rules / packages:validate
- ADR index + package map
- Phase 22 completion checklist
- Consumer FAQ / comparison pages

## References

- Related ADRs: ADR-0016, ADR-0018
- Related architecture docs: `docs/architecture/package-map.md`, `docs/architecture/dependency-rules.md`
- Related phases: Phase 22
