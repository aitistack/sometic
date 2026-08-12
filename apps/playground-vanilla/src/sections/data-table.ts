import {
    createDataTableController,
    resolveDataTable,
    resolveDataTableHeader,
    resolveDataTableRow,
    resolveDataTableCell,
    resolveDataTableCheckbox,
} from "@sometic/dom/data-table";

type Row = { id: string; name: string; role: string; team: string };

const rows: Row[] = Array.from({ length: 48 }, (_, index) => ({
    id: String(index + 1),
    name: `Person ${index + 1}`,
    role: index % 2 === 0 ? "Admin" : "Editor",
    team: index % 3 === 0 ? "Platform" : index % 3 === 1 ? "Growth" : "Support",
}));

export function mountDataTableSection(root: HTMLElement): () => void {
    const host = root.querySelector("[data-data-table]");
    const meta = root.querySelector("[data-data-table-meta]");
    const filterInput = root.querySelector("[data-data-table-filter]");
    const roleFilter = root.querySelector("[data-data-table-role]");
    const pageSizeSelect = root.querySelector("[data-data-table-page-size]");
    const teamToggle = root.querySelector("[data-data-table-toggle-team]");
    const selectAllFiltered = root.querySelector("[data-data-table-select-filtered]");
    const clearSelection = root.querySelector("[data-data-table-clear-selection]");
    if (!(host instanceof HTMLElement)) {
        return () => {};
    }

    const table = createDataTableController({
        columns: [
            { id: "name", header: "Name", accessor: (row: Row) => row.name, sortable: true },
            { id: "role", header: "Role", accessor: (row: Row) => row.role, sortable: true },
            { id: "team", header: "Team", accessor: (row: Row) => row.team, sortable: true },
        ],
        getRowId: (row) => row.id,
        rows,
        mode: "client",
        multiSort: true,
        defaultPagination: { pageIndex: 0, pageSize: 8 },
        defaultColumnVisibility: { name: true, role: true, team: true },
    });

    const applyFilters = (): void => {
        const filters: Array<{ id: string; value: string; operator: "contains" | "equals" }> = [];
        if (filterInput instanceof HTMLInputElement && filterInput.value.trim() !== "") {
            filters.push({
                id: "name",
                value: filterInput.value.trim(),
                operator: "contains",
            });
        }
        if (roleFilter instanceof HTMLSelectElement && roleFilter.value !== "") {
            filters.push({ id: "role", value: roleFilter.value, operator: "equals" });
        }
        table.setFilters(filters);
        table.setPageIndex(0);
    };

    if (filterInput instanceof HTMLInputElement) {
        filterInput.addEventListener("input", applyFilters);
    }
    if (roleFilter instanceof HTMLSelectElement) {
        roleFilter.addEventListener("change", applyFilters);
    }
    if (pageSizeSelect instanceof HTMLSelectElement) {
        pageSizeSelect.value = "8";
        pageSizeSelect.addEventListener("change", () => {
            const next = Number(pageSizeSelect.value);
            table.setPageSize(Number.isFinite(next) && next > 0 ? next : 8);
            table.setPageIndex(0);
        });
    }
    if (teamToggle instanceof HTMLButtonElement) {
        teamToggle.addEventListener("click", () => {
            const visibility = table.getState().columnVisibility;
            const nextHidden = visibility.team !== false;
            table.setColumnHidden("team", nextHidden);
            teamToggle.textContent = nextHidden ? "Show team" : "Hide team";
        });
    }
    if (selectAllFiltered instanceof HTMLButtonElement) {
        selectAllFiltered.addEventListener("click", () => {
            table.selectAllFiltered();
        });
    }
    if (clearSelection instanceof HTMLButtonElement) {
        clearSelection.addEventListener("click", () => {
            table.clearSelection();
        });
    }

    const unsubscribe = table.subscribe(() => {
        render();
    });

    const render = (): void => {
        const state = table.getState();
        const pageRows = table.getPageRows();
        const rootView = resolveDataTable({
            busy: state.loading,
            rowCount: pageRows.length,
            columnCount: table.getVisibleColumns().length + 1,
            mode: state.mode,
            label: "Team members",
        });
        host.replaceChildren();
        host.className = ["pg-data-table", rootView.className].filter(Boolean).join(" ");
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
        if (table.getPageSelectionState() === "some") {
            selectAllInput.indeterminate = true;
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
            const button = document.createElement("button");
            button.type = "button";
            button.className = "pg-btn pg-table-sort";
            const glyph =
                sort?.direction === "asc" ? " ↑" : sort?.direction === "desc" ? " ↓" : " ↕";
            button.textContent = `${column.header ?? column.id}${glyph}`;
            button.addEventListener("click", () => {
                table.toggleSort(column.id);
            });
            th.append(button);
            headRow.append(th);
        }
        thead.append(headRow);

        const tbody = document.createElement("tbody");
        if (pageRows.length === 0) {
            const empty = document.createElement("tr");
            const cell = document.createElement("td");
            cell.colSpan = table.getVisibleColumns().length + 1;
            cell.textContent = "No rows match the current filters.";
            empty.append(cell);
            tbody.append(empty);
        } else {
            pageRows.forEach((row, index) => {
                const tr = document.createElement("tr");
                const rowView = resolveDataTableRow({
                    rowId: row.id,
                    rowIndex: index,
                    selected: table.isRowSelected(row.id),
                });
                for (const [key, value] of Object.entries(rowView.attributes)) {
                    tr.setAttribute(key, value);
                }
                const selectTd = document.createElement("td");
                const checkbox = document.createElement("input");
                const checkboxView = resolveDataTableCheckbox({
                    checked: table.isRowSelected(row.id),
                    label: `Select ${row.name}`,
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
            });
        }
        tableEl.append(thead, tbody);
        host.append(tableEl);

        const pager = document.createElement("div");
        pager.className = "pg-row";
        pager.setAttribute("data-slot", "pagination");

        const first = document.createElement("button");
        first.type = "button";
        first.className = "pg-btn";
        first.textContent = "First";
        first.disabled = state.pagination.pageIndex <= 0;
        first.addEventListener("click", () => {
            table.setPageIndex(0);
        });

        const prev = document.createElement("button");
        prev.type = "button";
        prev.className = "pg-btn";
        prev.textContent = "Prev";
        prev.disabled = state.pagination.pageIndex <= 0;
        prev.addEventListener("click", () => {
            table.setPageIndex(Math.max(0, state.pagination.pageIndex - 1));
        });

        const pageStatus = document.createElement("span");
        pageStatus.className = "pg-status";
        pageStatus.setAttribute("data-slot", "page-status");
        const pageCount = Math.max(1, state.pageCount);
        pageStatus.textContent = `Page ${state.pagination.pageIndex + 1} of ${pageCount}`;

        const next = document.createElement("button");
        next.type = "button";
        next.className = "pg-btn";
        next.textContent = "Next";
        next.disabled = state.pagination.pageIndex >= pageCount - 1;
        next.addEventListener("click", () => {
            table.setPageIndex(Math.min(pageCount - 1, state.pagination.pageIndex + 1));
        });

        const last = document.createElement("button");
        last.type = "button";
        last.className = "pg-btn";
        last.textContent = "Last";
        last.disabled = state.pagination.pageIndex >= pageCount - 1;
        last.addEventListener("click", () => {
            table.setPageIndex(pageCount - 1);
        });

        pager.append(first, prev, pageStatus, next, last);
        host.append(pager);

        if (pageSizeSelect instanceof HTMLSelectElement) {
            pageSizeSelect.value = String(state.pagination.pageSize);
        }

        if (meta instanceof HTMLElement) {
            const sortLabel =
                state.sorting.length === 0
                    ? "none"
                    : state.sorting.map((item) => `${item.id}:${item.direction}`).join(", ");
            meta.textContent = `page ${state.pagination.pageIndex + 1}/${pageCount} · size ${state.pagination.pageSize} · selected ${table.getSelectedIds().length} · filtered ${state.total} · sort ${sortLabel}`;
        }
    };

    render();
    return () => {
        unsubscribe();
        table.dispose();
    };
}
