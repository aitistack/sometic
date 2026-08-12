import { createControllableState } from "@sometic/core/controllable-state";
import { filterRows, sortRows } from "./rows.js";
import type {
    ColumnVisibilityState,
    DataTableColumn,
    DataTableControllerOptions,
    DataTableFilter,
    DataTableMode,
    DataTableState,
    DataTableStatus,
    FetchRowsResult,
    PageSelectionState,
    PaginationState,
    SelectionState,
    SortingState,
} from "./types.js";

const defaultPagination: PaginationState = { pageIndex: 0, pageSize: 10 };
const emptySelection: SelectionState = { ids: [], allFiltered: false, excludedIds: [] };

function uniqueIds(ids: string[]): string[] {
    return Array.from(new Set(ids));
}

function normalizeError(value: unknown): Error {
    if (value instanceof Error) {
        return value;
    }
    return new Error(typeof value === "string" ? value : "Data table fetch failed");
}

export type DataTableController<TRow> = {
    readonly mode: DataTableMode;
    readonly columns: DataTableColumn<TRow>[];
    getState(): DataTableState<TRow>;
    subscribe(listener: () => void): () => void;
    setRows(rows: TRow[]): void;
    setSorting(sorting: SortingState): void;
    setPagination(pagination: PaginationState): void;
    setSelection(selection: SelectionState): void;
    setFilters(filters: DataTableFilter[]): void;
    setColumnVisibility(columnVisibility: ColumnVisibilityState): void;
    setColumnHidden(columnId: string, hidden: boolean): void;
    toggleSort(columnId: string): void;
    setPageIndex(pageIndex: number): void;
    setPageSize(pageSize: number): void;
    toggleRowSelected(id: string): void;
    selectAllPage(): void;
    selectAllFiltered(ids?: string[]): void;
    clearSelection(): void;
    isRowSelected(id: string): boolean;
    getSelectedIds(): string[];
    getPageSelectionState(): PageSelectionState;
    getVisibleColumns(): DataTableColumn<TRow>[];
    getPageRows(): TRow[];
    getPageRowIds(): string[];
    getFilteredRows(): TRow[];
    load(): Promise<void>;
    readonly disposed: boolean;
    dispose(): void;
};

