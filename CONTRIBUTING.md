# Contributing

Thanks for helping improve Sometic. Changes land through pull requests with CI and maintainer review. Pushes to `main` are restricted.

Full guide: **[Contributing](https://sometic.dev/guide/contributing)** (or `/guide/contributing` when running the docs site locally).

## Requirements

- Node.js `>=20.18.0`
- pnpm `10.14.0` (see the root `packageManager` field)

## Setup

```bash
git clone https://github.com/aitistack/sometic.git
cd sometic
pnpm install
pnpm build
```

## Common commands

| Command                             | Purpose                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| `pnpm build`                        | Build packages (Turbo)                                      |
| `pnpm lint`                         | Lint                                                        |
| `pnpm typecheck`                    | Typecheck                                                   |
| `pnpm test`                         | Unit / package tests                                        |
| `pnpm test:coverage`                | Coverage                                                    |
| `pnpm test:e2e`                     | Playwright e2e                                              |
| `pnpm size`                         | Bundle size budgets                                         |
| `pnpm packages:validate`            | Package metadata / export checks                            |
| `pnpm docs:dev`                     | Docs site (VitePress)                                       |
| `pnpm docs:build`                   | Build docs                                                  |
| `pnpm docs:check`                   | Docs validation                                             |
| `pnpm playground:vanilla`           | Vanilla / Web Components playground → http://127.0.0.1:5190 |
| `pnpm playground:react`             | React playground                                            |
| `pnpm playground:vue`               | Vue playground                                              |
| `pnpm format` / `pnpm format:check` | Prettier                                                    |
| `pnpm changeset`                    | Add a Changeset for publishable changes                     |
| `pnpm changeset:status`             | Changeset status                                            |

Local quality gate before opening a PR:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm size && pnpm packages:validate
```

## Checklist

1. Read [Architecture](https://sometic.dev/concepts/architecture) and [What’s included](https://sometic.dev/guide/whats-included)
2. Use pnpm and **four-space** indentation (never tabs or two spaces)
3. Do not add comments in TypeScript implementation or test files
4. Add tests and docs (including FAQ/comparison for public modules)
5. Add playground coverage for new interactive / browser-visible surfaces
6. Run the local quality gate above
7. Add a Changeset for publishable package changes (`pnpm changeset`)
8. Open a PR; CI and maintainer review are required before merge

## Architecture notes

Keep dependency direction one-way: adapters → integrations → features → foundation. Cores must not import React, Vue, or other frameworks. Prefer native HTML semantics and SSR-safe imports (no browser globals at import time).

## Bugs, features, and security

Use GitHub issue templates (**Bug report** / **Feature request**). Include package versions, framework, and reproduction steps.

Security-sensitive changes need explicit notes in the PR description. For vulnerabilities, see [SECURITY.md](./SECURITY.md). Do not file public issues for exploitable vulns.

Maintainer npm publishing uses GitHub OIDC trusted publishing (no `NPM_TOKEN`), provenance, and the GitHub environment `npm-publish`. Public reporting is in [SECURITY.md](./SECURITY.md).

### Release loop (do not invent extra steps)

1. Merge feature PRs that include a Changeset. **Version PR** opens itself. No npm approval.
2. Merge the `chore: version packages` PR. That bump is the source of truth; do not open a second version PR if npm is behind.
3. **Publish npm** waits on the `npm-publish` environment. Approve that one job. It publishes whatever versions are in `package.json` and not yet on the registry.

If publish fails, fix the workflow and re-run **Publish npm** on `main`. Do not bump versions again.

One-time npmjs.com check (each `@sometic/*` package, or org default): Trusted Publisher = GitHub, repo `aitistack/sometic`, workflow `release.yml`, environment **`npm-publish`**. Empty environment on npm while the workflow uses that environment produces `E404` on `PUT`.
