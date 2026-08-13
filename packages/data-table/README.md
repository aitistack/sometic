# `@sometic/data-table`

Framework-free data table and grid **state** for Sometic: columns, sorting, filtering, pagination, row selection across pages, column visibility, URL sync, and virtual window math. It renders nothing, so it works the same in Vanilla JS, React, Vue, Web Components, and on the server.

`createDataTableController` runs in two modes. In `client` mode it filters, sorts, and pages an in-memory array. In `server` mode it calls your `fetchRows` function with the current sorting, filters, and pagination, cancels the previous request through an `AbortSignal`, and ignores stale responses so fast clicking cannot leave the table showing older data.

Why it exists: server-state caching belongs in [`@sometic/query`](https://www.npmjs.com/package/@sometic/query), filter editing belongs in [`@sometic/query-builder`](https://www.npmjs.com/package/@sometic/query-builder), and rendering belongs in your components. Table state is the piece that every framework otherwise reimplements: page math, "select all filtered" with per-row exclusions, sticky selection while paging, and virtual scrolling offsets.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only. No DOM access at import time, so it is safe in SSR and Node.

Docs: [introduction](https://sometic.dev/guide/introduction) and [https://sometic.dev](https://sometic.dev).

## Install

```bash
pnpm add @sometic/data-table
```

```bash
npm install @sometic/data-table
```

```bash
yarn add @sometic/data-table
```

## Usage

Client mode with sorting, paging, and selection:

```ts
import { createDataTableController } from "@sometic/data-table";

const table = createDataTableController({
    columns: [
        { id: "name", header: "Name" },
        { id: "age", header: "Age" },
    ],
    getRowId: (row) => row.id,
    rows: people,
    defaultPagination: { pageIndex: 0, pageSize: 20 },
});

table.toggleSort("age");
table.setFilters([{ id: "name", value: "ada" }]);
table.selectAllPage();

const rows = table.getPageRows();
const selected = table.getSelectedIds();
```

Server mode with cancellation:

```ts
const table = createDataTableController({
    columns,
    getRowId: (row) => row.id,
    mode: "server",
    fetchRows: async ({ sorting, pagination, filters, signal }) => {
        const response = await fetch(buildUrl({ sorting, pagination, filters }), { signal });
        const payload = await response.json();
        return { rows: payload.items, total: payload.total, ids: payload.allIds };
    },
});

await table.load();
```

Keep table state in the address bar:

```ts
import { syncDataTableToUrl } from "@sometic/data-table";

const sync = syncDataTableToUrl({
    controller: table,
    getSearchParams: () => new URLSearchParams(location.search),
    setSearchParams: (params) => history.replaceState(null, "", `?${params.toString()}`),
});
```

Virtualize long lists:

```ts
import { getVirtualItems } from "@sometic/data-table";

const window = getVirtualItems({
    count: table.getState().total,
    scrollTop: viewport.scrollTop,
    viewportHeight: viewport.clientHeight,
    rowHeight: 36,
    overscan: 4,
});
```

## API

- `createDataTableController(options)`: `getState`, `subscribe`, `setRows`, `setSorting`, `setPagination`, `setSelection`, `setFilters`, `setColumnVisibility`, `setColumnHidden`, `toggleSort`, `setPageIndex`, `setPageSize`, `toggleRowSelected`, `selectAllPage`, `selectAllFiltered`, `clearSelection`, `isRowSelected`, `getSelectedIds`, `getPageSelectionState`, `getVisibleColumns`, `getPageRows`, `getPageRowIds`, `getFilteredRows`, `load`, `dispose`.
- `syncDataTableToUrl(options)` returns a `Disposable` and reads or writes `page`, `pageSize`, `sort`, and `filters`.
- `getVirtualItems(options)` returns `{ items, totalSize, startIndex, endIndex }` for fixed `rowHeight` or variable `estimateSize`.

Sorting, pagination, selection, filters, and column visibility each accept a controlled `value` plus an `onChange` callback, or an uncontrolled `default*` value.

## When not to use

Skip it when you render a short static list that needs no sorting, paging, or selection. Prefer a full grid product when you need cell editing engines, pivoting, or spreadsheet formulas. This package deliberately owns state only, so column resizing chrome, drag handles, and styling live in your components or in `@sometic/dom`.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [Query cache](https://sometic.dev/utilities/query)

## License

MIT
