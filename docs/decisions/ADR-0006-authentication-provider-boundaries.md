# ADR-0006: Authentication Provider Boundaries

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | security | api

## Context

Apps need shared auth UX and refresh coordination across providers without baking Firebase/Supabase/OIDC into the core or claiming client UI is a security boundary.

## Decision

- `@sometic/auth` is provider-independent orchestration (session model, capabilities, refresh coordination, flows architecture, authorization helpers for UX).
- Providers live in optional packages (`auth-local`, `auth-firebase`, `auth-supabase`, `auth-oidc`) with SDKs as **peer dependencies**.
- Core exposes **capability checks** rather than assuming every provider supports every flow.
- Documentation must state: client authorization is UX-only; backends enforce access; route guards do not secure APIs.

## Alternatives Considered

1. Single Firebase-first auth package — excludes other stacks
2. Generate full auth internals into apps — security patches become consumer debt
3. Include all SDKs in core as optional deps — bloat and boundary blur

## Reasons

Security-sensitive logic must remain updatable in packages while remaining provider-agnostic at the core.

## Consequences

- More packages to version
- Capability matrix required in docs
- HTTP interceptors integrate with auth core, not provider SDKs directly

## Risks

- Lowest-common-denominator flows — mitigate with capabilities + provider-specific docs
- Misuse of client `can()` as security — mitigate with repeated security docs and examples

## Migration Impact

None (greenfield). Adding a provider is additive.

## Enforcement

Dependency rules forbidding provider SDKs in auth core; security review in Phase 24; Phase 10–12 tests.

## References

- `docs/architecture/security-model.md`
- ADR-0007
