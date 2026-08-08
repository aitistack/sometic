# ADR-0004: Light DOM and Shadow DOM

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | api

## Context

Web Components can use Shadow DOM for isolation, but isolation often blocks the promised styling flexibility (Tailwind/Bootstrap/global design tokens targeting internal slots).

## Decision

- Default **customizable application components** to **Light DOM** where appropriate so consumer CSS, tokens, and utility frameworks can style slots and state attributes.
- Offer **optional Shadow DOM** for isolated embed use cases.
- Do not hide internal elements behind Shadow DOM when doing so prevents the promised styling flexibility.
- Document registration, upgrades, version conflicts, and theming inheritance for both modes.

## Alternatives Considered

1. Shadow DOM everywhere — strong isolation, weak global styling story
2. Light DOM only — insufficient for some embeds/third-party host pages
3. Framework components only (no WC) — abandons Vanilla/HTMX-friendly delivery

## Reasons

The product promise prioritizes consumer styling systems. Light DOM default aligns with that; Shadow DOM remains available when isolation is the goal.

## Consequences

- Need clear docs for when to choose each mode
- Theme CSS variables must work in both modes
- Specificity and global CSS collisions become consumer responsibilities in Light DOM (document guidance)

## Risks

- Global CSS breakage in Light DOM — mitigate with stable slots, `data-*` hooks, low-specificity defaults
- Dual-mode complexity — mitigate with shared behavior engines and mode-specific thin element wrappers

## Migration Impact

None (greenfield). Changing the default later would be breaking for WC consumers.

## Enforcement

Phase 15 implementation + docs examples; element package tests for Light default and Shadow opt-in.

## References

- `docs/architecture/styling-model.md`
- ADR-0003
- Phase 14
