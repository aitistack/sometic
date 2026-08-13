---
description: >-
    Feature flags, entity drafts, commands, undo/redo, conflict resolution,
    durable offline mutation queue, and permission grants for Sometic apps.
---

# App primitives

Portable engines for product behavior that sits above forms and HTTP: feature flags, entity drafts, command registration, undo/redo, conflict resolution, a durable offline mutation queue, and resource-scoped permission grants. Each package is framework-free, disposable, and safe to import on the server. React, Vue, and Vanilla call the same APIs; UI adapters stay thin.

## Catalog

| Package / API | What it does | Start here |
| ------------- | ------------ | ---------- |
| `@sometic/feature-flags` | Evaluate on/off and experiment variants with override → remote → default precedence | `createFeatureFlagController` |
| `@sometic/drafts` | Persist entity or document drafts (notes, invoices, editors) with migrate and sanitize | `createDraftController` |
| `@sometic/commands` | Register named actions once and run them from menus, hotkeys, tests, or APIs | `createCommandRegistry` |
| `@sometic/history` | Undo / redo stack for reversible local edits with depth caps | `createHistoryController` |
| `@sometic/conflict` | Record local vs remote disagreements and resolve with strategies | `createConflictController` |
| `@sometic/offline-queue` | Durable mutation outbox that survives reload and respects auth epoch | `createOfflineMutationQueue` |
| `@sometic/auth` | Dynamic resource-scoped grants on top of session claims | `createPermissionController` |

### When to use

- The same product rule must work in Vanilla, React, Vue, and tests without copying handlers
- You need disposable, SSR-safe controllers (no browser globals at import time)
- App Shell / `createSometicApp` should optionally compose flags, drafts, commands, history, or offline queue

### When not to use

- Form field restore only: use [`@sometic/forms` drafts](/forms/persistence)
- Searchable command UI chrome: use the [command palette](/components/command-palette); wire it to `@sometic/commands` when you want one execute path
- Ephemeral in-tab retries that die with the session: `createSessionMutationQueue` on [App Shell](/guide/app-shell)
- Hosted flag SDKs, CRDT multiplayer sync, or compliance audit stores: keep those products; these packages are portable clients

## Compose with App Shell

Pass optional controllers into `createSometicApp` / `createAppShell` so epoch and dispose stay one graph. Create controllers first, then pass them in; wire `getEpoch` to the shell after create, or use a shared epoch getter.

```ts
import { createSometicApp } from "@sometic/app-shell";
import { createFeatureFlagController } from "@sometic/feature-flags";
import { createCommandRegistry } from "@sometic/commands";
import { createHistoryController } from "@sometic/history";
import {
    createMemoryOfflineQueueStorage,
    createOfflineMutationQueue,
} from "@sometic/offline-queue";

let epoch = 0;

const flags = createFeatureFlagController({
    flags: [{ key: "checkout.v2", defaultValue: false }],
});
const commands = createCommandRegistry();
const history = createHistoryController();
const offlineQueue = createOfflineMutationQueue({
    storage: createMemoryOfflineQueueStorage(),
    transport: { send: async () => undefined },
    getEpoch: () => epoch,
});

const app = createSometicApp({
    auth,
    flags,
    commands,
    history,
    offlineQueue,
});

epoch = app.getEpoch();
app.onEpochChange((next) => {
    epoch = next;
});
```

Shell clears configured entity drafts and can drop the offline queue on auth epoch. Controllers you pass in are disposed with `app.dispose()` when the shell owns that path. Details: [App Shell](/guide/app-shell).

## Feature flags

Decide which product paths are on, and which experiment arm a user is in, without hardcoding booleans in every adapter. You own delivery (fetch remote payloads and call `setRemote`); Sometic owns evaluation, overrides, snapshots, and subscribe.

Install: `pnpm add @sometic/feature-flags` (depends on `@sometic/core`).

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

### FAQ

