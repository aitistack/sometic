# Activity FAQ

## How do I install it?

```bash
pnpm add @sometic/activity
```

Peer: `@sometic/core`. No React/CE adapter in this beta; call `createActivityController` from your UI.

## What does an entry look like?

Required: `type`, `message`. Optional: `id`, `createdAt`, `actorId`, `resourceId`, `meta`. Empty `type` throws `activity_invalid_entry`.

## How does pagination work?

`getPage({ cursor, limit, filter })` returns `{ items, nextCursor, hasMore }` newest-first. Pass `nextCursor` back for the next page. Do not invent cursors.

## Can I filter?

Yes: `type` / `types`, `actorId`, `resourceId`, `since`, `until` on `getEntries`, `count`, and `getPage`.

## Retention?

Set `maxEntries` to drop oldest records when the cap is exceeded. Without it, the in-memory list grows until you `clear` or dispose.

## Controlled feed?

The engine owns entries. Seed with `entries`, then `append` / `appendMany`. Mirror into `@sometic/store` if you need cross-route state.

## SSR?

Import is safe. Prefer one controller per client session; do not share mutable controllers across requests.

## Accessibility?

You render the list. Use semantic lists and announce critical appends if the feed is visible.

## Security / compliance?

Client activity is UX. Persist and authorize audit events on the server.

## Related?

[Comparison](./comparison) · [Component](/components/activity) · [Notifications](/packages/notifications/faq).
