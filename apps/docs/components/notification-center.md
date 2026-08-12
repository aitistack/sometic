# Notification center

Inbox behavior: `@sometic/notifications` owns the item store (push, read and unread, dismiss, priority, filters, day or source grouping, `maxItems` trimming) and `@sometic/dom/notification-center` adds open state plus the region and item view models. This is the persistent bell-and-panel inbox, not the transient queue in [Toast](/components/toast). React and Vue ship `NotificationCenter`.

::: tip System standout: inbox, not toast
Use this for persistent unread items. Ephemeral feedback stays on [Toast](/components/toast). Push delivery stays in your backend; feed items into the controller.
:::

<PreviewNotificationCenter />

## Usage

::: code-group

```jsx [JS]
import { NotificationCenter } from "@sometic/react/data";
import { createNotificationsController } from "@sometic/notifications";

const notifications = createNotificationsController({
    maxItems: 50,
    items: [{ title: "Notification 1", source: "billing" }],
});

export function Example() {
    return (
        <NotificationCenter
            notifications={notifications}
            label="Notifications"
            groupBy="source"
            emptyLabel="You are all caught up"
            onOpenChange={(open) => console.log(open)}
        >
            {(center) => (
                <button type="button" onClick={() => center.markAllRead()}>
                    Mark all read ({center.getUnreadCount()})
                </button>
            )}
        </NotificationCenter>
    );
}
```

```tsx [TS]
import { NotificationCenter, type NotificationCenterController } from "@sometic/react/data";
import { createNotificationsController } from "@sometic/notifications";

const notifications = createNotificationsController({
    maxItems: 50,
    items: [{ title: "Notification 1", source: "billing" }],
});

export function Example(): JSX.Element {
    return (
        <NotificationCenter
            notifications={notifications}
            label="Notifications"
            groupBy="source"
            emptyLabel="You are all caught up"
            onOpenChange={(open: boolean) => console.log(open)}
        >
            {(center: NotificationCenterController) => (
                <button type="button" onClick={() => center.markAllRead()}>
                    Mark all read ({center.getUnreadCount()})
                </button>
            )}
        </NotificationCenter>
    );
}
```

```html [Vanilla]
<button type="button" id="bell" aria-expanded="false">Notifications</button>
<div id="center"></div>

<script type="module">
    import { createNotificationCenterController } from "@sometic/dom/notification-center";

    const host = document.querySelector("#center");
    const bell = document.querySelector("#bell");

    const center = createNotificationCenterController({
        defaultOpen: false,
        groupBy: "day",
        onOpenChange: (open) => {
            bell.setAttribute("aria-expanded", String(open));
            render();
        },
    });

    center.notifications.push({ title: "Notification 1", source: "inbox" });

    const applyAttributes = (element, attributes) => {
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    };

    function render() {
        const view = center.resolve({ label: "Notifications" });
        host.replaceChildren();
        host.removeAttribute("hidden");
        applyAttributes(host, view.attributes);

        const list = document.createElement("ul");
        applyAttributes(list, view.listAttributes);

        for (const item of center.getItems()) {
            const itemView = center.resolveItem(item.id);
            const entry = document.createElement("li");
            applyAttributes(entry, itemView.attributes);

            const read = document.createElement("button");
            read.type = "button";
            read.textContent = item.title;
            read.addEventListener("click", () => center.markRead(item.id));

            const dismiss = document.createElement("button");
            applyAttributes(dismiss, itemView.dismissAttributes);
            dismiss.textContent = "Dismiss";
            dismiss.addEventListener("click", () => center.dismiss(item.id));

            entry.append(read, dismiss);
            list.append(entry);
        }

        host.append(list);
    }

    bell.addEventListener("click", () => center.toggle());
    center.subscribe(render);
    render();
</script>
```

:::

> Custom element not shipped for data surfaces in this beta; use the DOM controller or the React and Vue components.

Custom element **not shipped** for Notification center. Vanilla uses `@sometic/dom/notification-center` (which re-exports `createNotificationsController` from `@sometic/notifications`). React ships `NotificationCenter` from `@sometic/react/data`, Vue the same name from `@sometic/vue/data`.

