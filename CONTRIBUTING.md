# Contributing

See the docs: **[Contributing](https://sometic.aitistack.com/guide/contributing)** (or `/guide/contributing` when running the docs site locally).

Quick checklist:

1. Read [Architecture](https://sometic.aitistack.com/concepts/architecture) and [What’s included](https://sometic.aitistack.com/guide/whats-included)
2. Use pnpm and four-space indentation
3. Do not add comments in TypeScript implementation files
4. Add tests and docs (including FAQ/comparison for public modules)
5. Run `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm size && pnpm packages:validate`
6. Add a Changeset for publishable package changes (`pnpm changeset`)
7. Open a PR; CI and maintainer review are required before merge

Security-sensitive changes need explicit notes in the PR description. For vulnerabilities, see [SECURITY.md](./SECURITY.md).
