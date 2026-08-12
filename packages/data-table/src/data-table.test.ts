import { describe, expect, it, vi } from "vitest";
import { createDataTableController } from "./data-table.js";
import { getVirtualItems } from "./virtual.js";
import { syncDataTableToUrl } from "./url-sync.js";
import type { DataTableColumn, FetchRowsArgs, FetchRowsResult } from "./types.js";

type Person = {
    id: string;
    name: string;
    age: number;
    active: boolean;
};

const people: Person[] = [
    { id: "1", name: "Ada", age: 36, active: true },
    { id: "2", name: "Grace", age: 45, active: true },
    { id: "3", name: "Linus", age: 28, active: false },
    { id: "4", name: "Barbara", age: 52, active: true },
    { id: "5", name: "Alan", age: 41, active: false },
];

const columns: DataTableColumn<Person>[] = [
    { id: "name", header: "Name" },
    { id: "age", header: "Age" },
    { id: "active", header: "Active", hidden: true },
];

function createClientTable(
    overrides: Partial<Parameters<typeof createDataTableController<Person>>[0]> = {},
) {
    return createDataTableController<Person>({
        columns,
        getRowId: (row) => row.id,
        rows: people,
        defaultPagination: { pageIndex: 0, pageSize: 2 },
        ...overrides,
    });
}

