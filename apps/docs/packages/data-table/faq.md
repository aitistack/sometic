# Data table FAQ

## How do I install it?

```bash
pnpm add @sometic/data-table
```

For React UI: also use `@sometic/react` (`DataTable` from `@sometic/react/data`) and `@sometic/dom` resolve helpers. Peer: `@sometic/core`.

## Client or server mode?

Omit `fetchRows` for client mode (filter/sort/page in memory). Pass `fetchRows` (or `mode: "server"`) for remote pages. Server create throws if `fetchRows` is missing.

## How does selection work across pages?

`SelectionState` supports explicit `ids` or `allFiltered` with `excludedIds`. `selectAllPage` toggles the current page; `selectAllFiltered` can take an optional id list from the server.

## Can I sync sort/filters to the URL?

Yes. Use `syncDataTableToUrl`, `encodeDataTableSorting` / `decodeDataTableFilters`, and friends. You provide the URL read/write target; no router package is required.

## Is there virtualization?

`getVirtualItems` computes a window over a total count. You still render the slice. It does not ship a scrolling container.

## JS vs TypeScript?

Same runtime. Types ship as `.d.ts`. React examples use `DataTableColumn<TRow>` for column accessors.

## SSR safe?

No browser globals at import time. Create controllers and bind keyboard after hydration.

## Accessibility baseline?

DOM resolve emits grid/table roles, `aria-sort`, busy state, and keyboard helpers. Always provide `label` or `labelledBy`.

## Security?

Selection and filters are UX state. Enforce authorization and row visibility on the server, especially in server mode.

## Migrations / related packages?

Additive Phase 21 surface. Pair with `@sometic/query` for fetch caching and `@sometic/query-builder` via `toDataTableFilters`. See [comparison](./comparison) and [troubleshooting](./troubleshooting).
