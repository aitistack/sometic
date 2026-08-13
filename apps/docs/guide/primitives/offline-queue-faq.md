# Offline queue FAQ

## How do I install it?

```bash
pnpm add @sometic/offline-queue
```

Depends on `@sometic/core`. Optional peer usage of `@sometic/conflict` when you pass a `conflict` controller.

## How is this different from `createSessionMutationQueue`?

App Shell's `createSessionMutationQueue` is **in-memory** and drops on session epoch bump. `@sometic/offline-queue` is a **durable outbox** behind injectable storage (`createMemoryOfflineQueueStorage` for tests; plug IndexedDB or similar for production). Use the session queue for tab-lifetime retries; use this package when jobs must survive reloads.

## When do jobs flush?

Call `flush()` yourself (for example on `online` or after reconnect). The package does not attach global listeners at import time.

## Epoch policy?

`getEpoch` + `dropOnEpochChange` (default `true`) drop jobs from a previous auth/workspace epoch on hydrate and flush.

## Max attempts and conflicts?

Failed sends increment `attempts`. When `conflict` is set and attempts reach `maxAttempts`, the queue opens a conflict record with local variables and `remote: null`.

## Concurrent flush?

A second `flush` while one is in progress throws `OFFLINE_QUEUE_FLUSH_IN_PROGRESS`.

## Related?

[Comparison](/guide/primitives/offline-queue-comparison) · [App primitives](/guide/app-primitives) · [App Shell](/guide/app-shell) · [Conflict FAQ](/guide/primitives/conflict-faq)
