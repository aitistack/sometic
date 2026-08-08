# ADR-0010: Bundle Size Budgets

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | performance

## Context

Minimal bundle size is a product promise. Without budgets, packages accumulate weight and optional features leak into default entrypoints.

## Decision

Adopt the gzip goals in `docs/architecture/performance-budgets.md` as **targets**, not excuses for weak implementations.

Phase 1+ tooling measures entrypoints consumers import. Optional features use subpath exports or separate packages. Peers stay external.

If a target cannot be met: measure, diagnose, split/lazy-load, document reality, and update this ADR or a follow-up — never hide growth.

## Alternatives Considered

1. No budgets until Phase 24 — too late to shape APIs
2. Single global KB cap for all packages — ignores domain reality (auth vs button)
3. Minify-only discipline without export strategy — insufficient

## Reasons

Early budgets force good package boundaries and tree-shakable design.

## Consequences

- Size checks in CI for budgeted packages
- More subpath exports
- Phase reports must include measured sizes

## Risks

- Unrealistic early targets — mitigate with honest ADR updates
- Gaming metrics via unfair measurement — mitigate with documented methodology

## Migration Impact

None (greenfield). Budget changes are documented, not silently relaxed in CI.

## Enforcement

Size Limit (or equivalent) in CI; phase completion report section 9; PR review for new heavy deps.

## References

- `docs/architecture/performance-budgets.md`
- Phase 1 and Phase 24
- Phase 9 added validation (≤3 KB) and forms (≤6.5 KB) gzip targets
