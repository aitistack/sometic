# ADR-0011: Validation Native API and Schema Adapter Strategy

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 9 plan acceptance
- **Tags:** architecture | api | validation

## Context

Business apps need validation, but locking the ecosystem to Zod, Yup, Valibot, or similar would violate the “no schema-library lock-in” product rule. Consumers still expect an escape hatch to use a preferred schema library.

## Decision

- `@sometic/validation` owns the native issue model, path helpers, built-in validators, composition (`pipe` / `all` / `refine` / `when`), and async runner helpers.
- Define a `SchemaAdapter` contract (`parse` / `safeParse` / optional `validateAsync`) so optional future packages can wrap Zod/Yup/Valibot without those libraries entering core.
- `@sometic/forms` depends on `@sometic/validation` only — never on a schema library.
- Phase 9 shipped the contract only (no Zod/Yup packages).
- **Follow-up (2026-08-07):** `@sometic/validation/define` (small first-party schema), `@sometic/validation-zod`, and `@sometic/validation-yup` ship as optional peers. Forms still depend only on `@sometic/validation`.

## Alternatives Considered

1. Mandate Zod everywhere — preference and size lock-in
2. Ship no validation package and tell consumers to use RHF+Zod — abandons framework-independent promise
3. Bundle a minimal schema DSL in core — duplicates ecosystem libraries and grows forever

## Reasons

Matches date/auth adapter boundaries: cores stay dependency-light; optional peers extend later.

## Consequences

- FAQ/comparison must explain native validators vs bringing your own schema adapter
- Form docs show both field validators and form-level composition
- Future schema adapter packages are peer-optional and tested against the contract

## Risks

- Consumers expect Zod on day one — mitigate with clear docs and a thin adapter package in a later phase
- Dual mental models (native vs schema) — mitigate with one issue shape and path conventions

## Migration Impact

None (greenfield). Schema adapters are additive.

## Enforcement

Dependency rules forbid schema libraries in cores; Phase 9 exit criteria; package lint.

## References

- `docs/architecture/dependency-rules.md`
- release history