## How it works

1. **Store (`createNotificationsController`)**: `push` and `pushMany` create items with an id, `createdAt`, `read: false`, and `priority: "normal"` unless you supply them. Items are always returned newest first (ties broken by insertion order), and `maxItems` trims the oldest beyond the cap.
2. **Filters and groups**: `getItems({ unreadOnly, source, priority })` filters without mutating, and `groupBy("day" | "source")` returns `{ key, items }` buckets. Day keys are ISO dates (`2026-08-12`); missing sources group under `unknown`.
3. **Center (`createNotificationCenterController`)**: adds controllable open state (`open` / `defaultOpen` / `onOpenChange`), forwards `markRead`, `markAllRead`, and `dismiss`, exposes `getUnreadCount()` and `getGroups()`, and either wraps a store you pass in or creates its own.
4. **Resolve**: the region gets `role="region"`, `data-state="open" | "closed"`, `data-unread`, `data-empty`, `aria-label`, and `hidden` when closed. The list bag adds `role="list"`, `aria-live="polite"`, and `aria-relevant="additions"`. Items get `data-state="read" | "unread"`, `data-priority`, `data-source`, an assertive `aria-live` for high priority, and a labeled dismiss button (`Dismiss <title>`).
5. **Ownership**: a center that created its own store disposes it; a center given a store leaves it alone, so one app-wide inbox can back a header bell and a full page at once.
6. **Adapters**: React and Vue subscribe to the store, render the region, list, item buttons, and empty row, and dispose on unmount.

## Anatomy

| Part         | `data-slot`    | Role / notes                                                    |
| ------------ | -------------- | --------------------------------------------------------------- |
| Region       | `root`         | `role="region"`, `data-unread`, `hidden` when closed            |
| List         | `list`         | `role="list"`, polite live region, `data-count`                 |
| Item         | `item`         | `role="listitem"`, `data-state`, `data-priority`, `data-source` |
| Read trigger | `read-trigger` | Default item button that marks the item read                    |
| Dismiss      | `dismiss`      | Button with `aria-label="Dismiss <title>"`                      |
| Empty        | `empty`        | Rendered with `emptyLabel` when there are no items              |
| Trigger      | -              | App-owned bell button; keep its `aria-expanded` in sync         |

## Props / attributes

### React `NotificationCenterProps`

Extends `HTMLAttributes<HTMLDivElement>` minus `children`.

| Prop            | Type                                                  | Default              | Description                                         |
| --------------- | ----------------------------------------------------- | -------------------- | --------------------------------------------------- |
| `notifications` | `NotificationsController`                             | created internally   | Share one store across surfaces                     |
| `open`          | `boolean`                                             | -                    | Controlled open state                               |
| `defaultOpen`   | `boolean`                                             | `true`               | Uncontrolled initial open state                     |
| `onOpenChange`  | `(open: boolean) => void`                             | -                    | Open state changes                                  |
| `groupBy`       | `"day" \| "source"`                                   | `"day"`              | Grouping used by `getGroups()`                      |
| `label`         | `string`                                              | `"Notifications"`    | `aria-label` on the region                          |
| `emptyLabel`    | `string`                                              | `"No notifications"` | Empty row text                                      |
| `renderItem`    | `(item: NotificationItem) => ReactNode`               | title button         | Custom item body                                    |
| `children`      | `(center: NotificationCenterController) => ReactNode` | -                    | Render prop above the list (toolbar, mark all read) |
| Native attrs    | remaining div HTML attrs                              | -                    | Forwarded to the region                             |

### `NotificationItem`

`{ id, title, body, source, href, createdAt, read, priority }` where `body`, `source`, and `href` are `string | null`, `createdAt` is epoch milliseconds, and `priority` is `"low" | "normal" | "high"`.

### `createNotificationsController` options

