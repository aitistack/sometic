# Data & business FAQ

Cross-cutting answers for Phase 21 surfaces. Each component page also has a module FAQ. Live docs keep FAQs under `/components/` (package trees under `apps/docs/packages/` are source notes and are not published routes).

## What ships in the data family?

| Surface | Package / entry | React / Vue | DOM resolve |
| ------- | --------------- | ----------- | ----------- |
| Data table | `@sometic/data-table` | `@sometic/*/data` `DataTable` | `@sometic/dom/data-table` |
| Query builder | `@sometic/query-builder` | Engine only (same import) | Engine only |
| Upload | `@sometic/upload` | `UploadDropzone`, `UploadList` | `@sometic/dom/upload` |
| Schema form | `@sometic/forms/schema-form` | `SchemaForm` | Forms engine + your fields |
| Permission matrix | Engine in `@sometic/dom` | `PermissionMatrix` | `@sometic/dom/permission-matrix` |
| Activity | `@sometic/activity` | Engine + your list | Own markup |
| Approval | `@sometic/approval` | Engine + your stepper | Own markup |
| Notifications | `@sometic/notifications` | `NotificationCenter` | `@sometic/dom/notification-center` |
| Status (empty / error / offline / conflict) | `@sometic/dom/status` | Resolve helpers | `@sometic/dom/status` |

Custom elements are **not shipped** for these data surfaces in this beta.

## Install

```bash
pnpm add @sometic/data-table @sometic/query-builder @sometic/upload @sometic/activity @sometic/approval @sometic/notifications
```

React UI also needs `@sometic/react` (import from `@sometic/react/data`) and usually `@sometic/dom`. Schema form: `@sometic/forms` plus the `schema-form` subpath. Peer: `@sometic/core`.

## Data table vs Query vs Query builder?

| Need | Use |
| ---- | --- |
| Sort, page, select rows | [Data table](/components/data-table) |
| Nested filter AST, serialize, bridge to table filters | [Query builder](/components/query-builder) |
| Cached server reads, invalidation, mutations | [Query](/utilities/query) |

Do not put table selection or filter AST into `@sometic/query`. Do not use Query builder as a cache.

## How do I connect Query builder to Data table?

Call `toDataTableFilters(builder.getValue())` and pass the result through `setFilters` (or controlled `filters`). Disabled rules are skipped unless you pass `includeDisabled: true`.

## Client vs server table mode?

Omit `fetchRows` for in-memory filter/sort/page. Pass `fetchRows` (or `mode: "server"`) for remote pages. Server create throws if `fetchRows` is missing. Pair server mode with [Query](/utilities/query) when you need shared cache and auth-bound clear.

## Data table troubleshooting

**Table stays empty in server mode.** Confirm `fetchRows` resolves `{ rows, total }` and that `load()` ran (React calls it when `fetchRows` is set; Vanilla must call `table.load()`). Check `getState().error` and abort races: a newer request cancels the previous one.

**Sort clicks do nothing.** Column needs `sortable: true`. Controlled `sorting` without `onSortingChange` snaps back. Verify header button wiring to `toggleSort`.

**Page select-all skips rows.** Those rows are disabled via `isRowDisabled`, or you are in `allFiltered` mode with exclusions. Inspect `getPageSelectionState()` and `getSelectedIds()`.

**URL sync fights the controller.** Decode once on boot into defaults, then write on `on*Change`. Do not set controlled props from the URL on every history tick without updating local state.

**Keyboard focus feels stuck.** Ensure cells use the resolve `tabindex` pattern and move focus via `getDataTableKeyboardAction`. Do not put `tabindex="0"` on every cell.

## Upload transport?

`createHttpUploadTransport` posts `FormData` through `fetch`. For S3 PUT, XHR byte progress, or tus, implement `UploadTransport.upload(file, { signal, onProgress })`. See ADR-0019 in `docs/decisions/` and the upload troubleshooting section below.

## Upload troubleshooting

**Files never start.** Check `autoStart`. Call `start` or ensure the dropzone path calls `addFiles`. Verify the transport `upload` resolves and does not hang without `onProgress`.

**Accept rejects valid files.** Normalize MIME vs extension rules. Prefer extension rules when `file.type` is empty. Mirror rules on the hidden input `accept` attribute.

**Progress stuck at 0% then 100%.** `fetch` cannot report request upload progress. Use an XHR (or other) transport that calls `onProgress` with real ratios.

**Cancel does nothing.** Call `controller.cancel(id)` and ensure the transport respects `signal`. UI should move to `canceled`.

**`upload_fetch_unavailable`.** Pass `fetchImpl` into `createHttpUploadTransport` for tests or non-browser runtimes.

**Memory growth.** Dispose controllers on route change. Bound concurrency. Avoid retaining File blobs after success if you only need the returned URL.

**Rejected files look silent.** Rejected files still appear as `error` items; render `item.error.message`.

**Same file cannot be picked twice.** Clear the file input `value` after change (React/Vue adapters already do).

## Schema form vs Form engine?

Schema form maps field descriptors to values and validation for admin-style forms. Prefer the full [Forms](/forms/) engine when you need complex dirty tracking, field arrays, or server error maps beyond schema fields.

## Permission matrix vs Auth?

The matrix is UX for editing allow/deny cells. Authorization still lives on the server and in `@sometic/auth` session claims. Never treat matrix state as a security boundary.

## Activity vs Notifications vs Approval?

| Need | Use |
| ---- | --- |
| Append-only audit / timeline events | [Activity](/components/activity) |
| Inbox items with read / dismiss | [Notification center](/components/notification-center) |
| Multi-step require-all / require-any gates | [Approval](/components/approval) |

## Status family?

[Status](/components/status) resolve helpers cover empty, error, offline, and conflict cards. Short pages: [Empty](/components/empty-state), [Error](/components/error-state), [Offline](/components/offline-state), [Conflict](/components/conflict-state).

## Are there custom elements?

No `sometic-data-table`, `sometic-upload`, or similar in this beta. Use React/Vue `@sometic/*/data`, DOM controllers, or engines directly.

## SSR?

Engines avoid browser globals at import time. Create controllers and bind DOM after hydration (`useEffect` / `onMounted` / Vanilla after mount).

## Playground?

`pnpm playground:vanilla` → http://127.0.0.1:5190 sections `#data-table`, `#query-builder`, `#upload`, `#schema-form`, `#permissions`, `#activity`, `#approval`, `#notifications`, `#status`.

## Related

- [Data comparison](/components/data-comparison)
- [Data table](/components/data-table)
- [Query builder](/components/query-builder)
- [Upload](/components/upload)
- [Schema form](/components/schema-form)
- [Status](/components/status)
