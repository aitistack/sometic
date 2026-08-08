# ADR-0008: Date Adapter Strategy

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | api

## Context

Date/time inputs and pickers need parsing, formatting, and comparison, but Day.js and date-fns must not become mandatory core dependencies.

## Decision

- `@sometic/date-core` defines the adapter contract (parse, format, compare, add, range checks, locale, week start, time zones where supported, invalid dates, serialization).
- Ship `@sometic/date-native` as the default lightweight implementation.
- Optional `@sometic/date-dayjs` and `@sometic/date-fns` peer-adapter packages.
- Input/date UI engines depend on the contract, not a specific library.

## Alternatives Considered

1. Bundle date-fns in core — size and preference lock-in
2. Support only `Date` — weak parsing/formatting for real apps
3. Require Temporal everywhere now — not yet universal enough for our browser policy

## Reasons

Adapter boundaries match auth/HTTP patterns and keep cores dependency-light.

## Consequences

- Date features need adapter documentation
- Behavior parity tests across adapters for shared contract methods
- Native adapter may be less feature-rich; document gaps

## Risks

- Subtle locale/timezone differences across adapters — mitigate with contract tests and docs
- Consumer forgetting to install an adapter — mitigate with clear peer/docs errors

## Migration Impact

None (greenfield). New adapters are additive.

## Enforcement

Dependency rules; Phase 8 date boundary exit criteria.

## References

- `docs/architecture/package-map.md`
- Phase 8