| Option       | Type                                  | Default    | Description                                   |
| ------------ | ------------------------------------- | ---------- | --------------------------------------------- |
| `items`      | `NotificationInput[]`                 | `[]`       | Seed items, same shape minus generated fields |
| `maxItems`   | `number`                              | -          | Keeps the newest N, trims the rest            |
| `now`        | `() => number`                        | `Date.now` | Injectable clock for tests                    |
| `onChange`   | `(items: NotificationItem[]) => void` | -          | Any store change                              |
| `onAnnounce` | `(item: NotificationItem) => void`    | -          | Fires for each new unread item                |

Store methods: `getItems`, `getItem`, `getUnreadCount`, `push`, `pushMany`, `markRead`, `markUnread`, `markAllRead`, `dismiss`, `dismissAll`, `groupBy`, `subscribe`, `dispose`.

Center methods: `notifications`, `isOpen`, `setOpen`, `toggle`, `getItems`, `getUnreadCount`, `getGroups`, `markRead`, `markAllRead`, `dismiss`, `subscribe`, `resolve`, `resolveItem`, `dispose`.

### Vue

`NotificationCenter` from `@sometic/vue/data`. Props: `notifications`, `defaultOpen` (default `true`), `groupBy`, `label`, `emptyLabel`. Emits `openChange`.

```vue
<script setup lang="ts">
import { NotificationCenter } from "@sometic/vue/data";
import { createNotificationsController } from "@sometic/notifications";

const notifications = createNotificationsController({ maxItems: 50 });
notifications.push({ title: "Notification 1", source: "billing" });
</script>

<template>
    <NotificationCenter :notifications="notifications" label="Notifications" group-by="source" />
</template>
```

### Custom element

**CE not shipped.** Use the Vanilla controller, React, or Vue.

## Events / callbacks

| Surface        | Event                 | Payload                                   |
| -------------- | --------------------- | ----------------------------------------- |
| React          | `onOpenChange`        | `boolean`                                 |
| Vue            | `openChange`          | `boolean`                                 |
| Custom element | -                     | -                                         |
| Center         | `onOpenChange`        | `boolean`                                 |
| Center         | `subscribe(listener)` | `readonly NotificationItem[]`             |
| Store          | `onChange`            | `NotificationItem[]`                      |
| Store          | `onAnnounce`          | `NotificationItem`, new unread items only |

## Controlled vs uncontrolled

Open state follows the usual Sometic contract: pass `open` plus `onOpenChange` for controlled panels (route-driven inboxes, a popover you already manage), or `defaultOpen` for local state. Note the defaults differ by surface: the React and Vue components default to `defaultOpen: true` (an always-visible panel), while `createNotificationCenterController` defaults to `false` (a bell you open).

Item state is never controlled by props: the store is the source of truth so a websocket push and a click on "mark all read" cannot disagree. Own the store yourself (`createNotificationsController`) when several surfaces must share one inbox, and treat `push`, `markRead`, and `dismiss` as your write API.

## Accessibility

- The region is labeled (`aria-label`, or `labelledBy` through resolve) and gets a real `hidden` attribute when closed, so closed content leaves the accessibility tree instead of lingering.
- The list is a polite live region with `aria-relevant="additions"`, so arriving notifications are announced without interrupting the current task.
- High priority items add `aria-live="assertive"` on the item, which is the right level for outages or failed payments and the wrong level for routine noise. Use it sparingly.
- Dismiss buttons carry `aria-label="Dismiss <title>"`, so a row of identical icon buttons is still distinguishable.
- `data-state="read" | "unread"` is exposed for CSS, but unread status must also be conveyed in text or an icon with a name, not by color or a dot alone.
- Keep your bell trigger `aria-expanded` in sync with `isOpen()` and give the unread count an accessible name such as `3 unread notifications`.
- If you render the panel as an overlay, compose [Popover](/components/popover) or [Dialog](/components/dialog) for focus management; the center itself does not trap focus.

## Styling

Unstyled. Target `[data-slot="root"][data-state="open"]`, `[data-slot="item"][data-state="unread"]`, `[data-priority="high"]`, `[data-source="billing"]`, `[data-slot="list"][data-count="0"]`, and `[data-slot="empty"]`. Resolve accepts the shared styling contract (`unstyled`, `classes`, `styles`, `cssVariables`), so a design system can theme the region without wrapping the component.

