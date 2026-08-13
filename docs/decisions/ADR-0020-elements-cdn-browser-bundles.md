# ADR-0020: Elements CDN browser bundles

- **Status:** Accepted
- **Date:** 2026-08-13
- **Deciders:** Sometic maintainers
- **Tags:** architecture | tooling | performance | api

## Context

`@sometic/elements` ships ESM subpaths with bare `@sometic/*` externals. That works for bundlers and import maps, but not for a copy-paste `<script>` path. Claim Alignment requires a primary CDN story for Wave A custom elements without teaching consumers a fragile multi-package import-map graph.

## Decision

Publish dedicated **browser bundles** for Wave A elements:

- `dist/cdn/sometic-elements.esm.js` (bundled ESM)
- `dist/cdn/sometic-elements.iife.js` (IIFE, global `SometicElements`)

These entries **inline** the `@sometic/*` graph required by shipped tags (button/input/form/selection/overlay feedback/structure feedback/auth-status). They do not add Google Fonts CDN. Styling stays consumer-owned. Canonical public URLs after npm publish:

- `https://cdn.jsdelivr.net/npm/@sometic/elements@VERSION/dist/cdn/sometic-elements.esm.js`
- `https://cdn.jsdelivr.net/npm/@sometic/elements@VERSION/dist/cdn/sometic-elements.iife.js`

Docs may mirror the same bytes under `/cdn/` for smoke demos. Size budgets for CDN entries are separate and honest (larger than tree-shaken ESM subpaths).

## Alternatives Considered

1. Import-map-only multi-package CDN: rejected as the primary path (fragile, hard to copy-paste, easy to break).
2. Separate publishable `@sometic/elements-cdn` package: rejected (extra release surface; same artifacts fit under `@sometic/elements`).
3. Family slice CDN bundles in v1: deferred; v1 is one Wave A elements bundle.

## Reasons

- Matches the product claim that Vanilla/Web Components are first-class, including HTML-first demos.
- Keeps library ESM builds tree-shakeable while giving browsers a single-file option.
- Aligns with jsDelivr/npm as the distribution contract without a second docs wiki.

## Consequences

- CDN gzip budgets are larger than package subpath budgets; document that honestly.
- CDN covers **shipped CEs only**; data/structure controllers without CEs stay on npm/`@sometic/dom`.
- Side-effect registration runs on load; `SometicElements.register()` remains available for explicit re-entry.

## Risks

- Bundle growth as more CEs ship. Mitigate with size-limit entries and optional family slices later.
- Esbuild may drop bare side-effect imports marked `sideEffects: false` in deps. Mitigate by validating smoke HTML and explicit register entry.

## Migration Impact

Additive. Existing `@sometic/elements` subpath imports unchanged. Consumers opt into CDN URLs voluntarily.

## Enforcement

- `packages/elements` build runs CDN tsup + copy to `apps/docs/public/cdn/`
- size-limit entries for CDN esm/iife
- Consumer docs: Installation + Vanilla CDN sections
- Smoke HTML under docs `/cdn/smoke.html`