describe("createDataTableController client mode", () => {
    it("handles an empty row set without throwing", () => {
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            rows: [],
        });

        const state = table.getState();
        expect(state.mode).toBe("client");
        expect(state.total).toBe(0);
        expect(state.pageCount).toBe(0);
        expect(table.getPageRows()).toEqual([]);
        expect(table.getPageSelectionState()).toBe("none");
        expect(table.getSelectedIds()).toEqual([]);
        table.dispose();
    });

    it("sorts ascending, descending, then clears", () => {
        const table = createClientTable({ defaultPagination: { pageIndex: 0, pageSize: 10 } });

        table.toggleSort("age");
        expect(table.getPageRows().map((row) => row.age)).toEqual([28, 36, 41, 45, 52]);

        table.toggleSort("age");
        expect(table.getPageRows().map((row) => row.age)).toEqual([52, 45, 41, 36, 28]);

        table.toggleSort("age");
        expect(table.getState().sorting).toEqual([]);
        expect(table.getPageRows().map((row) => row.id)).toEqual(["1", "2", "3", "4", "5"]);
        table.dispose();
    });

    it("ignores sorting for unknown and non-sortable columns", () => {
        const table = createClientTable({
            columns: [{ id: "name" }, { id: "age", sortable: false }],
        });

        table.toggleSort("missing");
        table.toggleSort("age");
        expect(table.getState().sorting).toEqual([]);
        table.dispose();
    });

    it("supports multi column sorting when enabled", () => {
        const table = createClientTable({
            multiSort: true,
            defaultPagination: { pageIndex: 0, pageSize: 10 },
        });

        table.toggleSort("active");
        table.toggleSort("age");
        expect(table.getState().sorting).toEqual([
            { id: "active", direction: "asc" },
            { id: "age", direction: "asc" },
        ]);
        expect(table.getPageRows().map((row) => row.id)).toEqual(["3", "5", "1", "2", "4"]);
        table.dispose();
    });

    it("paginates in memory and clamps out of range pages", () => {
        const table = createClientTable();

        expect(table.getState().pageCount).toBe(3);
        expect(table.getPageRowIds()).toEqual(["1", "2"]);

        table.setPageIndex(1);
        expect(table.getPageRowIds()).toEqual(["3", "4"]);

        table.setPageIndex(99);
        expect(table.getPageRowIds()).toEqual(["5"]);

        table.setPageSize(5);
        expect(table.getState().pagination).toEqual({ pageIndex: 0, pageSize: 5 });
        expect(table.getPageRowIds()).toHaveLength(5);
        table.dispose();
    });

    it("filters rows and resets the page index", () => {
        const table = createClientTable();
        table.setPageIndex(2);

        table.setFilters([{ id: "name", value: "a" }]);
        expect(table.getState().pagination.pageIndex).toBe(0);
        expect(table.getState().total).toBe(4);

        table.setFilters([{ id: "age", value: 40, operator: "greaterThan" }]);
        expect(table.getFilteredRows().map((row) => row.id)).toEqual(["2", "4", "5"]);

        table.setFilters([{ id: "unknown", value: "x" }]);
        expect(table.getState().total).toBe(5);
        table.dispose();
    });

    it("keeps selection across pages and supports bulk selection", () => {
        const table = createClientTable();

        table.toggleRowSelected("1");
        table.setPageIndex(1);
        table.toggleRowSelected("3");

        expect(table.getSelectedIds()).toEqual(["1", "3"]);
        expect(table.isRowSelected("1")).toBe(true);
        expect(table.getPageSelectionState()).toBe("some");

        table.selectAllPage();
        expect(table.getSelectedIds()).toEqual(["1", "3", "4"]);
        expect(table.getPageSelectionState()).toBe("all");

        table.selectAllPage();
        expect(table.getSelectedIds()).toEqual(["1"]);

        table.selectAllFiltered();
        expect(table.getSelectedIds()).toEqual(["1", "2", "3", "4", "5"]);

        table.clearSelection();
        expect(table.getSelectedIds()).toEqual([]);
        table.dispose();
    });

    it("never selects disabled rows", () => {
        const table = createClientTable({
            isRowDisabled: (row) => row.active === false,
            defaultPagination: { pageIndex: 0, pageSize: 10 },
        });

        table.toggleRowSelected("3");
        expect(table.isRowSelected("3")).toBe(false);

        table.selectAllPage();
        expect(table.getSelectedIds()).toEqual(["1", "2", "4"]);

        table.selectAllFiltered();
        expect(table.getSelectedIds()).toEqual(["1", "2", "4"]);
        table.dispose();
    });

    it("reports column visibility from explicit state and column defaults", () => {
        const table = createClientTable();

        expect(table.getVisibleColumns().map((column) => column.id)).toEqual(["name", "age"]);

        table.setColumnVisibility({ active: true, age: false });
        expect(table.getVisibleColumns().map((column) => column.id)).toEqual(["name", "active"]);

        table.setColumnHidden("active", true);
        expect(table.getVisibleColumns().map((column) => column.id)).toEqual(["name"]);
        table.dispose();
    });

    it("notifies subscribers and stops after unsubscribe or dispose", () => {
        const table = createClientTable();
        const listener = vi.fn();
        const unsubscribe = table.subscribe(listener);

        table.setPageIndex(1);
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        table.setPageIndex(0);
        expect(listener).toHaveBeenCalledTimes(1);

        const second = vi.fn();
        table.subscribe(second);
        table.dispose();
        table.setPageIndex(1);
        expect(second).not.toHaveBeenCalled();
        expect(table.disposed).toBe(true);
    });

    it("forwards controlled state changes without mutating internal values", () => {
        const onSortingChange = vi.fn();
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            rows: people,
            sorting: [{ id: "name", direction: "asc" }],
            onSortingChange,
        });

        expect(table.getState().sorting).toEqual([{ id: "name", direction: "asc" }]);

        table.toggleSort("name");
        expect(onSortingChange).toHaveBeenCalledWith([{ id: "name", direction: "desc" }]);
        expect(table.getState().sorting).toEqual([{ id: "name", direction: "asc" }]);
        table.dispose();
    });

    it("replaces client rows through setRows", () => {
        const table = createClientTable();
        table.setRows([{ id: "9", name: "Zoe", age: 30, active: true }]);
        expect(table.getState().total).toBe(1);
        expect(table.getPageRowIds()).toEqual(["9"]);
        table.dispose();
    });
});

