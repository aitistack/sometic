# Notifications FAQ

## How do I install it?

```bash
pnpm add @sometic/notifications
```

For the center UI: `@sometic/dom/notification-center` and React `NotificationCenter` from `@sometic/react/data`. Peer: `@sometic/core`.

## Push requirements?

`title` is required (non-empty). Optional: `body`, `source`, `href`, `priority`, `read`, `createdAt`, `id`.

## Read / dismiss APIs?

`markRead`, `markUnread`, `markAllRead`, `dismiss`, `dismissAll`. Unread count via `getUnreadCount()`.

## Grouping?

`groupBy("day" | "source")` on the engine, or pass `groupBy` into the notification center controller / React props.

## Announce hook?

`onAnnounce` fires when you want a live region / toast companion for new items (especially high priority).

## Center open state?

`createNotificationCenterController` / React `NotificationCenter` support controlled `open` or `defaultOpen`.

## maxItems?

Optional cap trims oldest notifications when exceeded.

## Toast vs center?

[Toast](/components/toast) is ephemeral. Notifications are an inbox. You can push to both.

## SSR?

Import safe. Create controllers on the client; dispose center and notifications when the shell unmounts.

## Security?

Treat `href` as untrusted if it comes from a server payload (open-redirect). Authorize notification fetches server-side.
