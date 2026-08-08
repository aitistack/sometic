# Sometic Packages

> One behavior model for UI, forms, auth, HTTP, and document head across every JavaScript stack. Your styling system.

**Sometic** is portable application behavior (`@sometic`): shared controllers, thin adapters for React, Vue, and Web Components. By [AitiStack](https://portfolio.aitistack.com).

Documentation: [https://sometic.aitistack.com](https://sometic.aitistack.com)

## Requirements

- Node.js `>=20.18.0`
- pnpm `10.14.0` (see `packageManager` field)

## Setup

```bash
pnpm install
pnpm build
pnpm test
pnpm docs:dev
pnpm playground:vanilla
```

## Install (consumers)

```bash
pnpm add @sometic/react @sometic/dom
```

Also: `npm install`, `yarn add`, `bun add` with the same package names. Prefer subpath imports (`@sometic/react/button`, `@sometic/http`, `@sometic/head`).

## Workspace layout

- `packages/` — publishable libraries
- `apps/docs` — consumer VitePress documentation
- `apps/playground-vanilla` — interactive demos
- `tooling/` — shared TypeScript, build, test, and release helpers
- `docs/architecture` · `docs/decisions` — public architecture and ADRs

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [https://sometic.aitistack.com/guide/contributing](https://sometic.aitistack.com/guide/contributing).
