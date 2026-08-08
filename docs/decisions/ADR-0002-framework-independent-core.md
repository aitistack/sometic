# ADR-0002: Framework-Independent Core

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | api

## Context

Supporting many frameworks must not multiply business logic. Cores must remain usable from Vanilla JS/TS and SSR environments.

## Decision

All shared behavior lives in framework-independent foundation and feature packages. Framework packages are thin adapters only. Core packages must never import React, Vue, Angular, Svelte, Solid, Preact, jQuery, Alpine, HTMX, or AngularJS.

## Alternatives Considered

1. React-first core with ports — rejects non-React consumers and inflates ports
2. Separate full implementations per framework — duplicates bugs and a11y fixes
3. Single mega-package with optional peer framework entrypoints — weak tree-shaking and unclear boundaries

## Reasons

One behavior model is the product promise. Independent cores maximize reuse, testability, and bundle control.

## Consequences

- Adapter work is mostly binding, not reimplementation
- Contract tests become mandatory for parity
- Some framework-idiomatic sugar lives only in adapters (acceptable)

## Risks

- Adapters accidentally reimplement logic — mitigate with code review rules and shared engine APIs
- Lowest-common-denominator APIs — mitigate with adapter-specific ergonomics layered on shared engines

## Migration Impact

None (greenfield). Violations are defects, not features.

## Enforcement

`no-restricted-imports`, dependency-cruiser, PR checklist, `dependency-rules.md`.

## References

- `docs/architecture/dependency-rules.md`
- ADR-0009
