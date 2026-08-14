# ADR-0023: Example applications vs playgrounds

- **Status:** Accepted (consumer discovery paused 2026-08-14)
- **Date:** 2026-08-13
- **Deciders:** Sometic maintainers
- **Tags:** architecture | tooling | docs

## Context

Phase 23 needs realistic example applications that prove the portable claim (same product, React / Vue / Vanilla). Maintainer playgrounds already exist and must stay out of consumer VitePress discovery. Rebranding playgrounds as examples would mix component harnesses with product shapes and leak `pnpm playground:*` into consumer copy.

## Decision

Ship one Invoice Desk product as three private workspace apps that share a private kit:

- `apps/example-invoice-kit` (`@sometic/example-invoice-kit`, unpublished)
- `apps/example-invoice-react`
- `apps/example-invoice-vue`
- `apps/example-invoice-vanilla`

Playgrounds remain the maintainer component harness. Consumer docs must not point at playground URLs or commands. Wave A stacks only. The kit is not an npm package.

**Pause (2026-08-14):** Keep the apps in the repository. Do not publish `/guide/examples` or advertise Invoice Desk until a stronger example program is explicitly reopened. See `.cursor/context/examples-paused.md`.

## Alternatives Considered

1. Rebrand playgrounds as examples: rejected (wrong job; consumer discovery leak).
2. One example app with a framework switcher: rejected (hides the portable claim).
3. Publish the kit on npm: rejected (demo domain, not a product module).
4. Algolia search and versioned VitePress trees as the Phase 23 star: deferred (examples-first; local search stays).

## Reasons

- Shared kit keeps invoice types, seed data, validators, and the mock API from forking.
- Three apps keep adapters thin and the engines identical.
- Private workspace packages cannot be published by accident via Changesets.

## Consequences

- CI builds three extra Vite apps and runs Playwright journeys against them.
- Consumers clone the repo (or copy the app folders) rather than `pnpm add` an example package.
- Data table has no custom element; the Vanilla app binds the engine in Light DOM.

## Risks

- Example apps drift from package APIs. Mitigate with typecheck, build, and E2E on CI.
- Consumer docs accidentally mention playgrounds. Mitigate with `docs:check` and the existing consumer-docs rules.

## Migration Impact

Additive. No public API change. No Changeset.

## Enforcement

- `private: true` on kit and apps
- Consumer Examples page FAQ/comparison
- Playwright journeys per stack
- Package map + this ADR

## References

- Related ADRs: ADR-0014, ADR-0016, ADR-0017, ADR-0022
- Related architecture docs: `docs/architecture/package-map.md`, `docs/architecture/documentation-strategy.md`
- Related phases: Phase 23
