# `@sometic/activity`

Activity and audit feed state for Sometic: append entries, filter by actor, resource, type, and time range, then page forward with stable cursors.

`createActivityController` keeps an append only log. Entries are returned newest first, and entries that share a timestamp keep their insertion order, so a burst of writes in the same millisecond never shuffles on re-read. Backdated entries sort by their own `createdAt`, which makes backfilled history behave correctly.

Why it exists: an audit trail looks trivial until you need cursor pagination that survives new inserts, filters that compose, and copies that callers cannot mutate. This package owns that state so every framework renders the same feed.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only. No browser globals at import time, so it is safe in SSR, workers, and Node.

Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [https://sometic.aitistack.com](https://sometic.aitistack.com).

## Install

```bash
pnpm add @sometic/activity
```

```bash
npm install @sometic/activity
```

```bash
yarn add @sometic/activity
```

## Usage

```ts
import { createActivityController } from "@sometic/activity";

const activity = createActivityController({ pageSize: 25, maxEntries: 500 });

activity.append({
    type: "invoice.updated",
    message: "Changed the invoice total",
    actorId: "user-1",
    resourceId: "invoice-42",
    meta: { field: "total" },
});

const page = activity.getPage({ filter: { resourceId: "invoice-42" } });
const next = activity.getPage({ cursor: page.nextCursor });
```

Subscribe to changes and clean up:

```ts
const stop = activity.subscribe((entries) => render(entries));

stop();
activity.dispose();
```

## API

- `createActivityController({ entries?, pageSize?, maxEntries?, now?, onChange? })`.
- `append(input)` and `appendMany(inputs)` commit once and return normalized entries. Optional fields become `null`, and `meta` is copied so later edits to your object cannot reach the log.
- `getEntries(filter?)`, `getEntry(id)`, `count(filter?)`.
- `getPage({ cursor?, limit?, filter? })` returns `{ items, nextCursor, hasMore }`. An unknown cursor throws a typed error with code `activity_invalid_cursor` instead of silently returning page one.
- `clear()`, `subscribe(listener)`, `dispose()`, `disposed`.
- Filters accept `type`, `types`, `actorId`, `resourceId`, `since`, and `until`.

Writes after `dispose()` throw `activity_disposed`, which surfaces leaked controllers in tests rather than letting them accumulate entries nobody reads.

## When not to use

Skip it when the feed is a plain server rendered list with no client filtering or paging. Prefer a real audit service when you need tamper evidence, retention policies, or compliance exports. This package holds the client side view of a log; it does not persist anything.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Notifications](https://www.npmjs.com/package/@sometic/notifications)

## License

MIT
