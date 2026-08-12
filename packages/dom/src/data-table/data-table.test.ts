import { describe, expect, it } from "vitest";
import {
    createDataTableController,
    getDataTableKeyboardAction,
    getVirtualItems,
    resolveDataTable,
    resolveDataTableCell,
    resolveDataTableCheckbox,
    resolveDataTableHeader,
    resolveDataTableRow,
    syncDataTableToUrl,
    type DataTableController,
} from "./index.js";

type Row = { id: string; name: string; age: number };

const rows: Row[] = [
    { id: "1", name: "Ada", age: 36 },
    { id: "2", name: "Grace", age: 45 },
    { id: "3", name: "Linus", age: 28 },
];

function createTable(): DataTableController<Row> {
    return createDataTableController<Row>({
        columns: [
            { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
            { id: "age", header: "Age", accessor: (row) => row.age, sortable: true },
        ],
        getRowId: (row) => row.id,
        rows,
        defaultPagination: { pageIndex: 0, pageSize: 2 },
    });
}

describe("resolveDataTable", () => {
    it("resolves an interactive grid with counts", () => {
        const view = resolveDataTable({ rowCount: 3, columnCount: 2, mode: "server", busy: true });
        expect(view.attributes.role).toBe("grid");
        expect(view.attributes["aria-rowcount"]).toBe("4");
        expect(view.attributes["aria-colcount"]).toBe("2");
        expect(view.attributes["aria-busy"]).toBe("true");
        expect(view.attributes["data-mode"]).toBe("server");
    });

    it("falls back to a static table role", () => {
        const view = resolveDataTable({ interactive: false, label: "Users" });
        expect(view.attributes.role).toBe("table");
        expect(view.attributes["aria-label"]).toBe("Users");
        expect(view.attributes["aria-busy"]).toBeUndefined();
    });

    it("omits counts when not provided", () => {
        const view = resolveDataTable();
        expect(view.attributes["aria-rowcount"]).toBeUndefined();
        expect(view.attributes["data-busy"]).toBe("false");
    });
});

describe("resolveDataTableHeader", () => {
    it("maps sort direction to aria-sort", () => {
        expect(
            resolveDataTableHeader({ columnId: "age", sortable: true, sortDirection: "asc" })
                .attributes["aria-sort"],
        ).toBe("ascending");
        expect(
            resolveDataTableHeader({ columnId: "age", sortable: true, sortDirection: "desc" })
                .attributes["aria-sort"],
        ).toBe("descending");
        expect(
            resolveDataTableHeader({ columnId: "age", sortable: true }).attributes["aria-sort"],
        ).toBe("none");
    });

    it("omits aria-sort when the column cannot sort", () => {
        const view = resolveDataTableHeader({ columnId: "name", columnIndex: 1, focused: true });
        expect(view.attributes["aria-sort"]).toBeUndefined();
        expect(view.attributes["aria-colindex"]).toBe("2");
        expect(view.attributes.tabindex).toBe("0");
        expect(view.sortable).toBe(false);
    });

    it("marks disabled headers", () => {
        const view = resolveDataTableHeader({ columnId: "name", disabled: true });
        expect(view.attributes["aria-disabled"]).toBe("true");
    });
});

describe("resolveDataTableRow", () => {
    it("offsets aria-rowindex past header rows", () => {
        const view = resolveDataTableRow({ rowId: "7", rowIndex: 0, selected: true });
        expect(view.attributes["aria-rowindex"]).toBe("2");
        expect(view.attributes["aria-selected"]).toBe("true");
        expect(view.attributes["data-state"]).toBe("selected");
    });

    it("supports header-less grids and unselectable rows", () => {
        const view = resolveDataTableRow({ rowId: "7", rowIndex: 4, headerRows: 0 });
        expect(view.attributes["aria-rowindex"]).toBe("5");
        expect(view.attributes["aria-selected"]).toBeUndefined();
    });

    it("marks disabled rows", () => {
        const view = resolveDataTableRow({ rowId: "7", disabled: true });
        expect(view.attributes["data-disabled"]).toBe("");
        expect(view.disabled).toBe(true);
    });
});

describe("resolveDataTableCell", () => {
    it("resolves roving tabindex and column index", () => {
        const focused = resolveDataTableCell({ columnId: "age", columnIndex: 2, focused: true });
        const blurred = resolveDataTableCell({ columnId: "age", columnIndex: 2, focused: false });
        expect(focused.attributes.tabindex).toBe("0");
        expect(blurred.attributes.tabindex).toBe("-1");
        expect(focused.attributes["aria-colindex"]).toBe("3");
        expect(focused.attributes.role).toBe("gridcell");
    });
});

describe("resolveDataTableCheckbox", () => {
    it("resolves page selection tri-state", () => {
        expect(resolveDataTableCheckbox({ scope: "page", pageSelection: "all" }).checked).toBe(true);
        const partial = resolveDataTableCheckbox({ scope: "page", pageSelection: "some" });
        expect(partial.indeterminate).toBe(true);
        expect(partial.attributes["aria-checked"]).toBe("mixed");
        const none = resolveDataTableCheckbox({ scope: "page", pageSelection: "none" });
        expect(none.checked).toBe(false);
        expect(none.attributes["aria-checked"]).toBeUndefined();
    });

    it("resolves row scope and disabled state", () => {
        const view = resolveDataTableCheckbox({ checked: true, disabled: true });
        expect(view.attributes.checked).toBe("");
        expect(view.attributes.disabled).toBe("");
        expect(view.attributes["aria-label"]).toBe("Select row");
        expect(view.scope).toBe("row");
    });
});

describe("getDataTableKeyboardAction", () => {
    const grid = { rowCount: 3, columnCount: 2, position: { row: 1, column: 0 } };

    it("moves between rows and columns", () => {
        expect(getDataTableKeyboardAction({ key: "ArrowDown" }, grid)).toEqual({
            type: "move",
            position: { row: 2, column: 0 },
        });
        expect(getDataTableKeyboardAction({ key: "ArrowUp" }, grid)).toEqual({
            type: "move",
            position: { row: 0, column: 0 },
        });
        expect(getDataTableKeyboardAction({ key: "ArrowRight" }, grid)).toEqual({
            type: "move",
            position: { row: 1, column: 1 },
        });
    });

    it("mirrors arrows in RTL", () => {
        expect(getDataTableKeyboardAction({ key: "ArrowLeft" }, { ...grid, dir: "rtl" })).toEqual({
            type: "move",
            position: { row: 1, column: 1 },
        });
    });

    it("clamps at edges and returns nothing when the cell does not move", () => {
        expect(
            getDataTableKeyboardAction({ key: "ArrowUp" }, { ...grid, position: { row: 0, column: 0 } }),
        ).toBeUndefined();
        expect(getDataTableKeyboardAction({ key: "End", ctrlKey: true }, grid)).toEqual({
            type: "move",
            position: { row: 2, column: 1 },
        });
        expect(getDataTableKeyboardAction({ key: "Home" }, grid)).toBeUndefined();
    });

    it("jumps by page and reports toggle / activate", () => {
        expect(
            getDataTableKeyboardAction(
                { key: "PageDown" },
                { rowCount: 100, columnCount: 1, position: { row: 0, column: 0 }, pageSize: 20 },
            ),
        ).toEqual({ type: "move", position: { row: 20, column: 0 } });
        expect(getDataTableKeyboardAction({ key: " " }, grid)).toEqual({ type: "toggle" });
        expect(getDataTableKeyboardAction({ key: "Enter" }, grid)).toEqual({ type: "activate" });
        expect(getDataTableKeyboardAction({ key: "z" }, grid)).toBeUndefined();
    });

    it("ignores empty grids", () => {
        expect(
            getDataTableKeyboardAction(
                { key: "ArrowDown" },
                { rowCount: 0, columnCount: 0, position: { row: 0, column: 0 } },
            ),
        ).toBeUndefined();
    });
});

describe("data-table re-exports", () => {
    it("drives the shared controller", () => {
        const table = createTable();
        expect(table.getState().total).toBe(3);
        expect(table.getPageRows()).toHaveLength(2);
        table.toggleSort("age");
        expect(table.getPageRows()[0]?.id).toBe("3");
        table.selectAllPage();
        expect(table.getPageSelectionState()).toBe("all");
        table.dispose();
        expect(table.disposed).toBe(true);
    });

    it("exposes virtual window math", () => {
        const window = getVirtualItems({
            count: 1000,
            scrollTop: 0,
            viewportHeight: 100,
            rowHeight: 20,
        });
        expect(window.totalSize).toBe(20000);
        expect(window.items).toHaveLength(5);
    });

    it("exposes url sync", () => {
        const table = createTable();
        let search = new URLSearchParams("page=2&sort=age:desc");
        const sync = syncDataTableToUrl({
            controller: table,
            getSearchParams: () => search,
            setSearchParams: (params) => {
                search = params;
            },
        });
        expect(table.getState().pagination.pageIndex).toBe(1);
        expect(table.getState().sorting).toEqual([{ id: "age", direction: "desc" }]);
        sync.dispose();
        table.dispose();
    });
});
