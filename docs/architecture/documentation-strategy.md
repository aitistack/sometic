# Documentation Strategy

## Rule

Documentation is a phase deliverable. A phase is incomplete when its documentation is incomplete.

**World-class bar:** Consumers must not need to ask “why under the hood?” or “why this instead of that?” Documentation anticipates those questions. See `world-class-quality.md`.

## Two Audiences

### Maintainer (maintainer documentation)

Suggested files: `architecture.md`, `state-model.md`, `lifecycle.md`, `extension-guide.md`, `testing.md`, `performance.md`, `troubleshooting.md`

Must explain why the module exists, boundaries, dependency direction, state/events/lifecycle, public vs internal APIs, extension points, errors, perf/memory/SSR/a11y/security, testing, limitations, upgrades, how to add adapters safely, and **design tradeoffs / alternatives rejected**.

### Consumer (`docs/consumer/<module>/`)

Suggested files: `overview.md`, `installation.md`, `quick-start.md`, `api.md`, `styling.md`, `accessibility.md`, `examples.md`, `framework-guides.md`, `troubleshooting.md`, **`faq.md`**, **`comparison.md`** (or equivalent sections inside overview)

Must explain what/when/**when-not**, install, JS and TS usage, framework usage, configuration, props/functions/events/returns/errors, styling, a11y, SSR, testing examples, migrations, common mistakes, bundle impact, browser requirements.

**Also mandatory for public modules:**

| Requirement                      | Content                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Why this                         | Purpose and fit                                                                                                                      |
| Why not alternatives             | Honest comparison vs native-only, roll-your-own, and common libraries                                                                |
| Under the hood (consumer-facing) | Enough architecture to trust the module without reading source                                                                       |
| FAQ                              | Install/peers, controlled state, styling modes, SSR, a11y, size, framework gotchas, security, migrations, non-obvious design choices |
| Production examples              | Real shapes, not toy-only snippets                                                                                                   |

## Architecture and Decisions

| Path                 | Role                                           |
| -------------------- | ---------------------------------------------- |
| `docs/architecture/` | Locked system rules (public in the repository) |
| `docs/decisions/`    | ADRs (public in the repository)                |
| `docs/security/`     | Security policies and reviews                  |
| `docs/performance/`  | Benchmark reports                              |

Maintainer-only release checklists and phase reports stay out of the public repository.

## Browser playground (interactive modules)

VitePress docs are required but **not sufficient** for interactive / browser-visible surfaces.

- Canonical harness: `apps/playground-vanilla` (`pnpm playground:vanilla` → http://127.0.0.1:5190)
- From Phase 7 onward, each new interactive module must extend the playground (or the matching framework playground) before the phase is marked complete
- Phase plans and completion reports must list playground sections/files
- Guide: contributor playground mandate in [Contributing](https://sometic.dev/guide/contributing) · project coding standards

## Package READMEs

Every published package ships a README covering purpose, install, minimal example, link to full docs, peer requirements, and license.

## Docs Application (Phase 1 scaffold, Phase 23 productized)

Local search (MiniSearch) · install commands for npm/pnpm/Yarn/Bun · in-page DemoFrame examples · equal Usage tabs. Realistic example apps under `apps/example-invoice-*` exist in-repo but consumer discovery is paused until a stronger example program is reopened. Version switchers and a global framework switcher stay deferred until 1.0 (single docs tree + `/releases/`; equal per-page code-groups).

## Accuracy Automation (progressive)

Required pages · component Usage labels · markdown internal links · example-app typecheck/build. Deferred: compiling every markdown snippet, generated API-reference freshness.

## IntelliSense as Documentation

Public API JSDoc on declaration surfaces; implementation files remain comment-free. JavaScript consumers get suggestions via `.d.ts` and export maps.

## Related

- `world-class-quality.md`
- ADR process: see `docs/decisions/README.md`
- Coding rule: no implementation comments; docs carry explanation
