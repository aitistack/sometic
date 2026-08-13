# Data table

Table and grid behavior over `@sometic/data-table`: sorting, filtering, pagination, bulk selection (including "all filtered" with exclusions), client or server rows, URL sync, and a pure virtual window helper. React and Vue ship a `DataTable` component; Vanilla composes `createDataTableController` with the `resolve*` view models from `@sometic/dom/data-table`.

::: tip System standout: all-filtered selection
`SelectionState` supports `allFiltered` plus `excludedIds`, so "select every matching row" stays a constant-size payload even when the server has tens of thousands of hits. Pair with server `fetchRows` and enforce visibility on the API.
:::

<PreviewDataTable />

## Features

The data table engine and adapters support:

- **Client and server modes**: filter, sort, and slice locally, or delegate paging to `fetchRows` with abort-safe reloads.
- **Multi-sort**: stack sort keys with `multiSort`; `toggleSort` cycles ascending, descending, then removed.
- **Filters**: `setFilters` / controlled `filters` with operators such as `contains` and `equals`.
- **Column visibility**: `setColumnHidden` and `columnVisibility` state hide columns without dropping their descriptors.
- **Page selection**: per-row checkboxes plus page select-all with indeterminate state.
- **All-filtered selection**: `selectAllFiltered` plus `excludedIds` for bulk actions without loading every row id.
- **Extended pagination**: First, Previous, page status, Next, Last, and a page-size select (5 / 8 / 10 / 25) in the React and Vue footers whenever `pagination` is true.
- **URL sync**: `syncDataTableToUrl` mirrors sorting, pagination, and filters into search params you own.
- **Virtual window helper**: `getVirtualItems` returns a pure scroll window for large lists.
- **Keyboard grid navigation**: `getDataTableKeyboardAction` drives roving cell focus and Space/Enter activation.

## Usage

::: code-group

```tsx [React]
import { DataTable, type DataTableColumn } from "@sometic/react/data";

type Member = { id: string; name: string; role: string; team: string };

const rows: Member[] = Array.from({ length: 48 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
    team: index % 3 === 0 ? "Platform" : index % 3 === 1 ? "Growth" : "Support",
}));

const columns: DataTableColumn<Member>[] = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "role", header: "Role", accessor: (row) => row.role, sortable: true },
    { id: "team", header: "Team", accessor: (row) => row.team, sortable: true },
];

export function Example(): JSX.Element {
    return (
        <DataTable<Member>
            label="Team members"
            columns={columns}
            rows={rows}
            getRowId={(row) => row.id}
            pageSize={8}
            multiSort
            toolbar={(table) => (
                <div data-slot="toolbar">
                    <button type="button" onClick={() => table.selectAllFiltered()}>
                        Select all filtered
                    </button>
                    <button type="button" onClick={() => table.clearSelection()}>
                        Clear selection
                    </button>
                </div>
            )}
            onSelectionChange={(selection) => console.log(selection)}
        />
    );
}
```

```vue [Vue]
<script setup>
import { DataTable } from "@sometic/vue/data";

const rows = Array.from({ length: 48 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
    team: index % 3 === 0 ? "Platform" : index % 3 === 1 ? "Growth" : "Support",
}));

const columns = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "role", header: "Role", accessor: (row) => row.role, sortable: true },
    { id: "team", header: "Team", accessor: (row) => row.team, sortable: true },
];
</script>

<template>
    <DataTable
        label="Team members"
        :columns="columns"
        :rows="rows"
        :get-row-id="(row) => row.id"
        :page-size="8"
        multi-sort
        @selection-change="(selection) => console.log(selection)"
    />
</template>
```

