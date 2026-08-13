# ADR-0021: System engine CDN browser bundles

- **Status:** Accepted
- **Date:** 2026-08-13
- **Deciders:** Sometic maintainers
- **Tags:** architecture | tooling | performance | api

## Context

Claim Alignment shipped Wave A `@sometic/elements` CDN bundles (ADR-0020). Consumer docs now require a CDN Usage surface for System engines as well. Library ESM builds keep bare `@sometic/*` externals for tree-shaking; browsers need dedicated bundled entries.

## Decision

Publish dedicated **browser bundles** (ESM + IIFE) for:

- `@sometic/http` → `SometicHttp`
- `@sometic/query` → `SometicQuery`
- `@sometic/auth` → `SometicAuth`
- `@sometic/store` → `SometicStore`
- `@sometic/theme` → `SometicTheme`
- `@sometic/head` → `SometicHead`
- `@sometic/app-shell` → `SometicAppShell`

Each package ships `dist/cdn/sometic-<name>.{esm,iife}.js` that **inlines** the required `@sometic/*` graph. Canonical URLs after npm publish use jsDelivr:

`https://cdn.jsdelivr.net/npm/@sometic/<pkg>@VERSION/dist/cdn/sometic-<name>.esm.js`

Docs may mirror the same bytes under `/cdn/`. Size budgets are separate and honest (larger than tree-shaken subpaths). Styling remains consumer-owned. No Google Fonts CDN.

## Alternatives Considered

1. Import-map multi-package CDN for engines: rejected (fragile; ADR-0020 already rejected as primary path).
2. Single mega `sometic-system` package: deferred; per-engine bundles match docs pages and keep optional composition.
3. Family-slice UI CDN files: deferred; Wave A elements remains one bundle.

## Reasons

- Equal Usage surfaces (npm adapters + CDN) for System pages.
- Keeps publishable library builds tree-shakeable.
- Aligns with jsDelivr/npm without custom CDN infra.

## Consequences

- CDN gzip budgets grow with the inlined graph (especially `app-shell`).
- Docs Installation lists engine + elements CDN URL shapes.
- Smoke HTML and docs `/cdn/` mirror validate loadability.

## Risks

- Bundle growth as engines expand. Mitigate with size-limit entries and optional later slices.
- Auth provider SDKs stay out of core auth CDN (provider packages remain separate).

## Migration Impact

Additive. Existing engine ESM APIs unchanged. Consumers opt into CDN URLs voluntarily.

## Enforcement

- Per-package `tsup.cdn.config.ts` + size-limit entries
- Docs workflow builds packages that feed `/cdn/`
- Consumer docs: Installation CDN table + Usage `[CDN]` tabs