- **Evaluation order?** Override, then remote, then the flag definition default. `getSnapshot(key)` reports `source` as `"override" | "remote" | "default"`.
- **Does it fetch from a vendor?** No. Supply definitions plus optional `remote` / `overrides`. Wire your own fetch and call `setRemote`.
- **Variants only booleans?** No. Variants may be `string | boolean | number | null`. Use `isEnabled` for on/off and `getVariant` for experiment arms.
- **SSR-safe?** Yes. No browser globals at import time. Controllers are explicit and disposable.
- **Unknown keys?** `isEnabled`, `getVariant`, and `getSnapshot` throw typed `FEATURE_FLAG_*` errors.
- **Multi-instance?** One controller per app or workspace. There is no module singleton.

### Why this vs alternatives

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| `@sometic/feature-flags` | Shared evaluate/override API across stacks | No hosted targeting or analytics |
| LaunchDarkly / Flagsmith / Unleash | Targeting, rollouts, dashboards | Vendor SDK in every surface |
| Hardcoded env booleans | Tiny | No runtime override or shared snapshot |
| Custom store map | Fits existing state | You reimplement precedence, subscribe, dispose |

## App drafts

Persist free-form entity or document state (a note, invoice draft, editor document) with versioned records, optional migrate, and `omit` / `pick` / `sanitize` before write. This is not form-field restore; that stays in [`@sometic/forms` drafts](/forms/persistence).

Install: `pnpm add @sometic/drafts`.

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

### FAQ

- **vs forms drafts?** Entity/document storage here; field-level restore on form controllers in `@sometic/forms/drafts`.
- **Storage options?** Memory (tests/SSR), `createLocalStorageDraftStorage` (no import-time access), or any `getItem` / `setItem` / `removeItem` adapter.
- **Schema changes?** Bump `version` and supply `migrate`. Without migrate, older records load as `null`.
- **Secrets?** Use `omit`, `pick`, or `sanitize` before persist.
- **Debounce?** `scheduleSave()` respects `debounceMs`; `save()` writes immediately.
- **SSR?** Import is safe. Construct localStorage-backed storage on the client after hydrate.

### Why this vs alternatives

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| `@sometic/drafts` | Versioned entity drafts, migrate/sanitize, injectable storage | Not multi-device sync |
| `@sometic/forms` drafts | Tied to form controllers | Wrong for free-form documents |
| Raw `localStorage` | Zero deps | No migrate, debounce, or dispose |
| CRDT / sync | Cross-device merge | Heavy; different job |

## Commands

Register each product action once (`document.save`, `invoice.send`) with `canExecute` gates, then run it from a button, menu, hotkey, or test. This is a registry/bus, not the searchable [command palette](/components/command-palette) UI.

Install: `pnpm add @sometic/commands`.

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

### FAQ

- **Is this the palette?** No. Palette is presentation. This package is `register` / `canExecute` / `execute` / `subscribe`.
- **Duplicate ids?** Throws `COMMAND_DUPLICATE`.
- **Guarding?** Put logic in `canExecute`; `execute` throws when the gate fails.
- **Undo metadata?** Optional `undo` on a definition is metadata only. The undo stack is `@sometic/history`.
- **Events?** `register`, `unregister`, `execute`, and `error` (errors emit then rethrow).

### Why this vs alternatives

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| `@sometic/commands` | One execute path across surfaces | No UI or ranking |
| Command palette | Filterable keyboard UX | Presentation only unless wired |
| Ad-hoc `onClick` | Fast for one button | Diverges across menu/hotkey/tests |
| Workflow / saga | Durable steps and retries | Heavy for simple actions |

## History (undo / redo)

Keep a local stack of reversible edits for canvases, documents, and settings. Each entry supplies `execute` and `undo` (optional custom `redo`). Depth is capped; undo and execute share one promise chain so concurrent calls cannot corrupt the stack.

Install: `pnpm add @sometic/history`.

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

