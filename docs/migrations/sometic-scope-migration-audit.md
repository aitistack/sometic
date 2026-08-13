# Sometic scope migration — repository audit

**Date:** 2026-08-05  
**Phase:** 13  
**Status:** Pre-migration inventory (ADR-0012)

## Scope of search

Strings and identities: `@aitistack`, `aitistack`, `Sometic`, `aiti-*`, Universal Primitives branding in VitePress, package install examples, Changesets, CI, playground, tests.

## Findings by category

### Public package identity

- 24 publishable packages under `packages/*` named `@sometic/<name>` at `0.0.1` with `publishConfig.access: public`.
- None published to npm (registry 404; CI only `npm pack --dry-run`).
- Package descriptions, homepage, and repository metadata reference Sometic / `@aitistack`.

### Internal package dependency

- Workspace deps and source imports use `@sometic/*` (~200+ import sites across packages/apps/tests).
- Tooling packages: `@sometic/build-config`, `bundle-size-config`, `release-tools`, `testing-config`, `typescript-config`, `eslint-config`.

### Documentation

- VitePress at `apps/docs` titled “Sometic”; Guide includes maintainer monorepo pages.
- Package docs under `apps/docs/packages/*` and mirrors under `docs/consumer/*`.
- Architecture/ADRs/phases under `docs/` (not all in VitePress).

### Build tooling

- Root name `aitistack-packages`; scripts filter `@sometic/docs`, `@sometic/core`, playground.
- ESLint extends `@sometic/eslint-config`; tsup/vitest configs reference workspace packages.
- `dependency-cruiser.cjs`, knip, size-limit budgets use `@aitistack` paths/names.

### Publishing

- `.changeset/config.json` ignores `@sometic/docs`.
- Phase changesets reference `@sometic/*` package names.
- No live npm publish workflow; `release-prep.yml` dry-run only.

### CI/CD

- `.github/workflows/ci.yml` docs build + `release:dry-run` on `@sometic/core`.
- No deploy job for docs site.

### Examples / playground

- `apps/playground-vanilla` imports `@sometic/*`; uses `aiti-*` custom elements; brand assets in `src/assets` and `public/`.

### Tests

- Unit tests and `tests/consumers/*` import `@sometic/*`.
- Elements tests create `sometic-button` etc.

### Branding / assets

- Logos/icon only under playground (PNG); docs site has no `public/` brand assets yet.
- Product promise text reused; title Sometic.

### URLs

- Repository: `github.com/aitistack/sometic` (retain until org move).
- Planned docs: `https://sometic.dev` (not deployed).

### Migration compatibility

- Hard cut safe: unpublished.
- Historical phase reports and changelogs will retain some `@aitistack` history; consumer VitePress must not (except migration page).

## CLI / registry

- Not present (future Phase 17). No templates to migrate.

## Risk notes

- Dual consumer trees (`docs/consumer` vs `apps/docs`) drift.
- CE rename (`aiti-*` → `sometic-*`) breaks any local HTML using old tags.
- Full docs IA rewrite is the largest remaining effort after mechanical rename.