## Edge cases

- **Empty title** throws `notifications_invalid_item`. Titles are the accessible name of the row, so a blank one is a bug, not a state.
- **Duplicate ids**: supply your own `id` to make a server-pushed notification idempotent. The store does not deduplicate for you, so push with a stable id and dismiss the old one when replacing.
- **`maxItems` trimming** keeps the newest items, including unread ones, so a flood can push older unread items out. Choose a cap that fits your retention story, or page from the server.
- **Sorting** is by `createdAt` descending, then insertion order. Backdated items (`createdAt` in the past) appear in place rather than at the top.
- **Grouping by source** puts `null` sources under the `unknown` key. Day keys are ISO dates in UTC, so a user just past midnight locally may see yesterday's key. Format group headings with the user's locale rather than printing the key.
- **`markRead` on an unknown id** is a no-op; the same is true for `dismiss`, which keeps optimistic UI safe.
- **After `dispose`** every mutating method throws `notifications_disposed`, and `subscribe` returns a no-op unsubscribe. Guard websocket handlers that outlive the component.
- **Shared store lifecycle**: a store you create is yours to dispose. The center only disposes the store it created itself.
- **Closed panel** still tracks items and unread counts; only rendering is hidden, so the bell badge keeps working.
- **SSR**: no browser globals at import time. Pass `now` for deterministic timestamps in snapshot tests and server rendering.

## Performance notes

Each read (`getItems`, `groupBy`) sorts and copies, so snapshot once per render instead of calling it per item. `subscribe` fans out a fresh array on every change; batch bursts with `pushMany` rather than a loop of `push` calls, which emits once instead of N times. `maxItems` bounds memory. For inboxes with hundreds of rows, page or virtualize in your UI: neither the store nor the resolve helpers virtualize. The store depends only on `@sometic/core` and holds no timers.

## When to use / When not

**Use** for a persistent inbox: a bell with an unread badge, a notifications page, activity digests grouped by day or source, and websocket-fed alerts that must survive navigation.

**Do not use** for transient confirmations ([Toast](/components/toast)), for a single inline message ([Alert](/components/alert)), or as an audit trail. Immutable history belongs in [Activity](/components/activity). Push and email delivery stay in your backend or vendor SDKs; feed items into `@sometic/notifications`.

## FAQ

**Toast or notification center?** Toast is transient and auto-dismissing, tied to one action. The center is durable: items persist until read or dismissed, carry priority and source, and are counted. Many apps push to both from the same event.

**Where is persistence?** Not included. The store is memory only. Hydrate it from your API on load (`items` or `pushMany`) and send `markRead` and `dismiss` to the server, which keeps multi-device state correct.

**How do I share one inbox between a bell and a page?** Create the store once with `createNotificationsController`, pass it as `notifications` to every surface. Each surface keeps its own open state, and only the store owner disposes it.

**How do I wire a websocket?** Call `push` (or `pushMany` for a batch) from the socket handler. Unread items trigger `onAnnounce`, which is the hook for a live region or a sound.

**Does it deduplicate?** No. Pass a stable `id` derived from the server event so a reconnect and replay does not double up.

**How do I show relative times?** Store gives you `createdAt` in milliseconds. Format it with `Intl.RelativeTimeFormat`. The engine deliberately does not ship date formatting.

**Can I group by week or by unread first?** `groupBy` supports `day` and `source`. For anything else read `getItems()` and group yourself; the items are plain objects.

**Why is the React panel open by default?** Because the component renders an inline panel in most layouts. Pass `defaultOpen={false}` (or use the controller directly) for a bell-triggered panel.

**Is there a `sometic-notification-center` element?** No. Custom elements are not shipped for data surfaces in this beta.

## Related links

- [Toast](/components/toast)
- [Alert](/components/alert)
- [Activity](/components/activity)
- [Popover](/components/popover)
- [Beta maturity](/releases/beta)
