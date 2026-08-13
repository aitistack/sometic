# `@sometic/offline-queue`

Durable offline mutation outbox for Sometic: enqueue failed or deferred writes, persist them, flush when the network returns, and optionally open conflicts after max attempts.

`createOfflineMutationQueue` is the durable counterpart to a session-only mutation queue. Jobs survive reloads through injectable storage. Memory storage is included for tests; production apps plug in IndexedDB or another adapter. Epoch awareness can drop stale jobs after logout or workspace switches.

Why it exists: optimistic UI is easy until a write fails offline and must retry without duplicating work or leaking jobs across sessions. This package owns the outbox so HTTP and auth layers stay focused.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Optional conflict opening uses [`@sometic/conflict`](https://www.npmjs.com/package/@sometic/conflict).

Docs: [introduction](https://sometic.dev/guide/introduction) and [https://sometic.dev](https://sometic.dev).

## Install

```bash
pnpm add @sometic/offline-queue
```

```bash
npm install @sometic/offline-queue
```

```bash
yarn add @sometic/offline-queue
```

## Usage

```ts
import {
    createMemoryOfflineQueueStorage,
    createOfflineMutationQueue,
} from "@sometic/offline-queue";

const queue = createOfflineMutationQueue({
    storage: createMemoryOfflineQueueStorage(),
    transport: {
        send: async (job) => {
            await api.save(job.variables);
        },
    },
    getEpoch: () => sessionEpoch,
    maxAttempts: 5,
});

await queue.enqueue({
    key: "invoice.update",
    variables: { id: "42", total: 120 },
});

window.addEventListener("online", () => {
    void queue.flush();
});

queue.dispose();
```

Wire conflicts when retries are exhausted:

```ts
import { createConflictController } from "@sometic/conflict";

const conflict = createConflictController();
const queue = createOfflineMutationQueue({
    storage: createMemoryOfflineQueueStorage(),
    transport: { send },
    conflict,
    maxAttempts: 3,
});
```

## API

- `createOfflineMutationQueue({ storage, transport, getEpoch?, dropOnEpochChange?, maxAttempts?, conflict?, now?, onChange? })`.
- `createMemoryOfflineQueueStorage(seed?)`.
- `enqueue(input)`, `peek()`, `flush()`, `retry(id)`, `cancel(id)`, `dropStale()`, `size()`.
- `subscribe(listener)`, `dispose()`, `disposed`.

Blank keys, missing jobs, concurrent flush, max attempts, and calls after `dispose()` throw typed errors (`OFFLINE_QUEUE_*`). `size()` counts pending and failed jobs only.

## When not to use

Skip it for in-memory retries that can die with the tab; a session queue is enough there. Prefer a full sync engine when you need pull/push replication, cursor watermarks, or server-authoritative merge. This package is an outbox for mutations you already know how to send.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [https://sometic.dev](https://sometic.dev)

## License

MIT
