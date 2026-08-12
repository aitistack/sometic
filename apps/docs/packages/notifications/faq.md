# notifications FAQ

## Install / peers

```bash
pnpm add @sometic/notifications
```

Depends on `@sometic/core`. See the package README for optional peers.

## JS / TS

TypeScript-first with emitted `.d.ts`. Same runtime for JS consumers.

## Controlled state

Engines support controlled and uncontrolled patterns via `@sometic/core` controllable state where applicable.

## SSR

No browser globals at import time. Create controllers after hydration when DOM is required.

## Accessibility

DOM adapters expose roles and keyboard hooks. Compose with your markup.

## Size

Gzip budgets live in each package `package.json` `size-limit` field.

## Security

Enforce authorization and uploads on the server. Client matrices and queues are UX state.

## Migrations

Additive Phase 21 packages. `@sometic/query` remains the server-state cache.
