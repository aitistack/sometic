import {
    createDataTableController,
    getVirtualItems,
    resolveDataTable,
    resolveDataTableHeader,
    resolveDataTableRow,
    resolveDataTableCell,
    resolveDataTableCheckbox,
} from "@sometic/dom/data-table";

type Row = { id: string; name: string; role: string };

const rows: Row[] = Array.from({ length: 40 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
}));

export function mountDataTableSection(root: HTMLElement): () => void {
    const host = root.querySelector("[data-data-table]");
    const meta = root.querySelector("[data-data-table-meta]");
    if (!(host instanceof HTMLElement)) {
        return () => {};
    }

    const table = createDataTableController({
        columns: [
            { id: "name", header: "Name", accessor: (row: Row) => row.name, sortable: true },
            { id: "role", header: "Role", accessor: (row: Row) => row.role, sortable: true },
        ],
        getRowId: (row) => row.id,
        rows,
        mode: "client",
        defaultPagination: { pageIndex: 0, pageSize: 8 },
    });

    const unsubscribe = table.subscribe(() => {
        render();
    });

    const render = (): void => {
        const state = table.getState();
        const rootView = resolveDataTable({
            busy: state.loading,
            rowCount: state.rows.length,
            columnCount: table.getVisibleColumns().length + 1,
            mode: state.mode,
        });
        host.replaceChildren();
        host.className = rootView.className;
        for (const [key, value] of Object.entries(rootView.attributes)) {
            host.setAttribute(key, value);
        }

        const tableEl = document.createElement("table");
        const thead = document.createElement("thead");
        const headRow = document.createElement("tr");
        const selectAll = document.createElement("th");
        const selectAllInput = document.createElement("input");
        const selectAllView = resolveDataTableCheckbox({
            scope: "page",
            pageSelection: table.getPageSelectionState(),
        });
        for (const [key, value] of Object.entries(selectAllView.attributes)) {
            selectAllInput.setAttribute(key, value);
        }
        selectAllInput.addEventListener("change", () => {
            table.selectAllPage();
        });
        selectAll.append(selectAllInput);
        headRow.append(selectAll);
        for (const column of table.getVisibleColumns()) {
            const th = document.createElement("th");
            const sort = state.sorting.find((item) => item.id === column.id);
            const header = resolveDataTableHeader({
                columnId: column.id,
                sortable: column.sortable === true,
                sortDirection: sort?.direction ?? null,
            });
            for (const [key, value] of Object.entries(header.attributes)) {
                th.setAttribute(key, value);
            }
            th.textContent = column.header ?? column.id;
            th.addEventListener("click", () => {
                table.toggleSort(column.id);
            });
            headRow.append(th);
        }
        thead.append(headRow);
        const tbody = document.createElement("tbody");
        const virtual = getVirtualItems({
            scrollTop: 0,
            viewportHeight: 320,
            rowHeight: 36,
            count: state.rows.length,
        });
        for (const item of virtual.items) {
            const row = state.rows[item.index];
            if (!row) {
                continue;
            }
            const tr = document.createElement("tr");
            const rowView = resolveDataTableRow({
                rowId: row.id,
                rowIndex: item.index,
                selected: table.isRowSelected(row.id),
            });
            for (const [key, value] of Object.entries(rowView.attributes)) {
                tr.setAttribute(key, value);
            }
            const selectTd = document.createElement("td");
            const checkbox = document.createElement("input");
            const checkboxView = resolveDataTableCheckbox({
                checked: table.isRowSelected(row.id),
            });
            for (const [key, value] of Object.entries(checkboxView.attributes)) {
                checkbox.setAttribute(key, value);
            }
            checkbox.addEventListener("change", () => {
                table.toggleRowSelected(row.id);
            });
            selectTd.append(checkbox);
            tr.append(selectTd);
            for (const column of table.getVisibleColumns()) {
                const td = document.createElement("td");
                const cell = resolveDataTableCell({ columnId: column.id });
                for (const [key, value] of Object.entries(cell.attributes)) {
                    td.setAttribute(key, value);
                }
                td.textContent = String(column.accessor?.(row) ?? "");
                tr.append(td);
            }
            tbody.append(tr);
        }
        tableEl.append(thead, tbody);
        host.append(tableEl);

        const pager = document.createElement("div");
        pager.className = "pg-row";
        const prev = document.createElement("button");
        prev.type = "button";
        prev.className = "pg-btn";
        prev.textContent = "Prev";
        prev.addEventListener("click", () => {
            table.setPageIndex(Math.max(0, state.pagination.pageIndex - 1));
        });
        const next = document.createElement("button");
        next.type = "button";
        next.className = "pg-btn";
        next.textContent = "Next";
        next.addEventListener("click", () => {
            table.setPageIndex(state.pagination.pageIndex + 1);
        });
        pager.append(prev, next);
        host.append(pager);

        if (meta instanceof HTMLElement) {
            meta.textContent = `page ${state.pagination.pageIndex + 1} · selected ${table.getSelectedIds().length} · total ${state.total}`;
        }
    };

    render();
    return () => {
        unsubscribe();
        table.dispose();
    };
}
