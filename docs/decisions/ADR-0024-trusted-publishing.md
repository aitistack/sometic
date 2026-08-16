# ADR-0024: npm trusted publishing and provenance

- **Status:** Accepted
- **Date:** 2026-08-14
- **Deciders:** Phase 24 security and release hardening
- **Tags:** security | tooling

## Context

`.github/workflows/release.yml` already requested `id-token: write` but still published with a long-lived `NPM_TOKEN` / `NODE_AUTH_TOKEN`. A stolen repository secret can publish `@sometic` packages without tying the tarball to this GitHub Actions workflow. npm trusted publishing (OIDC) plus provenance attestations bind each publish to this repository, this workflow, and a protected environment.

Architecture docs previously labeled this work “Phase 23.” The locked roadmap (`AGENTS.md`, phase roadmap) assigns it to Phase 24.

## Decision

- Publish from `.github/workflows/release.yml` with GitHub OIDC only. Do not set `NPM_TOKEN` or `NODE_AUTH_TOKEN` in the workflow. Do not write a token `.npmrc` for publish.
- Set `NPM_CONFIG_PROVENANCE: true` on the publish job and `publishConfig.provenance: true` on every publishable `@sometic/*` package.
- Bind the publish job to the GitHub environment `npm-publish` (required reviewers, `main` only). Those UI toggles are a maintainer gate, not something git can finish.
- Cutover is OIDC only. No dual token-plus-OIDC fallback. If npm Trusted Publisher is not registered yet, the first `main` publish fails loudly.
- After the first successful OIDC publish, delete the GitHub secret `NPM_TOKEN`.
- Re-run `pnpm packages:validate` and `pnpm audit:deps` on the release job before `changeset publish`.
- Enable Changesets GitHub Releases for published public packages so provenance attestations have a version-tag home. Private workspace packages are not published and must not get noisy GitHub Releases.

## Alternatives Considered

1. Keep `NPM_TOKEN` as a fallback until OIDC is proven: a silent token path is not trusted publishing; a leaked secret still publishes.
2. Dual token and OIDC until the first green publish: same problem; the token remains the real publisher.
3. Manual `npm publish` from a maintainer laptop: bypasses provenance and environment protection.

## Reasons

OIDC-only publishing removes the long-lived secret from the workflow. Provenance lets consumers verify the tarball came from this CI. A protected environment adds a human gate on `main`. Loud failure is preferable to a fallback that looks trusted while still using a token.

## Consequences

- First publish after merge fails until npm Trusted Publisher is bound to this repo and `release.yml`.
- Maintainers must configure the `npm-publish` environment and npm UI; git cannot click those toggles.
- Consumers can verify provenance on npm; we still do not claim SLSA 3+ or bit-identical minified CDN bundles.

## Risks

- npm Trusted Publisher misconfiguration blocks releases: mitigated by `docs/security/release-runbook.md` and `pnpm release:dry-run`.
- Changesets plus provenance needs a current npm on Node 22: pin setup-node and do not inject `NODE_AUTH_TOKEN`.
- Scorecard and branch-protection scores stay low until org settings are on: that is a finding, not a reason to skip the workflow.

## Migration Impact

No consumer API change. Maintainers delete `NPM_TOKEN` after the first green OIDC publish. Publication dry-run packs every `private: false` package, not only `@sometic/core`.

## Enforcement

- `release.yml` has no `NPM_TOKEN` / `NODE_AUTH_TOKEN`.
- `packages:validate` requires `publishConfig.provenance`.
- Release job uses `environment: npm-publish`.
- Maintainer runbook lists UI steps that git cannot perform.

## References

- Related ADRs: ADR-0001 (monorepo tooling)
- Related architecture docs: `docs/architecture/versioning-and-releases.md`, `docs/architecture/security-model.md`, `docs/security/POLICY.md`, `docs/security/release-runbook.md`
- Related phases: Phase 24