```js [Vanilla]
import {
    createDataTableController,
    resolveDataTable,
    resolveDataTableHeader,
    resolveDataTableRow,
    resolveDataTableCell,
    resolveDataTableCheckbox,
} from "@sometic/dom/data-table";

const host = document.querySelector("#table");

const rows = Array.from({ length: 48 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
    team: index % 3 === 0 ? "Platform" : index % 3 === 1 ? "Growth" : "Support",
}));

const table = createDataTableController({
    columns: [
        { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
        { id: "role", header: "Role", accessor: (row) => row.role, sortable: true },
        { id: "team", header: "Team", accessor: (row) => row.team, sortable: true },
    ],
    getRowId: (row) => row.id,
    rows,
    mode: "client",
    multiSort: true,
    defaultPagination: { pageIndex: 0, pageSize: 8 },
});

function applyAttributes(element, attributes) {
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
}

function render() {
    const state = table.getState();
    const pageRows = table.getPageRows();
    const columns = table.getVisibleColumns();
    const rootView = resolveDataTable({
        rowCount: pageRows.length,
        columnCount: columns.length + 1,
        mode: state.mode,
        busy: state.loading,
        selectionCount: table.getSelectedIds().length,
        label: "Team members",
    });

    host.replaceChildren();
    host.className = rootView.className;
    applyAttributes(host, rootView.attributes);

    const tableElement = document.createElement("table");
    const headRow = document.createElement("tr");

    const selectAllCell = document.createElement("th");
    const selectAll = document.createElement("input");
    const selectAllView = resolveDataTableCheckbox({
        scope: "page",
        pageSelection: table.getPageSelectionState(),
    });
    applyAttributes(selectAll, selectAllView.attributes);
    selectAll.indeterminate = selectAllView.indeterminate;
    selectAll.addEventListener("change", () => table.selectAllPage());
    selectAllCell.append(selectAll);
    headRow.append(selectAllCell);

    columns.forEach((column, columnIndex) => {
        const cell = document.createElement("th");
        const sort = state.sorting.find((entry) => entry.id === column.id);
        applyAttributes(
            cell,
            resolveDataTableHeader({
                columnId: column.id,
                sortable: column.sortable === true,
                sortDirection: sort ? sort.direction : null,
                columnIndex: columnIndex + 1,
            }).attributes,
        );
        cell.textContent = column.header ?? column.id;
        cell.addEventListener("click", () => table.toggleSort(column.id));
        headRow.append(cell);
    });

    const body = document.createElement("tbody");
    if (pageRows.length === 0) {
        const empty = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = columns.length + 1;
        cell.textContent = "No rows match the current filters.";
        empty.append(cell);
        body.append(empty);
    } else {
        pageRows.forEach((row, rowIndex) => {
            const tr = document.createElement("tr");
            applyAttributes(
                tr,
                resolveDataTableRow({
                    rowId: row.id,
                    rowIndex,
                    selected: table.isRowSelected(row.id),
                }).attributes,
            );

            const selectCell = document.createElement("td");
            const checkbox = document.createElement("input");
            applyAttributes(
                checkbox,
                resolveDataTableCheckbox({ checked: table.isRowSelected(row.id) }).attributes,
            );
            checkbox.addEventListener("change", () => table.toggleRowSelected(row.id));
            selectCell.append(checkbox);
            tr.append(selectCell);

            for (const column of columns) {
                const td = document.createElement("td");
                applyAttributes(td, resolveDataTableCell({ columnId: column.id }).attributes);
                td.textContent = String(column.accessor?.(row) ?? "");
                tr.append(td);
            }
            body.append(tr);
        });
    }

    const head = document.createElement("thead");
    head.append(headRow);
    tableElement.append(head, body);
    host.append(tableElement);

    const pager = document.createElement("div");
    pager.setAttribute("data-slot", "pagination");

    const first = document.createElement("button");
    first.type = "button";
    first.setAttribute("data-slot", "first-page");
    first.textContent = "First";
    first.disabled = state.pagination.pageIndex <= 0;
    first.addEventListener("click", () => table.setPageIndex(0));

    const prev = document.createElement("button");
    prev.type = "button";
    prev.setAttribute("data-slot", "previous-page");
    prev.textContent = "Prev";
    prev.disabled = state.pagination.pageIndex <= 0;
    prev.addEventListener("click", () => {
        table.setPageIndex(Math.max(0, state.pagination.pageIndex - 1));
    });

    const pageStatus = document.createElement("span");
    pageStatus.setAttribute("data-slot", "page-status");
    const pageCount = Math.max(1, state.pageCount);
    pageStatus.textContent = `Page ${state.pagination.pageIndex + 1} of ${pageCount}`;

    const next = document.createElement("button");
    next.type = "button";
    next.setAttribute("data-slot", "next-page");
    next.textContent = "Next";
    next.disabled = state.pagination.pageIndex >= pageCount - 1;
    next.addEventListener("click", () => {
        table.setPageIndex(Math.min(pageCount - 1, state.pagination.pageIndex + 1));
    });

    const last = document.createElement("button");
    last.type = "button";
    last.setAttribute("data-slot", "last-page");
    last.textContent = "Last";
    last.disabled = state.pagination.pageIndex >= pageCount - 1;
    last.addEventListener("click", () => table.setPageIndex(pageCount - 1));

    const pageSize = document.createElement("select");
    pageSize.setAttribute("data-slot", "page-size");
    for (const size of [5, 8, 10, 25]) {
        const option = document.createElement("option");
        option.value = String(size);
        option.textContent = String(size);
        pageSize.append(option);
    }
    pageSize.value = String(state.pagination.pageSize);
    pageSize.addEventListener("change", () => {
        const nextSize = Number(pageSize.value);
        table.setPageSize(Number.isFinite(nextSize) && nextSize > 0 ? nextSize : 8);
        table.setPageIndex(0);
    });

    pager.append(first, prev, pageStatus, next, last, pageSize);
    host.append(pager);
}

table.setFilters([
    { id: "name", value: "Person 1", operator: "contains" },
    { id: "role", value: "Admin", operator: "equals" },
]);
table.setColumnHidden("team", true);
table.selectAllFiltered();

const unsubscribe = table.subscribe(render);
render();
```