describe("createDataTableController server mode", () => {
    it("requires fetchRows", () => {
        expect(() =>
            createDataTableController<Person>({
                columns,
                getRowId: (row) => row.id,
                mode: "server",
            }),
        ).toThrow(/fetchRows/);
    });

    it("loads rows and exposes loading then success status", async () => {
        const fetchRows = vi.fn(async (): Promise<FetchRowsResult<Person>> => ({
            rows: people.slice(0, 2),
            total: 5,
        }));

        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows,
        });

        expect(table.mode).toBe("server");
        const pending = table.load();
        expect(table.getState().status).toBe("loading");
        expect(table.getState().loading).toBe(true);

        await pending;
        const state = table.getState();
        expect(state.status).toBe("success");
        expect(state.total).toBe(5);
        expect(state.rows.map((row) => row.id)).toEqual(["1", "2"]);
        expect(state.pageCount).toBe(1);
        table.dispose();
    });

    it("records fetch failures as errors", async () => {
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows: async () => {
                throw new Error("boom");
            },
        });

        await table.load();
        expect(table.getState().status).toBe("error");
        expect(table.getState().error?.message).toBe("boom");
        table.dispose();
    });

    it("aborts the previous request and ignores stale results", async () => {
        const seen: FetchRowsArgs[] = [];
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows: async (args) => {
                seen.push(args);
                const delay = seen.length === 1 ? 30 : 1;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return {
                    rows: [{ id: `run-${seen.length}`, name: "x", age: 1, active: true }],
                    total: seen.length,
                };
            },
        });

        const first = table.load();
        const second = table.load();
        await Promise.all([first, second]);

        expect(seen).toHaveLength(2);
        expect(seen[0]?.signal.aborted).toBe(true);
        expect(seen[1]?.signal.aborted).toBe(false);
        expect(table.getState().rows.map((row) => row.id)).toEqual(["run-2"]);
        expect(table.getState().total).toBe(2);
        table.dispose();
    });

    it("reloads when sorting, filters, or pagination change after the first load", async () => {
        const fetchRows = vi.fn(async (): Promise<FetchRowsResult<Person>> => ({
            rows: [],
            total: 0,
        }));
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows,
        });

        table.setPageIndex(2);
        expect(fetchRows).not.toHaveBeenCalled();

        await table.load();
        expect(fetchRows).toHaveBeenCalledTimes(1);

        table.toggleSort("age");
        await Promise.resolve();
        expect(fetchRows).toHaveBeenCalledTimes(2);
        table.dispose();
    });

    it("does not reload when autoReload is disabled", async () => {
        const fetchRows = vi.fn(async (): Promise<FetchRowsResult<Person>> => ({
            rows: [],
            total: 0,
        }));
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows,
            autoReload: false,
        });

        await table.load();
        table.toggleSort("age");
        await Promise.resolve();
        expect(fetchRows).toHaveBeenCalledTimes(1);
        table.dispose();
    });

    it("selects every filtered row without ids and honors an explicit id list", async () => {
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows: async () => ({ rows: people.slice(0, 2), total: 5, ids: ["1", "2", "3"] }),
        });

        await table.load();

        table.selectAllFiltered();
        expect(table.getState().selection.allFiltered).toBe(true);
        expect(table.getSelectedIds()).toEqual(["1", "2", "3"]);

        table.toggleRowSelected("2");
        expect(table.isRowSelected("2")).toBe(false);
        expect(table.getSelectedIds()).toEqual(["1", "3"]);

        table.selectAllPage();
        expect(table.getSelectedIds()).toEqual(["1", "2", "3"]);

        table.selectAllFiltered(["7", "7", "8"]);
        expect(table.getState().selection.allFiltered).toBe(false);
        expect(table.getSelectedIds()).toEqual(["7", "8"]);
        table.dispose();
    });

    it("aborts an in-flight request on dispose and drops the result", async () => {
        let capturedSignal: AbortSignal | undefined;
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows: async (args) => {
                capturedSignal = args.signal;
                await new Promise((resolve) => setTimeout(resolve, 5));
                return { rows: people, total: 5 };
            },
        });

        const pending = table.load();
        table.dispose();
        await pending;

        expect(capturedSignal?.aborted).toBe(true);
        expect(table.getState().rows).toEqual([]);
        expect(table.disposed).toBe(true);
    });

    it("ignores load after dispose", async () => {
        const fetchRows = vi.fn(async (): Promise<FetchRowsResult<Person>> => ({
            rows: [],
            total: 0,
        }));
        const table = createDataTableController<Person>({
            columns,
            getRowId: (row) => row.id,
            fetchRows,
        });

        table.dispose();
        await table.load();
        expect(fetchRows).not.toHaveBeenCalled();
    });
});