export function createDataTableController<TRow>(
    options: DataTableControllerOptions<TRow>,
): DataTableController<TRow> {
    const mode: DataTableMode = options.mode ?? (options.fetchRows ? "server" : "client");

    if (mode === "server" && !options.fetchRows) {
        throw new Error("createDataTableController requires fetchRows in server mode");
    }

    const columns = options.columns.slice();
    const multiSort = options.multiSort === true;
    const autoReload = options.autoReload !== false;
    const listeners = new Set<() => void>();

    let sourceRows: TRow[] = options.rows ? options.rows.slice() : [];
    let serverRows: TRow[] = [];
    let serverTotal = 0;
    let serverIds: string[] = [];
    let status: DataTableStatus = "idle";
    let error: Error | null = null;
    let requestToken = 0;
    let inFlight: AbortController | null = null;
    let hasLoaded = false;
    let disposed = false;

    const sortingState = createControllableState<SortingState>({
        defaultValue: options.defaultSorting ? options.defaultSorting.slice() : [],
        ...(options.sorting === undefined ? {} : { value: options.sorting }),
        ...(options.onSortingChange === undefined ? {} : { onChange: options.onSortingChange }),
    });

    const paginationState = createControllableState<PaginationState>({
        defaultValue: options.defaultPagination ?? defaultPagination,
        ...(options.pagination === undefined ? {} : { value: options.pagination }),
        ...(options.onPaginationChange === undefined
            ? {}
            : { onChange: options.onPaginationChange }),
    });

    const selectionState = createControllableState<SelectionState>({
        defaultValue: options.defaultSelection ?? emptySelection,
        ...(options.selection === undefined ? {} : { value: options.selection }),
        ...(options.onSelectionChange === undefined ? {} : { onChange: options.onSelectionChange }),
    });

    const columnVisibilityState = createControllableState<ColumnVisibilityState>({
        defaultValue: options.defaultColumnVisibility ?? {},
        ...(options.columnVisibility === undefined ? {} : { value: options.columnVisibility }),
        ...(options.onColumnVisibilityChange === undefined
            ? {}
            : { onChange: options.onColumnVisibilityChange }),
    });

    const filtersState = createControllableState<DataTableFilter[]>({
        defaultValue: options.defaultFilters ? options.defaultFilters.slice() : [],
        ...(options.filters === undefined ? {} : { value: options.filters }),
        ...(options.onFiltersChange === undefined ? {} : { onChange: options.onFiltersChange }),
    });

    const notify = (): void => {
        for (const listener of Array.from(listeners)) {
            listener();
        }
    };

    const rowId = (row: TRow, index: number): string => options.getRowId(row, index);

    const getFilteredRows = (): TRow[] => {
        if (mode === "server") {
            return serverRows.slice();
        }
        return sortRows(filterRows(sourceRows, columns, filtersState.get()), columns, sortingState.get());
    };

    const getTotal = (): number => {
        if (mode === "server") {
            return serverTotal;
        }
        return filterRows(sourceRows, columns, filtersState.get()).length;
    };

    const getPageCount = (): number => {
        const { pageSize } = paginationState.get();
        if (pageSize <= 0) {
            return 0;
        }
        return Math.ceil(getTotal() / pageSize);
    };

    const getPageRows = (): TRow[] => {
        if (mode === "server") {
            return serverRows.slice();
        }
        const { pageIndex, pageSize } = paginationState.get();
        const rows = getFilteredRows();
        if (pageSize <= 0) {
            return rows;
        }
        const pageCount = Math.ceil(rows.length / pageSize);
        const safePageIndex = pageCount === 0 ? 0 : Math.min(Math.max(0, pageIndex), pageCount - 1);
        const start = safePageIndex * pageSize;
        return rows.slice(start, start + pageSize);
    };

    const getPageRowIds = (): string[] => getPageRows().map((row, index) => rowId(row, index));

    const getKnownIds = (): string[] => {
        if (mode === "server") {
            if (serverIds.length > 0) {
                return serverIds.slice();
            }
            return serverRows.map((row, index) => rowId(row, index));
        }
        return getFilteredRows().map((row, index) => rowId(row, index));
    };

    const isRowDisabledById = (id: string): boolean => {
        if (!options.isRowDisabled) {
            return false;
        }
        const rows = mode === "server" ? serverRows : sourceRows;
        const match = rows.find((row, index) => rowId(row, index) === id);
        if (match === undefined) {
            return false;
        }
        return options.isRowDisabled(match);
    };

    const isRowSelected = (id: string): boolean => {
        const selection = selectionState.get();
        if (selection.allFiltered) {
            return !selection.excludedIds.includes(id);
        }
        return selection.ids.includes(id);
    };

    const getSelectedIds = (): string[] => {
        const selection = selectionState.get();
        if (!selection.allFiltered) {
            return selection.ids.slice();
        }
        return getKnownIds().filter((id) => !selection.excludedIds.includes(id));
    };

    const applySelection = (next: SelectionState): void => {
        selectionState.set(next);
        notify();
    };

    const getState = (): DataTableState<TRow> => {
        const selection = selectionState.get();
        return {
            mode,
            sorting: sortingState.get().slice(),
            pagination: { ...paginationState.get() },
            selection: {
                ids: selection.ids.slice(),
                allFiltered: selection.allFiltered,
                excludedIds: selection.excludedIds.slice(),
            },
            columnVisibility: { ...columnVisibilityState.get() },
            filters: filtersState.get().slice(),
            rows: getPageRows(),
            total: getTotal(),
            pageCount: getPageCount(),
            status,
            loading: status === "loading",
            error,
        };
    };

    const maybeReload = (): void => {
        if (mode !== "server" || !autoReload || !hasLoaded || disposed) {
            return;
        }
        void load();
    };

    async function load(): Promise<void> {
        if (mode !== "server" || disposed) {
            return;
        }

        const fetchRows = options.fetchRows;
        if (!fetchRows) {
            return;
        }

        hasLoaded = true;
        requestToken += 1;
        const token = requestToken;

        if (inFlight) {
            inFlight.abort();
        }
        const controller = new AbortController();
        inFlight = controller;

        status = "loading";
        error = null;
        notify();

        let result: FetchRowsResult<TRow>;
        try {
            result = await fetchRows({
                sorting: sortingState.get().slice(),
                pagination: { ...paginationState.get() },
                filters: filtersState.get().slice(),
                signal: controller.signal,
            });
        } catch (caught) {
            if (token !== requestToken || disposed) {
                return;
            }
            inFlight = null;
            status = "error";
            error = normalizeError(caught);
            notify();
            return;
        }

        if (token !== requestToken || disposed) {
            return;
        }

        inFlight = null;
        serverRows = result.rows.slice();
        serverTotal = result.total;
        serverIds = result.ids ? result.ids.slice() : [];
        status = "success";
        error = null;
        notify();
    }

    return {
        get mode() {
            return mode;
        },
        get columns() {
            return columns.slice();
        },
        get disposed() {
            return disposed;
        },
        getState,
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        setRows(rows) {
            sourceRows = rows.slice();
            if (mode === "server") {
                serverRows = rows.slice();
                serverTotal = rows.length;
            }
            notify();
        },
        setSorting(sorting) {
            sortingState.set(sorting.slice());
            notify();
            maybeReload();
        },
        setPagination(pagination) {
            paginationState.set({ ...pagination });
            notify();
            maybeReload();
        },
        setSelection(selection) {
            applySelection({
                ids: uniqueIds(selection.ids),
                allFiltered: selection.allFiltered,
                excludedIds: uniqueIds(selection.excludedIds),
            });
        },
        setFilters(filters) {
            filtersState.set(filters.slice());
            paginationState.set({ ...paginationState.get(), pageIndex: 0 });
            notify();
            maybeReload();
        },
        setColumnVisibility(columnVisibility) {
            columnVisibilityState.set({ ...columnVisibility });
            notify();
        },
        setColumnHidden(columnId, hidden) {
            columnVisibilityState.set({ ...columnVisibilityState.get(), [columnId]: !hidden });
            notify();
        },
        toggleSort(columnId) {
            const column = columns.find((entry) => entry.id === columnId);
            if (!column || column.sortable === false) {
                return;
            }

            const current = sortingState.get();
            const existing = current.find((sort) => sort.id === columnId);

            let next: SortingState;
            if (!existing) {
                next = multiSort
                    ? [...current, { id: columnId, direction: "asc" }]
                    : [{ id: columnId, direction: "asc" }];
            } else if (existing.direction === "asc") {
                next = multiSort
                    ? current.map((sort) =>
                          sort.id === columnId ? { id: columnId, direction: "desc" } : sort,
                      )
                    : [{ id: columnId, direction: "desc" }];
            } else {
                next = current.filter((sort) => sort.id !== columnId);
            }

            sortingState.set(next);
            notify();
            maybeReload();
        },
        setPageIndex(pageIndex) {
            paginationState.set({
                ...paginationState.get(),
                pageIndex: Math.max(0, Math.floor(pageIndex)),
            });
            notify();
            maybeReload();
        },
        setPageSize(pageSize) {
            paginationState.set({
                pageIndex: 0,
                pageSize: Math.max(1, Math.floor(pageSize)),
            });
            notify();
            maybeReload();
        },
        toggleRowSelected(id) {
            if (isRowDisabledById(id)) {
                return;
            }

            const selection = selectionState.get();
            if (selection.allFiltered) {
                const excluded = selection.excludedIds.includes(id)
                    ? selection.excludedIds.filter((entry) => entry !== id)
                    : [...selection.excludedIds, id];
                applySelection({ ...selection, excludedIds: excluded });
                return;
            }

            const ids = selection.ids.includes(id)
                ? selection.ids.filter((entry) => entry !== id)
                : [...selection.ids, id];
            applySelection({ ...selection, ids });
        },
        selectAllPage() {
            const selection = selectionState.get();
            const pageIds = getPageRowIds().filter((id) => !isRowDisabledById(id));

            if (selection.allFiltered) {
                applySelection({
                    ...selection,
                    excludedIds: selection.excludedIds.filter((id) => !pageIds.includes(id)),
                });
                return;
            }

            const allSelected = pageIds.every((id) => selection.ids.includes(id));
            const ids = allSelected
                ? selection.ids.filter((id) => !pageIds.includes(id))
                : uniqueIds([...selection.ids, ...pageIds]);
            applySelection({ ...selection, ids });
        },
        selectAllFiltered(ids) {
            if (ids !== undefined) {
                applySelection({ ids: uniqueIds(ids), allFiltered: false, excludedIds: [] });
                return;
            }

            if (mode === "client") {
                applySelection({
                    ids: getKnownIds().filter((id) => !isRowDisabledById(id)),
                    allFiltered: false,
                    excludedIds: [],
                });
                return;
            }

            applySelection({ ids: [], allFiltered: true, excludedIds: [] });
        },
        clearSelection() {
            applySelection({ ids: [], allFiltered: false, excludedIds: [] });
        },
        isRowSelected,
        getSelectedIds,
        getPageSelectionState() {
            const pageIds = getPageRowIds();
            if (pageIds.length === 0) {
                return "none";
            }
            const selectedCount = pageIds.filter((id) => isRowSelected(id)).length;
            if (selectedCount === 0) {
                return "none";
            }
            return selectedCount === pageIds.length ? "all" : "some";
        },
        getVisibleColumns() {
            const visibility = columnVisibilityState.get();
            return columns.filter((column) => {
                const explicit = visibility[column.id];
                if (explicit !== undefined) {
                    return explicit;
                }
                return column.hidden !== true;
            });
        },
        getPageRows,
        getPageRowIds,
        getFilteredRows,
        load,
        dispose() {
            if (disposed) {
                return;
            }
            disposed = true;
            requestToken += 1;
            if (inFlight) {
                inFlight.abort();
                inFlight = null;
            }
            listeners.clear();
        },
    };
}