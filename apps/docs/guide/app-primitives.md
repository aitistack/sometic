# App primitives

Phase 22 ships seven framework-free engines for product behavior that sits above forms and HTTP: feature flags, app drafts, commands, undo/redo, conflict resolution, a durable offline mutation queue, and a richer permission controller. UI adapters stay thin; these packages own the rules.

## Catalog

| Package / API | Job | Start here |
| ------------- | --- | ---------- |
| `@sometic/feature-flags` | Evaluate flags (default → remote → override) | `createFeatureFlagController` |
| `@sometic/drafts` | Persist entity/document drafts | `createDraftController` |
| `@sometic/commands` | Register and execute named actions | `createCommandRegistry` |
| `@sometic/history` | Undo / redo stack for reversible edits | `createHistoryController` |
| `@sometic/conflict` | Open and resolve local vs remote records | `createConflictController` |
| `@sometic/offline-queue` | Durable mutation outbox | `createOfflineMutationQueue` |
| `@sometic/auth` | Resource-scoped grants on top of session claims | `createPermissionController` |

### When to use

- The same product rule must work in Vanilla, React, Vue, and tests without copying handlers
- You need disposable, SSR-safe controllers (no import-time `window` / storage)
- App shell or `createSometicApp` should optionally compose flags, drafts, commands, history, or offline queue later

### When not to use

- Form field restore only: use [`@sometic/forms` drafts](/forms/persistence)
- Searchable command UI: use the [command palette](/components/command-palette); it may consume `@sometic/commands` later
- Session-only mutation retries that die with the tab: `createSessionMutationQueue` on [App Shell](/guide/app-shell)
- Hosted flag SDKs, CRDT sync, or compliance audit stores: keep those products; these packages are portable clients

## Feature flags

```ts
import { createFeatureFlagController } from "@sometic/feature-flags";

const flags = createFeatureFlagController({
    flags: [{ key: "checkout.v2", defaultValue: false, defaultVariant: "control" }],
    remote: { "checkout.v2": { enabled: true, variant: "treatment" } },
});

if (flags.isEnabled("checkout.v2")) {
    renderCheckout(flags.getVariant("checkout.v2"));
}

flags.dispose();
```

Precedence is override, then remote, then definition default. See [FAQ](/packages/feature-flags/faq) and [comparison](/packages/feature-flags/comparison).

## App drafts

Entity drafts (notes, invoices, editors), not form field drafts.

```ts
import { createDraftController, createMemoryDraftStorage } from "@sometic/drafts";

let values = { title: "", body: "" };

const drafts = createDraftController({
    key: "note:draft",
    version: 1,
    storage: createMemoryDraftStorage(),
    getValues: () => values,
    setValues: (next) => {
        values = next;
    },
    omit: ["password"],
});

await drafts.load();
await drafts.save();
drafts.dispose();
```

See [FAQ](/packages/drafts/faq) and [comparison](/packages/drafts/comparison) (vs `@sometic/forms` drafts).

## Commands

```ts
import { createCommandRegistry } from "@sometic/commands";

const commands = createCommandRegistry();

commands.register({
    id: "document.save",
    label: "Save document",
    canExecute: (context) => context?.["dirty"] === true,
    execute: async (context) => saveDocument(context?.["id"]),
});

await commands.execute("document.save", { dirty: true, id: "doc-1" });
commands.dispose();
```

Registry only; no palette chrome. See [FAQ](/packages/commands/faq) and [comparison](/packages/commands/comparison).

## History (undo / redo)

```ts
import { createHistoryController } from "@sometic/history";

const history = createHistoryController({ maxDepth: 50 });
let title = "Untitled";

await history.execute({
    label: "Rename",
    execute: () => {
        const previous = title;
        title = "Invoice";
        return previous;
    },
    undo: (previous) => {
        title = previous;
    },
});

await history.undo();
await history.redo();
history.dispose();
```

See [FAQ](/packages/history/faq) and [comparison](/packages/history/comparison).

## Conflict

```ts
import { createConflictController, lastWriteWinsStrategy } from "@sometic/conflict";

const conflicts = createConflictController({
    defaultStrategyId: lastWriteWinsStrategy.id,
});

const opened = conflicts.open({
    key: "invoice:42",
    local: { total: 100 },
    remote: { total: 120 },
    localUpdatedAt: 1_000,
    remoteUpdatedAt: 2_000,
});

const resolved = conflicts.resolve(opened.id);
conflicts.dispose();
```

Built-ins: last-write-wins, client-wins, server-wins. See [FAQ](/packages/conflict/faq) and [comparison](/packages/conflict/comparison).

## Offline queue

Durable outbox. Distinct from the session mutation queue on App Shell.

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

await queue.enqueue({ key: "invoice.update", variables: { id: "42" } });
await queue.flush();
queue.dispose();
```

See [FAQ](/packages/offline-queue/faq) and [comparison](/packages/offline-queue/comparison).

## Permissions

```ts
import {
    createAuth,
    createMemoryAuthStorage,
    createPermissionController,
    createTestAuthProvider,
} from "@sometic/auth";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

const permissions = createPermissionController({ auth });

permissions.grant({ permission: "docs:edit", resource: "doc-1" });
permissions.can({ permission: "docs:edit", resource: "doc-1" });

permissions.dispose();
auth.dispose();
```

Client checks are UX only. APIs must enforce authorization on the server. Session claim policies still live on `@sometic/auth`; this controller adds dynamic grants and subscribe.

## Related

- [What's included](/guide/whats-included)
- [App Shell](/guide/app-shell)
- [Authentication](/authentication/)
- [Forms persistence](/forms/persistence)
