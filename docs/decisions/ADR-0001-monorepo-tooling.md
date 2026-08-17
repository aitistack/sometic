# ADR-0001: Monorepo Tooling

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | tooling

## Context

The ecosystem spans many packages, apps, and tooling concerns. We need a monorepo that enforces consistent TypeScript, linting, testing, versioning, and CI from Phase 1 onward.

## Decision

Use:

- **pnpm** workspaces for installation and linking
- **Turborepo** for task pipelines and caching
- **TypeScript** project references / shared configs under `tooling/typescript`
- **ESLint** + shared `@sometic/eslint-config`
- **Prettier** configured for **four-space** indentation
- **Changesets** for versioning and changelogs
- **Vitest** for unit/integration
- **Playwright** for e2e
- **Size Limit** (or equivalent) for bundle budgets
- **API Extractor or TypeDoc** for API docs/validation
- **GitHub Actions** for CI
- Prepare for **npm trusted publishing** (fully hardened in Phase 24; ADR-0024)

## Alternatives Considered

1. Nx — powerful but heavier operational complexity for this stage
2. Yarn Berry-only — pnpm’s strict node_modules model better matches dependency discipline
3. Lerna-only — insufficient modern pipeline/caching story vs Turborepo + Changesets

## Reasons

pnpm + Turborepo + Changesets is a proven, dependency-strict stack that matches our package-boundary and release needs without over-platforming early.

## Consequences

- All packages share workspace protocols and script names
- Contributors must use pnpm
- CI caching and pipeline definitions become a Phase 1 deliverable

## Risks

- Turborepo misconfiguration hiding failed tasks — mitigate with explicit `dependsOn` and CI verification
- Tooling churn — pin versions and document upgrades

## Migration Impact

None (greenfield). Future tooling swaps require a superseding ADR.

## Enforcement

Phase 1 root scripts and CI; the project contributing guide coding/tooling rules; package validation scripts.

## References

- `docs/architecture/package-map.md`
- Phase 1 roadmap
