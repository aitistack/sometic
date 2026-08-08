# ADR-0016: App Shell composition package

- **Status:** Accepted
- **Date:** 2026-08-07
- **Deciders:** Sometic maintainers
- **Tags:** architecture | api

## Context

System packages (auth, http, query, head, theme, store, forms) need shared session-epoch invalidation and dispose graphs. Putting composition inside any single feature package creates upward dependencies or cycles. Consumers otherwise reinvent ad-hoc glue (TanStack + Axios + Helmet + Zustand) without Sometic boundaries.

## Decision

Publish `@sometic/app-shell` as a composition package above features. Peers are optional feature packages. `createAppShell` and `bind*` helpers live here. Session epoch remains owned by `@sometic/auth` (`AuthSession.epoch`); shell and HTTP key off that field.

## Alternatives Considered

1. Live inside `@sometic/auth`: forces auth→query/http/head deps; rejected.
2. Live inside `@sometic/query`: wrong ownership for theme/head/forms; rejected.
3. Docs-only recipes: no enforceable dispose/epoch graph; rejected for System standouts.

## Reasons

- Preserves one-way dependency direction (adapters → integrations → features → foundation).
- One public punchline API for System composition.
- Keeps feature packages free of upward peers.

## Consequences

- New publishable package and size budget.
- Optional peers mean tree-shaking/apps only install what they use.
- Docs and playground must demonstrate epoch + binds (not recipes alone).

## Risks

- Over-composition if consumers treat shell as a mega-framework. Mitigate with when-not-to-use docs.
- Peer version skew. Mitigate with workspace peers and packages:validate.

## Migration Impact

Additive. Existing apps keep manual wiring; adopt `createAppShell` when ready.

## Enforcement

- Dependency rules / packages:validate
- ADR index + package map
- Tests for epoch clear and binds
- Consumer docs + playground

## References

- Related ADRs: ADR-0002, ADR-0006, ADR-0010
- Related architecture docs: `docs/architecture/package-map.md`, `docs/architecture/dependency-rules.md`
- Related phases: system-shell standout wave (release history)
