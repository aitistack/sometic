# ADR-0014: Typography Surfaces (Docs + Playgrounds)

- **Status:** Accepted
- **Date:** 2026-08-06
- **Deciders:** Typography system plan acceptance
- **Tags:** design | docs | playground | identity

## Context

Sometic needs a consistent brand type system on marketing and demo surfaces without forcing fonts into publishable packages. Consumers must keep full control of their application typography. Fonts are already self-hosted under each app’s `public/fonts/` (OFL).

## Decision

1. Lock the surface triad:
    - **Chakra Petch** — display / identity headings (sparingly)
    - **Urbanist** — UI, navigation, and body reading
    - **JetBrains Mono** — code, kbd, samp, mono chrome
2. Apply fonts **only** in VitePress docs and playground apps.
3. Do **not** add font files, `@font-face`, or font CSS dependencies to publishable `@sometic/*` packages (`react`, `vue`, `elements`, `dom`, `theme`, etc.). Components remain font-agnostic and inherit consumer fonts.
4. Share tokens and `@font-face` via private `@sometic/demo-kit` (`typography.css`), not via public UI packages.
5. Self-host from `/fonts/...` on each app; no Google Fonts CDN. Prefer latin-subset **WOFF2** on the critical path (`*-latin.woff2`); regenerate via `scripts/generate-surface-fonts.py`.
6. Hierarchy guidance: H1 / hero display at weight 700; H2–H3 (and section titles) at 600 Chakra; body/UI Urbanist 400–600; code JetBrains 400–500.

## Alternatives Considered

1. Ship fonts from `@sometic/theme` — rejected (locks consumer apps; violates “your styling system”).
2. Keep Google Fonts CDN on docs — rejected (privacy, reliability, brand control).
3. Per-app duplicated `@font-face` with no shared tokens — rejected (drift across docs/playgrounds).

## Reasons

Identity and demo polish belong on surfaces. Publishable packages must stay styling-mode agnostic (ADR-0003, ADR-0012). Self-hosted OFL fonts keep docs offline-friendly and CDN-free.

## Consequences

- Docs and playgrounds import `@sometic/demo-kit/typography.css`.
- Demo chrome (`--pg-font` / `--pg-mono`) maps to Urbanist / JetBrains Mono tokens.
- Agent rules forbid font assets in publishable packages.
- Consumer apps and package examples outside docs/playgrounds are unchanged.

## Risks

- Missing `public/fonts` copy in a new playground → fallbacks to system fonts; mitigate by scaffolding fonts with the app.
- Overusing Chakra on body text weakens hierarchy; mitigate with rules + context do/don’t.

## Migration Impact

None for package consumers. Docs/playground rebuild picks up self-hosted faces; remove CDN links.

## Enforcement

- project coding standards
- Grep publishable packages for `Chakra|Urbanist|JetBrains|@font-face` must stay empty
- ADR index + architecture context

## References

- architecture context
- `packages/demo-kit/src/typography.css`
- ADR-0012 (product identity)
- ADR-0003 (styling modes)
