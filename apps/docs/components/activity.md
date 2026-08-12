# Activity

Append-only activity and audit log state from `@sometic/activity`. Entries are typed, timestamped, and attributed to an actor and a resource; reads are filtered and cursor-paged. The engine is deliberately headless: no markup, no dates formatting, no storage. It gives you a correct, testable feed model that behaves the same in React, Vue, and Vanilla.

::: tip System standout: append-only timeline
Activity is an audit-style feed (Event N in the preview), not an inbox. Use [Notification center](/components/notification-center) for read/dismiss workflows.
:::

<PreviewActivity />

## Usage

::: code-group

```js [JS]
import { createActivityController } from "@sometic/activity";

const activity = createActivityController({ pageSize: 10, maxEntries: 500 });

activity.append({
    type: "update",
    message: "Event 1",
    actorId: "demo",
    resourceId: "post-42",
    meta: { field: "title" },
});

const firstPage = activity.getPage({ limit: 10, filter: { resourceId: "post-42" } });
const unsubscribe = activity.subscribe((entries) => console.log(entries.length));
```

```ts [TS]
import {
    createActivityController,
    type ActivityController,
    type ActivityEntry,
    type ActivityPage,
} from "@sometic/activity";

const activity: ActivityController = createActivityController({
    pageSize: 10,
    maxEntries: 500,
});

activity.append({
    type: "update",
    message: "Event 1",
    actorId: "demo",
    resourceId: "post-42",
});

const page: ActivityPage = activity.getPage({ limit: 10 });
const entries: ActivityEntry[] = page.items;
```

```html [Vanilla]
<ul id="activity-list"></ul>
<button type="button" id="activity-add">Add event</button>
<button type="button" id="activity-more">Load more</button>

<script type="module">
    import { createActivityController } from "@sometic/activity";

    const list = document.querySelector("#activity-list");
    const activity = createActivityController({ pageSize: 10 });
    let cursor = null;

    const renderPage = (reset) => {
        if (reset) {
            list.replaceChildren();
            cursor = null;
        }
        const page = activity.getPage({ cursor, limit: 10 });
        for (const entry of page.items) {
            const item = document.createElement("li");
            item.dataset.activityType = entry.type;
            item.textContent = `${entry.type}: ${entry.message}`;
            const time = document.createElement("time");
            time.dateTime = new Date(entry.createdAt).toISOString();
            time.textContent = new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(entry.createdAt);
            item.append(time);
            list.append(item);
        }
        cursor = page.nextCursor;
        document.querySelector("#activity-more").disabled = !page.hasMore;
    };

    document.querySelector("#activity-add").addEventListener("click", () => {
        activity.append({
            type: "update",
            message: `Event ${activity.count() + 1}`,
            actorId: "demo",
        });
    });
    document.querySelector("#activity-more").addEventListener("click", () => renderPage(false));

    activity.subscribe(() => renderPage(true));
    renderPage(true);
</script>
```

:::

> Custom element not shipped for data surfaces in this beta; use the engine directly.

Activity is **engine only**. There is no `Activity` component in `@sometic/react/data` or `@sometic/vue/data` and no custom element: feed rows differ too much between products (avatars, diffs, icons, grouping) to freeze markup. Import `@sometic/activity` from any framework and render your own list, which is what the preview and playground do.

## How it works

1. **Append-only writes**: `append` and `appendMany` are the only ways in. There is no update or delete for a single entry, because an audit trail that can be edited is not an audit trail. `clear()` exists for local sessions and tests.
2. **Entry shape**: each entry gets an id (yours or a generated `activity_*`), `createdAt` from the injectable `now`, and normalized nulls for `actorId`, `resourceId`, and `meta`. `meta` is shallow-copied on write and on read, so callers cannot mutate stored state.
3. **Ordering**: newest first by `createdAt`, ties broken by insertion sequence. Backdated entries land in the right place instead of jumping to the top.
4. **Filtering**: `ActivityFilter` supports `type`, `types`, `actorId`, `resourceId`, `since`, and `until`, combined with AND. `getEntries(filter)` and `count(filter)` share the same predicate as `getPage`.
5. **Cursor paging**: `getPage({ cursor, limit, filter })` returns `{ items, nextCursor, hasMore }` where the cursor is the id of the last item on the page. The cursor is resolved inside the filtered list, so a filter must stay stable while paging through it.
6. **Trimming**: `maxEntries` keeps the newest N after every write, which bounds memory for long-lived sessions.
7. **Notifications**: `subscribe` and `onChange` receive the full sorted snapshot after every write or `clear`.

