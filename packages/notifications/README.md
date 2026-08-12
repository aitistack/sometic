# `@sometic/notifications`

Notification center inbox state for Sometic: push items, mark read or unread, dismiss, group by day or source, filter by unread state and priority, and announce new items for assistive technology.

`createNotificationsController` keeps the inbox newest first, with insertion order preserved for items that share a timestamp so a burst of arrivals does not reshuffle the list. `getItems` returns copies, so a component cannot mark something read by mutating a rendered object. `onAnnounce` fires only for unread arrivals, which is what a polite live region should read out.

Why it exists: toasts and inboxes are different problems. [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) owns toast and overlay behavior; this package owns the persistent inbox: unread counts, grouping, dismissal, and caps.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only. No browser globals at import time, so it is safe in SSR and Node.

Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [https://sometic.aitistack.com](https://sometic.aitistack.com).

## Install

```bash
pnpm add @sometic/notifications
```

```bash
npm install @sometic/notifications
```

```bash
yarn add @sometic/notifications
```

## Usage

```ts
import { createNotificationsController } from "@sometic/notifications";

const inbox = createNotificationsController({
    maxItems: 200,
    onAnnounce: (item) => liveRegion.announce(item.title),
});

inbox.push({
    title: "Invoice paid",
    body: "Invoice 42 was paid",
    source: "billing",
    href: "/invoices/42",
    priority: "high",
});

inbox.getUnreadCount();
inbox.markRead(id);
inbox.dismiss(id);
```

Group a panel by day:

```ts
for (const group of inbox.groupBy("day")) {
    renderHeading(group.key);
    renderItems(group.items);
}
```

Absorb a burst from a socket in one commit:

```ts
socket.addEventListener("message", (event) => {
    inbox.pushMany(JSON.parse(event.data));
});
```

Subscribe and clean up:

```ts
const stop = inbox.subscribe((items) => render(items));

stop();
inbox.dispose();
```

## API

- `createNotificationsController({ items?, maxItems?, now?, onChange?, onAnnounce? })`.
- `push(input)` and `pushMany(inputs)` notify subscribers once per call, so a burst of one hundred items causes one render, not one hundred.
- `getItems(filter?)`, `getItem(id)`, `getUnreadCount()`.
- `markRead(id)`, `markUnread(id)`, `markAllRead()`, `dismiss(id)`, `dismissAll()`. These stay quiet when nothing actually changes.
- `groupBy("day" | "source", filter?)` returns `{ key, items }` groups in newest first order. Items without a source group under `unknown`.
- `subscribe(listener)`, `dispose()`, `disposed`.
- Filters accept `unreadOnly`, `source`, and `priority`. Priorities are `low`, `normal`, and `high`.

`maxItems` trims the oldest entries, so a long lived session cannot grow the inbox without bound. Writes after `dispose()` throw `notifications_disposed`.

## When not to use

Skip it for transient toasts: use the toast controller in `@sometic/dom` instead. Prefer a push service when you need delivery guarantees, device tokens, or cross device read state. This package holds the client view of an inbox whose source of truth stays on your server.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Activity log](https://www.npmjs.com/package/@sometic/activity)

## License

MIT