```html [Custom Elements (Web Components)]
<!-- CE not shipped for this surface. Use React, Vue, or @sometic/dom (Vanilla) above. -->
```

```html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
```

:::

> Custom element not shipped for data surfaces in this beta; use the DOM controller, React, or Vue.

Custom element **not shipped** for Data table. Vanilla uses `@sometic/dom/data-table`. React ships `DataTable` from `@sometic/react/data`, Vue ships `DataTable` from `@sometic/vue/data`.

## How it works

1. **Engine (`createDataTableController`)**: owns sorting, pagination, filters, column visibility, and selection as controllable state from `@sometic/core`. `mode` defaults to `"client"`, or `"server"` when you pass `fetchRows`. Client mode filters then sorts then slices the page; server mode calls `fetchRows` and trusts `rows` / `total` / optional `ids`.
2. **Rows pipeline (`@sometic/data-table`)**: `filterRows`, `sortRows`, `matchesFilterValue`, `compareValues`, and `readColumnValue` are exported pure functions. Filters resolve to `contains` for string values and `equals` otherwise unless you set `operator`.
3. **Resolve (`@sometic/dom/data-table`)**: `resolveDataTable` (`role="grid"`, `aria-rowcount` / `aria-colcount`, `data-mode`, `data-busy`), `resolveDataTableHeader` (`role="columnheader"`, `aria-sort`), `resolveDataTableRow` (`role="row"`, `aria-selected`, `data-state`), `resolveDataTableCell` (`role="gridcell"`, roving `tabindex`), `resolveDataTableCheckbox` (row or page scope, `aria-checked="mixed"` for partial pages).
4. **Keyboard (`getDataTableKeyboardAction`)**: arrows move one cell, PageUp / PageDown jump by `pageSize`, Home / End go to row edges (Ctrl or Cmd jumps to grid corners), Space returns `toggle`, Enter returns `activate`. RTL swaps the horizontal arrows.
5. **Adapters**: React and Vue create one controller per instance, subscribe for rerenders, push new `rows` through `setRows`, call `load()` when `fetchRows` changes, and dispose on unmount.
6. **Extras**: `syncDataTableToUrl` mirrors sorting, pagination, and filters into search params you own; `getVirtualItems` returns a pure window (`items`, `totalSize`, `startIndex`, `endIndex`) for large lists.

