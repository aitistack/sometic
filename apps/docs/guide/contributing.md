# Contributing

Sometic is open source under MIT. Contributions are welcome via GitHub pull requests. Pushes to `main` are restricted; changes land through PRs with required checks and approval.

## Requirements

- Node.js `>=20.18.0`
- pnpm `10.14.0` (see the repository root `packageManager` field)

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

Local quality gate:

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm size && pnpm packages:validate
```

## Before you start

1. Read [Architecture](/concepts/architecture) and [What’s included](/guide/whats-included)
2. Prefer a focused PR (one concern) over a large mixed change
3. Match existing package boundaries and dependency direction (adapters → features → foundation)

## How to contribute

1. Fork the repository (or branch, if you have write access)
2. Create a branch from `main`
3. Implement with tests and docs (FAQ/comparison for public modules)
4. Add playground coverage for new interactive / browser-visible surfaces
5. Run the local quality gate above
6. Add a Changeset for publishable package changes: `pnpm changeset`
7. Open a pull request and wait for CI + maintainer review

## What we look for

| Do                                      | Avoid                              |
| --------------------------------------- | ---------------------------------- |
| Four-space indentation                  | Tabs or two-space indent           |
| Production TypeScript                   | Placeholders or mock-as-production |
| Docs with the change                    | Undocumented public APIs           |
| Stable issue `code`s for validation     | Schema-library lock-in in cores    |
| Security notes on sensitive PRs         | Public issues for unfixed vulns    |
| Playground demos for new interactive UI | Docs-only interactive features     |

## Architecture for contributors

Public architecture lives under [Concepts](/concepts/architecture) and the [API package index](/api/packages). Decisions that affect consumers are documented on those pages and in release notes. Keep dependency direction one-way: framework adapters never leak into foundation packages, and cores must not import React/Vue/etc.

## Bugs and features

Use GitHub issue templates (**Bug report** / **Feature request**). Include package versions, framework, and reproduction steps.

## Security

Do not file public issues for exploitable vulnerabilities. See [Security](/legal/security) and the repo `SECURITY.md`.

## License

By contributing, you agree your work is provided under the project MIT license (see [Terms](/legal/terms) and [License](/legal/license)).

## Related

- [Agents](/guide/agents) (Copy Prompt / LLM docs index)
- [Beta maturity](/releases/beta)
- [Troubleshooting](/guide/troubleshooting)
