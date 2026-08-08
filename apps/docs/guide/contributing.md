# Contributing

Sometic is open source under MIT. Contributions are welcome via GitHub pull requests.

## Before you start

1. Read [Architecture](/concepts/architecture) and [What’s included](/guide/whats-included)
2. Prefer a focused PR (one concern) over a large mixed change
3. Match existing package boundaries and dependency direction (adapters → features → foundation)

## How to contribute

1. Fork the repository (or branch, if you have write access)
2. Create a branch from `main`
3. Implement with tests and docs (FAQ/comparison for public modules)
4. Run the local gate: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm size && pnpm packages:validate`
5. Add a Changeset for publishable package changes: `pnpm changeset`
6. Open a pull request and wait for CI + maintainer review

Pushes to `main` are restricted. Changes land through PRs with required checks and approval.

## What we look for

| Do | Avoid |
| -- | ----- |
| Four-space indentation | Tabs or two-space indent |
| Production TypeScript | Placeholders or mock-as-production |
| Docs with the change | Undocumented public APIs |
| Stable issue `code`s for validation | Schema-library lock-in in cores |
| Security notes on sensitive PRs | Public issues for unfixed vulns |
| Playground demos for new interactive UI | Docs-only interactive features |

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