## Anatomy

| Part            | `data-slot`                                                                                       | Role / notes                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Wrapper (React) | `data-table`                                                                                      | Holds toolbar, table, pagination                                                                                  |
| Table root      | `root`                                                                                            | `role="grid"` (or `table` with `interactive: false`)                                                              |
| Header cell     | `header`                                                                                          | `role="columnheader"`, `aria-sort` when sortable                                                                  |
| Sort trigger    | `sort-trigger`                                                                                    | Button inside sortable React headers                                                                              |
| Row             | `row`                                                                                             | `data-row-id`, `data-state="selected" \| "unselected"`                                                            |
| Cell            | `cell`                                                                                            | `data-column`, `aria-colindex`, roving `tabindex`                                                                 |
| Select checkbox | `checkbox`                                                                                        | `data-scope="row" \| "page"`                                                                                      |
| Empty row       | `empty`                                                                                           | Rendered with `emptyLabel` when the page has no rows                                                              |
| Pagination      | `pagination`, `first-page`, `previous-page`, `page-status`, `next-page`, `last-page`, `page-size` | React and Vue footers when `pagination` is true; First/Last disabled on edges; page-size options are 5, 8, 10, 25 |

## Props / attributes

### React `DataTableProps<TRow>`

Extends `HTMLAttributes<HTMLTableElement>` minus `children`. Remaining native attrs are forwarded to the `<table>`.

| Prop                | Type                                                      | Default         | Description                                                                      |
| ------------------- | --------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------- |
| `columns`           | `readonly DataTableColumn<TRow>[]`                        | **required**    | Column descriptors                                                               |
| `getRowId`          | `(row: TRow, index: number) => string`                    | **required**    | Stable row identity for selection                                                |
| `rows`              | `readonly TRow[]`                                         | `[]`            | Client rows, synced through `setRows`                                            |
| `mode`              | `"client" \| "server"`                                    | inferred        | `"server"` when `fetchRows` is present                                           |
| `fetchRows`         | `(args: FetchRowsArgs) => Promise<FetchRowsResult<TRow>>` | -               | Server loader, receives an `AbortSignal`                                         |
| `pageSize`          | `number`                                                  | `10`            | Initial page size                                                                |
| `multiSort`         | `boolean`                                                 | `false`         | Allow more than one active sort                                                  |
| `selectable`        | `boolean`                                                 | `true`          | Adds the leading checkbox column                                                 |
| `label`             | `string`                                                  | -               | `aria-label` on the grid                                                         |
| `emptyLabel`        | `string`                                                  | `"No rows"`     | Empty row text                                                                   |
| `isRowDisabled`     | `(row: TRow) => boolean`                                  | -               | Marks rows disabled and blocks their checkbox                                    |
| `sorting`           | `SortingState`                                            | -               | Controlled sorting                                                               |
| `defaultSorting`    | `SortingState`                                            | `[]`            | Uncontrolled initial sorting                                                     |
| `onSortingChange`   | `(sorting: SortingState) => void`                         | -               | Sort changes                                                                     |
| `selection`         | `SelectionState`                                          | -               | Controlled selection                                                             |
| `defaultSelection`  | `SelectionState`                                          | empty           | Uncontrolled initial selection                                                   |
| `onSelectionChange` | `(selection: SelectionState) => void`                     | -               | Selection changes                                                                |
| `renderCell`        | `(row: TRow, column: DataTableColumn<TRow>) => ReactNode` | accessor string | Custom cell rendering                                                            |
| `toolbar`           | `(table: DataTableController<TRow>) => ReactNode`         | -               | Render prop above the table                                                      |
| `pagination`        | `boolean`                                                 | `true`          | Render the extended footer (First / Previous / status / Next / Last / page size) |
| Native attrs        | remaining table HTML attrs                                | -               | Forwarded to `<table>`                                                           |