## Anatomy

| Part      | Shape                    | Notes                                                          |
| --------- | ------------------------ | -------------------------------------------------------------- |
| Entry     | `ActivityEntry`          | `id`, `type`, `message`, `createdAt`, `actorId`, `resourceId`, `meta` |
| Filter    | `ActivityFilter`         | `type`, `types`, `actorId`, `resourceId`, `since`, `until`      |
| Page      | `ActivityPage`           | `items`, `nextCursor`, `hasMore`                                |
| Feed row  | your markup              | Suggested: `<li>` with a `<time datetime>` and a typed data attribute |

Because no markup ships, a useful convention is to mirror Sometic data attributes yourself: `data-slot="item"` and `data-activity-type="update"` on each row so one CSS file styles every framework.

## Props / attributes

### `CreateActivityControllerOptions`

| Option       | Type                                | Default    | Description                                  |
| ------------ | ----------------------------------- | ---------- | -------------------------------------------- |
| `entries`    | `ActivityEntryInput[]`              | `[]`       | Seed entries, usually hydrated from your API |
| `pageSize`   | `number`                            | `20`       | Default `limit` for `getPage`                |
| `maxEntries` | `number`                            | unlimited  | Keeps the newest N in memory                 |
| `now`        | `() => number`                      | `Date.now` | Injectable clock for tests and SSR           |
| `onChange`   | `(entries: ActivityEntry[]) => void` | -         | Fires with the full snapshot after each write |

### `ActivityEntryInput`

| Field        | Type                        | Description                                            |
| ------------ | --------------------------- | ------------------------------------------------------ |
| `type`       | `string`                    | **Required.** Your event vocabulary (`create`, `update`, `delete`, `login`) |
| `message`    | `string`                    | **Required.** Human-readable summary                    |
| `id`         | `string`                    | Stable id for server-sourced entries                    |
| `createdAt`  | `number`                    | Epoch milliseconds, defaults to `now()`                 |
| `actorId`    | `string`                    | Who did it                                              |
| `resourceId` | `string`                    | What it happened to                                     |
| `meta`       | `Record<string, unknown>`   | Structured extras (diffs, ip, request id)               |

### Controller API

| Member                     | Description                                                   |
| -------------------------- | -------------------------------------------------------------- |
| `append(input)`            | Adds one entry, returns the stored entry                        |
| `appendMany(inputs)`       | Adds a batch and emits once                                     |
| `getEntries(filter?)`      | Sorted snapshot, newest first                                   |
| `getEntry(id)`             | One entry or `undefined`                                        |
| `count(filter?)`           | Number of matching entries                                      |
| `getPage(options?)`        | `{ items, nextCursor, hasMore }` with `cursor`, `limit`, `filter` |
| `clear()`                  | Removes everything and emits                                    |
| `subscribe(listener)`      | Snapshot on every change, returns an unsubscribe                |
| `dispose()` / `disposed`   | Releases listeners, blocks further writes                       |

### React and Vue

No component ships. Create the controller in a `useRef` or `useState` initializer (React) or `setup` (Vue), subscribe for rerenders, and call `dispose()` on unmount. All exports come from `@sometic/activity`, so the code is identical across frameworks.

### Custom element

**CE not shipped.** Compose the engine in your own component.

## Events / callbacks

| Surface        | Event                 | Payload             |
| -------------- | --------------------- | ------------------- |
| Engine         | `onChange`            | `ActivityEntry[]`   |
| Engine         | `subscribe(listener)` | `ActivityEntry[]`   |
| React / Vue    | your own props        | -                   |
| Custom element | -                     | -                   |

`append`, `appendMany`, and `clear` each emit exactly once, so a batch of twenty entries costs one render.

## Controlled vs uncontrolled

The log is append-only state, so there is no controlled `entries` prop: a controlled audit trail would let a stale render erase history. The controller is the source of truth. Hydrate it from the server through `entries` or `appendMany`, mirror it into your store from `subscribe` if you need it there, and treat `getPage` as your read model. For a controlled UI concern such as "which filter is active", keep the filter in your own state and pass it into every read.

## Accessibility

The engine emits no DOM, so these are the composition rules the demos follow:

- Render the feed as a real list (`<ul>` and `<li>`, or `role="list"`) so assistive tech announces item counts and boundaries.
- Wrap timestamps in `<time datetime="...">` with an ISO value and human text formatted through `Intl.DateTimeFormat` or `Intl.RelativeTimeFormat`. Never ship a raw epoch number as visible text.
- Live feeds that append while the user reads should use a polite live region, or better, a "3 new events" button that the user activates. Assertive announcements on a busy log are hostile.
- Keep `message` self-contained: it is what a screen reader reads, so `Alex updated the title` beats `updated` next to an icon.
- Convey `type` with text or a labeled icon, not with color alone.
- "Load more" must be a real button whose focus stays put after loading, and the newly appended rows should not steal focus.

