# Release runbook (trusted publishing)

Maintainer-only. Consumer VitePress does not document this path.

## What git already does

- `.github/workflows/release.yml` publishes with GitHub OIDC (`id-token: write`), `NPM_CONFIG_PROVENANCE: true`, and `environment: npm-publish`.
- The workflow does **not** set `NPM_TOKEN` or `NODE_AUTH_TOKEN`. There is no token fallback.
- Before `changeset publish`, the job re-runs `pnpm packages:validate` and `pnpm audit:deps`.
- `.github/workflows/release-prep.yml` packs every publishable package with no token (dry-run of the OIDC path).
- Publishable packages set `publishConfig.provenance: true`.

## Maintainer UI (required before the first OIDC publish on `main`)

These cannot be done from git.

### 1. npm Trusted Publisher

1. Sign in to npmjs.com as an owner of the `@sometic` org.
2. For each package that will publish (or at org level if npm offers it), add a **Trusted Publisher**:
    - Provider: GitHub Actions
    - Repository: `aitistack/sometic`
    - Workflow filename: `release.yml`
    - Environment: `npm-publish`
3. Do not leave a classic automation token as a silent backup.

### 2. GitHub environment `npm-publish`

1. Repo **Settings → Environments → New environment** named `npm-publish`.
2. Required reviewers: at least one maintainer.
3. Deployment branches: `main` only.
4. No `NPM_TOKEN` environment secret.

### 3. GitHub code security toggles

Enable on `aitistack/sometic`:

- Dependabot alerts and Dependabot security updates
- Secret scanning and push protection
- Private vulnerability reporting (GitHub Security Advisories)

### 4. After the first successful OIDC publish

1. Confirm the npm package version shows provenance.
2. Delete the repository secret `NPM_TOKEN` if it still exists.
3. Confirm `release.yml` still has no token env vars (it should not).

## Local dry-run

```bash
pnpm build
pnpm packages:validate
pnpm release:dry-run
pnpm audit:deps
```

`pnpm release:dry-run` packs every `private: false` `@sometic/*` package. It does not publish and does not need a token.

`pnpm release:repro-check` packs an unminified library tarball twice with `SOURCE_DATE_EPOCH` from `HEAD` and compares hashes. Minified CDN IIFE output is **not** claimed bit-identical.

## Cutover rule

If Trusted Publisher is not registered, the first `main` publish fails. That is expected. Register the publisher and re-run. Do not restore `NPM_TOKEN` to “just ship.”

## What we will not claim

- SLSA 3+
- Bit-identical esbuild minify for CDN IIFE
- SOC2, ISO, or WCAG certification
- That Sometic secures consumer APIs