describe("getVirtualItems", () => {
    it("returns an empty window for zero rows", () => {
        expect(
            getVirtualItems({ count: 0, scrollTop: 0, viewportHeight: 300, rowHeight: 30 }),
        ).toEqual({ items: [], totalSize: 0, startIndex: 0, endIndex: -1 });
    });

    it("returns an empty window when no size information is usable", () => {
        expect(getVirtualItems({ count: 10, scrollTop: 0, viewportHeight: 300 })).toEqual({
            items: [],
            totalSize: 0,
            startIndex: 0,
            endIndex: -1,
        });
    });

    it("computes a fixed height window", () => {
        const window = getVirtualItems({
            count: 1000,
            scrollTop: 0,
            viewportHeight: 320,
            rowHeight: 32,
        });

        expect(window.totalSize).toBe(32_000);
        expect(window.startIndex).toBe(0);
        expect(window.endIndex).toBe(9);
        expect(window.items).toHaveLength(10);
        expect(window.items[0]).toEqual({ index: 0, start: 0, size: 32, key: 0 });
    });

    it("scrolls the window and applies overscan with clamping", () => {
        const scrolled = getVirtualItems({
            count: 1000,
            scrollTop: 320,
            viewportHeight: 320,
            rowHeight: 32,
            overscan: 2,
        });
        expect(scrolled.startIndex).toBe(8);
        expect(scrolled.endIndex).toBe(21);
        expect(scrolled.items[0]?.start).toBe(256);

        const atTop = getVirtualItems({
            count: 1000,
            scrollTop: 0,
            viewportHeight: 320,
            rowHeight: 32,
            overscan: 5,
        });
        expect(atTop.startIndex).toBe(0);

        const atEnd = getVirtualItems({
            count: 20,
            scrollTop: 100_000,
            viewportHeight: 320,
            rowHeight: 32,
            overscan: 3,
        });
        expect(atEnd.endIndex).toBe(19);
        expect(atEnd.startIndex).toBeLessThanOrEqual(19);
    });

    it("handles a zero height viewport", () => {
        const window = getVirtualItems({
            count: 50,
            scrollTop: 64,
            viewportHeight: 0,
            rowHeight: 32,
        });
        expect(window.startIndex).toBe(2);
        expect(window.endIndex).toBe(2);
        expect(window.items).toHaveLength(1);
    });

    it("computes a variable height window from estimateSize", () => {
        const window = getVirtualItems({
            count: 6,
            scrollTop: 0,
            viewportHeight: 100,
            estimateSize: (index) => (index % 2 === 0 ? 40 : 20),
        });

        expect(window.totalSize).toBe(180);
        expect(window.startIndex).toBe(0);
        expect(window.endIndex).toBe(2);
        expect(window.items.map((item) => item.start)).toEqual([0, 40, 60]);
        expect(window.items.map((item) => item.size)).toEqual([40, 20, 40]);
    });

    it("finds the first variable height row after scrolling", () => {
        const window = getVirtualItems({
            count: 6,
            scrollTop: 70,
            viewportHeight: 40,
            estimateSize: (index) => (index % 2 === 0 ? 40 : 20),
            overscan: 1,
        });

        expect(window.startIndex).toBe(1);
        expect(window.endIndex).toBe(4);
        expect(window.items.map((item) => item.index)).toEqual([1, 2, 3, 4]);
    });

    it("returns an empty window when every estimate is zero", () => {
        expect(
            getVirtualItems({ count: 5, scrollTop: 0, viewportHeight: 100, estimateSize: () => 0 }),
        ).toEqual({ items: [], totalSize: 0, startIndex: 0, endIndex: -1 });
    });
});