## Styling

No styles, no classes, no attributes ship. Style your own rows. `type` is the natural styling hook: put it on a data attribute (`data-activity-type`) and target it, which keeps the mapping declarative and framework independent.

## Edge cases

- **Empty `type`** throws `activity_invalid_entry`. Type is the vocabulary of the log, so an empty one is rejected at the write.
- **Empty `message`** is allowed; the engine does not police copy, but a blank row is unreadable, so keep it filled.
- **Unknown cursor** throws `activity_invalid_cursor` with the cursor in `details`. This happens when the filter changed between pages, or when `maxEntries` trimmed the entry the cursor pointed at. Restart paging from `cursor: null`.
- **Filter changes while paging**: cursors are positions inside the filtered list. Reset the cursor whenever the filter changes.
- **`maxEntries` trimming** removes the oldest entries, which can invalidate a cursor held by a scrolled page. Prefer server paging for long histories and keep the client cap generous.
- **Backdated entries**: passing `createdAt` inserts in date order, so a bulk import of history lands correctly instead of at the top.
- **Duplicate ids** are not rejected. Pass server ids when you hydrate so a refetch replaces rather than duplicates, and dedupe before `appendMany` if your source can replay.
- **`meta` is shallow-copied**: nested objects are shared. Do not mutate nested structures after appending; build a new object instead.
- **After `dispose`** writes throw `activity_disposed`, reads still work on the last snapshot, and `subscribe` returns a no-op. Guard socket handlers that outlive the view.
- **`limit` below 1** is clamped to 1, and a missing `limit` uses `pageSize`.
- **SSR**: no browser globals at import time. Pass `now` for deterministic timestamps when rendering on the server or in tests.

## Performance notes

Every read sorts and copies the filtered list, so it is O(n log n) per call: snapshot once per render rather than calling `getEntries` inside a loop, and prefer `count(filter)` over `getEntries(filter).length`. `appendMany` emits once, so import batches in one call. `maxEntries` is the memory bound for long sessions. There are no timers, listeners, or observers, so `dispose()` is only about blocking writes. Long feeds should virtualize in your UI or page from the server: the engine holds everything you append in memory.

## When to use / When not

**Use** for audit trails, resource history panels, "recent activity" feeds, and admin timelines that need typed events, actor and resource attribution, filtering, and cursor paging with the same behavior in every framework.

**Do not use** as an alerting inbox with read and unread state ([Notification center](/components/notification-center)), as durable storage (this is in-memory: the server owns the record of truth), or as an analytics pipeline. Product analytics events should go to your analytics SDK.

## FAQ

**Is this an audit log I can trust?** It is the client-side model of one. Real audit records must be written server side where they cannot be forged. Use this to display them and to buffer optimistic entries.

**Why append-only?** Because history you can edit is not history. Corrections are new entries (`type: "revert"`), which is also how server-side audit systems work.

**How do I paginate from a server instead?** Fetch a page, `appendMany` it, and page your API by its own cursor. Or skip the controller for infinite server feeds and use [Query](/utilities/query) with your own list state; use this engine when the client owns filtering and paging.

**Why did my cursor throw?** The entry it pointed at is gone from the filtered list, usually because the filter changed or `maxEntries` trimmed it. Reset to `cursor: null` and reload the first page.

**How do I group by day?** Read `getEntries()` and bucket by a formatted date. Day grouping ships in [Notification center](/components/notification-center) because inboxes need it; the activity engine stays unopinionated.

**How do I show diffs?** Put the structured change in `meta` (for example `{ field: "title", from, to }`) and render it in your row. `message` stays the human summary.

**Can two controllers share entries?** No shared store is built in. Create one controller per feed, or hold a single controller in your app store and read from it everywhere.

**How do I test time-dependent output?** Pass `now: () => 1700000000000` and supply your own ids to get stable snapshots.

**Is there a `sometic-activity` element?** No. Custom elements are not shipped for data surfaces in this beta.

## Related links

- [Notification center](/components/notification-center)
- [Approval](/components/approval)
- [Permission matrix](/components/permission-matrix)
- [Query](/utilities/query)
- [Beta maturity](/releases/beta)

The vanilla playground demos the engine in section `#activity` with an add button that appends `Event N`.