### FAQ

- **Required fields?** `execute` and `undo`. Optional `id`, `label`, and `redo` (default redo re-runs `execute`).
- **Depth?** `maxDepth` defaults to 100; oldest entries drop.
- **Reentrancy?** Undo/execute/redo are serialized on an internal promise chain.
- **Checkpoints?** `checkpoint(label?)` marks a bulk-edit boundary.
- **Audit log?** No. Use `@sometic/activity` for append-only timelines.

### Why this vs alternatives

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| `@sometic/history` | Portable undo/redo, depth cap, exclusive chain | Local only; not multiplayer |
| `@sometic/activity` | Append-only audit | Not reversible |
| Editor / CRDT | Concurrent merge | Heavy; different sync model |
| Browser History API | Navigation URLs | Not document edit undo |

## Conflict

When local and remote values disagree (after an offline flush, multi-tab edit, or API merge), open a conflict record and resolve it with a strategy (last-write-wins, client-wins, server-wins, or your own). This package does not detect conflicts on the wire; you open them when you know both sides.

Install: `pnpm add @sometic/conflict`.

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

### FAQ

- **Built-ins?** `lww`, `client-wins`, `server-wins`. Register more with `registerStrategy`.
- **Does it detect network conflicts?** No. You call `open` when local and remote disagree.
- **Manual value?** `resolveWith(id, value)`. Strategy path: `resolve(id, strategyId?)`.
- **Already resolved?** `resolve` returns the existing record (idempotent).

### Why this vs alternatives

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| `@sometic/conflict` | Records + strategies + subscribe | Does not detect for you |
| Server-always-wins reload | Simple | Drops local work without a record |
| CRDT / OT | Character-level merge | Heavy for discrete document pairs |
| Status UI only | Badge for users | Still needs a resolution engine |

## Offline queue

A durable mutation outbox: enqueue writes while offline, persist them, then `flush` when the transport is available. Distinct from App Shell’s session mutation queue, which is in-memory and drops on auth epoch. Pair with conflict when max attempts are exhausted.

Install: `pnpm add @sometic/offline-queue` (optional peer `@sometic/conflict`).

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

### FAQ

- **vs session mutation queue?** This outbox is durable. Session queue is in-memory and drops on epoch.
- **When does flush run?** When you call `flush()`. Nothing listens at import time.
- **Epoch?** Pass `getEpoch`. `dropOnEpochChange` defaults to true.
- **Conflicts?** With a `conflict` controller and max attempts reached, a conflict opens (`remote: null`).
- **Concurrent flush?** Throws `OFFLINE_QUEUE_FLUSH_IN_PROGRESS`.

### Why this vs alternatives

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| `@sometic/offline-queue` | Durable outbox, epoch hooks, optional conflict | You supply transport + storage |
| Session mutation queue | Tiny; drops on epoch | Dies with the tab |
| Full sync engines | Pull/push, cursors, merge | Heavy; different product |
| HTTP-only retry | Simple one request | No durable multi-job outbox |

## Permissions

Add dynamic, resource-scoped grants on top of session claim policies already in `@sometic/auth`. Client checks are UX only; APIs must still enforce authorization on the server.

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

### FAQ

- **vs `requirePermission`?** Session claims stay on auth policies. This controller adds grant/revoke for specific resources and `subscribe`.
- **Server still required?** Yes. Treat `can` / `require` as UX gates only.
- **Empty permission strings?** Throw typed auth errors.

### Why this vs alternatives

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| `createPermissionController` | Resource-scoped grants + session claims | Not a full policy engine |
| Session claims only | Simple | No per-resource grants without refetch |
| External IAM SDK | Rich admin UX | Couples every adapter to that vendor |

## Related

- [What's included](/guide/whats-included)
- [App Shell](/guide/app-shell)
- [Authentication](/authentication/)
- [Forms persistence](/forms/persistence)
- [Command palette](/components/command-palette)