describe("syncDataTableToUrl", () => {
    function createUrlHarness(initial = "") {
        let params = new URLSearchParams(initial);
        return {
            getSearchParams: () => new URLSearchParams(params),
            setSearchParams: (next: URLSearchParams) => {
                params = new URLSearchParams(next);
            },
            read: () => params.toString(),
            get: (key: string) => params.get(key),
        };
    }

    it("writes page, page size, sorting, and filters into the url", () => {
        const url = createUrlHarness();
        const table = createClientTable();
        const sync = syncDataTableToUrl({
            controller: table,
            getSearchParams: url.getSearchParams,
            setSearchParams: url.setSearchParams,
        });

        expect(url.get("page")).toBe("1");
        expect(url.get("pageSize")).toBe("2");
        expect(url.get("sort")).toBeNull();

        table.toggleSort("age");
        table.setPageIndex(1);
        table.setFilters([{ id: "name", value: "a", operator: "startsWith" }]);

        expect(url.get("sort")).toBe("age:asc");
        expect(url.get("page")).toBe("1");
        expect(JSON.parse(url.get("filters") ?? "[]")).toEqual([
            { id: "name", value: "a", operator: "startsWith" },
        ]);

        sync.dispose();
        table.toggleSort("name");
        expect(url.get("sort")).toBe("age:asc");
        table.dispose();
    });

    it("restores state from the url and round trips", () => {
        const source = createUrlHarness();
        const first = createClientTable();
        const firstSync = syncDataTableToUrl({
            controller: first,
            getSearchParams: source.getSearchParams,
            setSearchParams: source.setSearchParams,
        });
        first.setPageSize(3);
        first.setPageIndex(1);
        first.toggleSort("age");
        first.toggleSort("age");
        first.setFilters([{ id: "name", value: "a", operator: "contains" }]);
        first.setPageIndex(1);
        const serialized = source.read();
        firstSync.dispose();
        first.dispose();

        const target = createUrlHarness(serialized);
        const second = createClientTable();
        const secondSync = syncDataTableToUrl({
            controller: second,
            getSearchParams: target.getSearchParams,
            setSearchParams: target.setSearchParams,
        });

        expect(second.getState().pagination).toEqual({ pageIndex: 1, pageSize: 3 });
        expect(second.getState().sorting).toEqual([{ id: "age", direction: "desc" }]);
        expect(second.getState().filters).toEqual([
            { id: "name", value: "a", operator: "contains" },
        ]);
        secondSync.dispose();
        second.dispose();
    });

    it("ignores malformed url values", () => {
        const url = createUrlHarness("page=abc&pageSize=-4&sort=&filters=not-json");
        const table = createClientTable();
        const sync = syncDataTableToUrl({
            controller: table,
            getSearchParams: url.getSearchParams,
            setSearchParams: url.setSearchParams,
        });

        expect(table.getState().pagination).toEqual({ pageIndex: 0, pageSize: 2 });
        expect(table.getState().sorting).toEqual([]);
        expect(table.getState().filters).toEqual([]);
        sync.dispose();
        table.dispose();
    });

    it("supports custom keys and skips the initial write", () => {
        const url = createUrlHarness("p=2");
        const table = createClientTable();
        const sync = syncDataTableToUrl({
            controller: table,
            getSearchParams: url.getSearchParams,
            setSearchParams: url.setSearchParams,
            keys: { page: "p", pageSize: "ps" },
            writeOnInit: false,
        });

        expect(table.getState().pagination.pageIndex).toBe(1);
        expect(url.read()).toBe("p=2");

        table.setPageIndex(0);
        expect(url.get("p")).toBe("1");
        expect(url.get("ps")).toBe("2");
        sync.dispose();
        table.dispose();
    });
});