### `DataTableColumn<TRow>`

| Field        | Type                                              | Description                                  |
| ------------ | ------------------------------------------------- | -------------------------------------------- |
| `id`         | `string`                                          | Column key, also the filter id               |
| `header`     | `string`                                          | Header text, falls back to `id`              |
| `accessor`   | `(row: TRow) => unknown`                          | Value reader, falls back to `row[id]`        |
| `sortable`   | `boolean`                                         | Enables `aria-sort` and click sorting        |
| `filterable` | `boolean`                                         | Marks the column filterable in your UI       |
| `hidden`     | `boolean`                                         | Hidden unless overridden by visibility state |
| `compare`    | `(left: unknown, right: unknown) => number`       | Custom sort comparator                       |
| `filterFn`   | `(row: TRow, filter: DataTableFilter) => boolean` | Custom filter predicate                      |

### Controller options (Vanilla)

`createDataTableController` adds engine-only options beyond the React props: `pagination` / `defaultPagination` / `onPaginationChange`, `filters` / `defaultFilters` / `onFiltersChange`, `columnVisibility` / `defaultColumnVisibility` / `onColumnVisibilityChange`, and `autoReload` (default `true`, refetches in server mode when sorting, pagination, or filters change).

Controller methods: `getState`, `subscribe`, `setRows`, `setSorting`, `setPagination`, `setSelection`, `setFilters`, `setColumnVisibility`, `setColumnHidden`, `toggleSort`, `setPageIndex`, `setPageSize`, `toggleRowSelected`, `selectAllPage`, `selectAllFiltered`, `clearSelection`, `isRowSelected`, `getSelectedIds`, `getPageSelectionState`, `getVisibleColumns`, `getPageRows`, `getPageRowIds`, `getFilteredRows`, `load`, `dispose`.

### Vue

`DataTable` from `@sometic/vue/data`. Props: `columns`, `rows`, `getRowId`, `mode`, `fetchRows`, `pageSize`, `multiSort`, `selectable`, `label`, `emptyLabel`, `pagination`, `defaultSorting`. Emits `sortingChange` and `selectionChange`.

```vue
<script setup lang="ts">
import { DataTable } from "@sometic/vue/data";

const rows = Array.from({ length: 48 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
    team: index % 3 === 0 ? "Platform" : index % 3 === 1 ? "Growth" : "Support",
}));
const columns = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "role", header: "Role", accessor: (row) => row.role, sortable: true },
    { id: "team", header: "Team", accessor: (row) => row.team, sortable: true },
];

function onSelectionChange(selection) {
    console.log(selection);
}
</script>

<template>
    <DataTable
        label="Team members"
        :columns="columns"
        :rows="rows"
        :get-row-id="(row) => row.id"
        :page-size="8"
        multi-sort
        @selection-change="onSelectionChange"
    />
</template>
```

### Custom element

**CE not shipped.** Use the Vanilla DOM controller, React, or Vue.

## Events / callbacks

| Surface        | Event                                                                                                       | Payload                           |
| -------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------- |
| React          | `onSortingChange`                                                                                           | `SortingState`                    |
| React          | `onSelectionChange`                                                                                         | `SelectionState`                  |
| Vue            | `sortingChange`, `selectionChange`                                                                          | `SortingState` / `SelectionState` |
| Custom element | -                                                                                                           | -                                 |
| DOM controller | `subscribe(listener)`                                                                                       | void, fires on any state change   |
| DOM controller | `onSortingChange`, `onPaginationChange`, `onSelectionChange`, `onFiltersChange`, `onColumnVisibilityChange` | matching state slice              |

React also preserves native `onKeyDown` on the table; it runs before grid keyboard handling.

## Controlled vs uncontrolled

Every state slice is independently controllable.

