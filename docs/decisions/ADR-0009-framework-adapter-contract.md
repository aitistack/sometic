# ADR-0009: Framework Adapter Contract

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | api

## Context

Each framework has idioms. We need consistent conceptual behavior without forcing identical syntax or duplicating engines.

## Decision

Define a shared adapter contract covering: props, state, events, refs, slots, children, controlled/uncontrolled values, lifecycle, context, SSR, errors, styling, accessibility.

Implement Wave A adapters first (React, Vue, Vanilla, Web Components). Expand per `framework-support.md`.

Adapters must:

- Use framework-native primitives (e.g. React hooks/`useSyncExternalStore`, Vue composables/`v-model`, Angular Signals/DI/`ControlValueAccessor`)
- Call shared engines rather than reimplementing behavior
- Pass contract tests for conceptual parity
- Remain peer-dependent on their framework (never bundle the framework into the adapter publish)

AngularJS remains a separate legacy package and must not influence modern contracts.

## Alternatives Considered

1. Identical API syntax across frameworks — fights native DX
2. No contract tests — silent drift
3. Compile-one-component-to-all-frameworks — brittle and opaque

## Reasons

Native DX + shared engines is the only scalable approach for long-term multi-framework support.

## Consequences

- Higher investment in contract tests and docs matrices
- Some prop naming may follow framework conventions when unavoidable (document exceptions)

## Risks

- Drift in edge-case behavior — mitigate with shared fixtures and CI contract suites
- Adapter thickness creep — mitigate with review rules and bundle budgets per adapter

## Migration Impact

None (greenfield). New frameworks are additive packages.

## Enforcement

Phase 14–16 contract tests (`@sometic/adapter-contract` + Wave A/B/C adapter suites); dependency/peer externalization checks; rollout policy.

## References

- `docs/architecture/framework-support.md`
- ADR-0002
- ADR-0005
- ADR-0012 (Sometic naming)
