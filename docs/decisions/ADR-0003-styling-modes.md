# ADR-0003: Styling Modes

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | api

## Context

Consumers use different styling systems. Shipping a hard dependency on Tailwind, Bootstrap, or CSS-in-JS would break the “your styling system” promise.

## Decision

Support multiple styling modes through resolvers and tokens: unstyled, minimal default CSS, design tokens/CSS variables, Tailwind-compatible class hooks, Bootstrap-compatible class hooks, plain CSS, CSS Modules, Sass, and inline styles — **without** making Tailwind or Bootstrap runtime dependencies of `@sometic/styling` or cores.

Optional class-merge utilities may be consumer-provided; we do not hard-depend on `tailwind-merge`.

## Alternatives Considered

1. Tailwind-only components — excludes many apps
2. CSS-in-JS runtime required — size, SSR, and preference issues
3. Shadow DOM–only styling — fights global design systems (see ADR-0004)

## Reasons

Styling neutrality is a core differentiator and keeps bundles small.

## Consequences

- More documentation examples per mode
- Default theme must be easy to disable
- State `data-*` attributes become a primary styling surface

## Risks

- Inconsistent examples — mitigate with shared example fixtures in docs app
- Override-order confusion — mitigate with documented deterministic priority + tests

## Migration Impact

None (greenfield).

## Enforcement

Dependency rules forbidding Tailwind/Bootstrap in styling core; Phase 4 tests for resolution order.

## References

- `docs/architecture/styling-model.md`
- ADR-0004