- **Uncontrolled**: pass `defaultSorting` / `defaultSelection` (or `defaultPagination` / `defaultFilters` on the controller) and read state from `getState()` or the change callbacks.
- **Controlled**: pass `sorting` / `selection` (or `pagination` / `filters` / `columnVisibility`) plus the matching `on*Change`, and update your own store. Controlled values are never silently overwritten, so a missing callback freezes that slice.
- **Selection shape**: `SelectionState` is `{ ids, allFiltered, excludedIds }`. `selectAllFiltered()` sets `allFiltered: true` and then treats per-row toggles as exclusions, so "select all 12,480 rows" stays a constant-size payload.

## Accessibility

- Root is `role="grid"` with `aria-rowcount` (header rows included) and `aria-colcount`; pass `interactive: false` to `resolveDataTable` for a static `role="table"`.
- Sortable headers emit `aria-sort="ascending" | "descending" | "none"`. React wraps sortable header text in a real `<button>` so keyboard users can sort.
- Rows expose `aria-selected` only when you pass `selected`, which keeps read-only grids free of selection semantics.
- Cells carry roving `tabindex`, and `getDataTableKeyboardAction` returns the next position so focus moves cell by cell instead of trapping Tab.
- Page checkboxes report `aria-checked="mixed"` and set `indeterminate` for partially selected pages. Row checkboxes always carry an `aria-label` (default "Select row").
- Loading sets `aria-busy="true"` and `data-busy` so screen readers and CSS agree during server fetches.
- Disabled rows add `aria-disabled` and `data-disabled` and their checkbox is blocked by the engine, not only by CSS.

## Styling

Unstyled by default. Target `[data-slot="root"]`, `[data-slot="header"][aria-sort]`, `[data-slot="row"][data-state="selected"]`, `[data-slot="cell"][data-column="role"]`, `[data-busy="true"]`, and `[data-selection-count]`. Resolve accepts the shared styling contract (`unstyled`, `classes`, `styles`, `cssVariables`, `merge`) so Tailwind, CSS modules, and plain CSS all work without wrapper components.

## Edge cases

- **Server mode without `fetchRows`**: `createDataTableController` throws immediately rather than rendering an empty grid.
- **Races and aborts**: each `load()` bumps a request token and aborts the previous `AbortController`. Late responses and post-dispose responses are dropped, so fast filter typing cannot flip rows backwards.
- **Page overflow**: client mode clamps `pageIndex` into range, so deleting rows on the last page shows the new last page instead of a blank body.
- **`pageSize: 0`**: `pageCount` is `0` and client mode returns all filtered rows unsliced.
- **Empty page**: React and Vue render one row with `data-slot="empty"` spanning every column.
- **Missing accessor**: `readColumnValue` falls back to `row[column.id]`; missing values sort last through `compareValues`.
- **Mixed value types**: numbers compare numerically, dates by timestamp, booleans false-first, everything else with `localeCompare`. `NaN` sorts last.
- **Selection across pages**: ids persist when you page or filter. Call `clearSelection()` after a bulk action or the ids will outlive the rows.
- **`allFiltered` in server mode**: pass `ids` in `FetchRowsResult` if you want `getSelectedIds()` to expand beyond the current page.
- **URL sync**: `syncDataTableToUrl` reads params first, then writes (`writeOnInit: false` to skip), decodes garbage filter JSON to `[]`, and returns a disposable.
- **SSR**: the engine touches no browser globals. `syncDataTableToUrl` needs you to supply `getSearchParams` / `setSearchParams`, so it works with any router.
- **Dispose**: `dispose()` aborts in-flight fetches and clears listeners. React and Vue do this on unmount.

## Performance notes

State is plain objects, and `getState()` returns fresh copies of the slices it exposes; snapshot once per render instead of calling it inside loops. Client mode recomputes filter and sort per read, so memoize columns and rows and keep comparators cheap. For long lists, combine `getVirtualItems({ count, scrollTop, viewportHeight, rowHeight, overscan })` with your own scroller: it is a pure function with no observers or timers. Server mode plus `autoReload` collapses rapid changes into one in-flight request because the previous one is aborted. Engine size budget is tracked in `packages/data-table/package.json` under `size-limit`.

