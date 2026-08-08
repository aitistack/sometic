# Sometic migration completion

**Date:** 2026-08-05  
**Phase:** 13  
**ADR:** ADR-0012

## Objective

Migrate public identity from `@aitistack` / AitiStack Universal Primitives to **Sometic** / `@sometic`, harden consumer VitePress, integrate brand assets.

## Repository state before

- 24 publishable `@aitistack/*` packages at `0.0.1`, unpublished
- VitePress titled AitiStack with contributor Guide mixed in
- Brand assets only in playground
- CE prefix `aiti-*`

## Package mapping

See `docs/migrations/sometic-scope-migration-plan.md`.

## Changes summary

- All workspace package names → `@sometic/*`
- Root name → `sometic-packages`
- Imports, CI, Changesets, cruiser, knip configs updated
- Custom elements `sometic-*`, classes `Sometic*`
- Consumer VitePress IA + logos + `#3dd6c6` theme
- Maintainer docs for publishing/deployment (not in public nav)
- Hard cut (no shims)

## Logo mapping

| Public path      | Visual                                      | Mode  |
| ---------------- | ------------------------------------------- | ----- |
| `/logo.png`      | dark wordmark (from `logo-dark.png` source) | Light |
| `/logo-dark.png` | light wordmark (from `logo.png` source)     | Dark  |

## Commands executed

| Command                    | Result                        |
| -------------------------- | ----------------------------- |
| pnpm format                | pass                          |
| pnpm lint                  | pass                          |
| pnpm typecheck             | pass                          |
| pnpm test                  | pass                          |
| pnpm build                 | pass                          |
| pnpm size                  | pass                          |
| pnpm packages:validate     | pass                          |
| pnpm circular              | pass (exclude VitePress dist) |
| pnpm knip                  | pass                          |
| pnpm test:consumers        | pass                          |
| pnpm docs:build            | pass                          |
| pnpm docs:check            | pass                          |
| pnpm docs:scope-check      | pass                          |
| playground typecheck/build | pass                          |
| pnpm changeset:status      | pass                          |

## Breaking changes

- npm scope `@aitistack` → `@sometic`
- CE tags `aiti-*` → `sometic-*`
- Element class names `Aiti*` → `Sometic*`

## Compatibility

Hard cut; packages were never published under `@aitistack`.

## Deferred

- Live deploy to sometic.aitistack.com
- npm publish
- GitHub org rename
- Phase 14 framework adapter foundation (**ask human first**)
- CLI/registry packages

## Release readiness

In-repo migration complete. Public npm release still deferred to later security/release phases.