## When to use / When not

**Use** when a table needs sorting, paging, bulk selection, or server fetching that must behave the same in React, Vue, and Vanilla, and when the visual design belongs to your own CSS.

**Do not use** for a short static list (plain `<table>` markup is cheaper), for spreadsheet features such as cell editing, column resizing, grouping, or pivots (not in this beta), or as a data cache. Server caching, retries, and deduplication belong to [Query](/utilities/query) and [HTTP client](/utilities/http).

**Vs TanStack Table / AG Grid.** Choose TanStack when you are React-only and want its plugin depth. Choose AG Grid when you need pivots and cell editing out of the box. Choose Sometic when table behavior must match forms, HTTP, and [Query builder](/components/query-builder) bridges across stacks.

## FAQ

**Does this render a styled table?** No. React and Vue render semantic table markup with `data-slot` and ARIA attributes and zero CSS. Vanilla renders nothing until you build the DOM from the resolve helpers.

**How do I do server-side paging?** Pass `fetchRows`. It receives `{ sorting, pagination, filters, signal }` and returns `{ rows, total, ids? }`. With `autoReload` (default) any sorting, pagination, or filter change refetches and aborts the previous request.

**How does "select all" work without loading every row?** `selectAllFiltered()` flips `allFiltered: true`; later toggles become `excludedIds`. Send that shape to your API (for example "all rows matching these filters except these ids") instead of an id list.

**Is virtualization built into the component?** No. `getVirtualItems` is a pure window calculator you wire to your own scroll container. That keeps the engine free of ResizeObserver and scroll listeners, and lets you virtualize in React, Vue, or Vanilla identically.

**Can I sort by more than one column?** Yes, with `multiSort`. `toggleSort` cycles ascending, descending, then removed, and pushes the column onto the sorting array instead of replacing it.

**How do I add filters?** Set `filters` (or call `setFilters`) with `{ id, value, operator? }` entries. Fourteen operators ship, from `contains` to `isNotEmpty`. For a visual builder use [Query builder](/components/query-builder) and `toDataTableFilters`.

**Does it sync with the URL?** `syncDataTableToUrl` handles page, pageSize, sort, and filters with keys you can rename. You supply the search-param getter and setter, so it works with any router or none.

**Do React and Vue components accept a controller I already created?** Not in this beta; they own their controller. Use the toolbar render prop (React) to reach it, or build directly on `createDataTableController` when you need to share one instance.

**Is there a `sometic-data-table` element?** No. Custom elements are not shipped for data surfaces in this beta.

**Why does my controlled sorting snap back?** A controlled slice needs its callback. Pass `onSortingChange` and store the value, or switch to `defaultSorting`.

---

**Table stays empty in server mode?** Confirm `fetchRows` resolves `{ rows, total }` and that `load()` ran (React calls it when `fetchRows` is set; Vanilla must call `table.load()`). Check `getState().error` and abort races: a newer request cancels the previous one.

**Sort clicks do nothing?** Column needs `sortable: true`. Controlled `sorting` without `onSortingChange` snaps back. Verify header button wiring to `toggleSort`.

**Page select-all skips rows?** Those rows are disabled via `isRowDisabled`, or you are in `allFiltered` mode with exclusions. Inspect `getPageSelectionState()` and `getSelectedIds()`.

**URL sync fights the controller?** Decode once on boot into defaults, then write on `on*Change`. Do not set controlled props from the URL on every history tick without updating local state.

**Keyboard focus feels stuck?** Ensure cells use the resolve `tabindex` pattern and move focus via `getDataTableKeyboardAction`. Do not put `tabindex="0"` on every cell.

## Related links

- [Query builder](/components/query-builder)
- [Status surfaces](/components/status)
- [Query](/utilities/query)
- [Controlled state](/concepts/controlled-state)
- [Styling slots](/concepts/styling-slots)
- [Beta maturity](/releases/beta)
