export type DataTableMode = "client" | "server";

export type SortDirection = "asc" | "desc";

export type DataTableSort = {
    id: string;
    direction: SortDirection;
};

export type SortingState = DataTableSort[];

export type PaginationState = {
    pageIndex: number;
    pageSize: number;
};

export type SelectionState = {
    ids: string[];
    allFiltered: boolean;
    excludedIds: string[];
};

export type ColumnVisibilityState = Record<string, boolean>;

export type DataTableFilterOperator =
    | "equals"
    | "notEquals"
    | "contains"
    | "notContains"
    | "startsWith"
    | "endsWith"
    | "greaterThan"
    | "greaterThanOrEqual"
    | "lessThan"
    | "lessThanOrEqual"
    | "in"
    | "notIn"
    | "isEmpty"
    | "isNotEmpty";

export type DataTableFilter = {
    id: string;
    value: unknown;
    operator?: DataTableFilterOperator;
};

export type DataTableColumn<TRow> = {
    id: string;
    header?: string;
    accessor?: (row: TRow) => unknown;
    sortable?: boolean;
    filterable?: boolean;
    hidden?: boolean;
    compare?: (left: unknown, right: unknown) => number;
    filterFn?: (row: TRow, filter: DataTableFilter) => boolean;
};

export type FetchRowsArgs = {
    sorting: SortingState;
    pagination: PaginationState;
    filters: DataTableFilter[];
    signal: AbortSignal;
};

export type FetchRowsResult<TRow> = {
    rows: TRow[];
    total: number;
    ids?: string[];
};

export type DataTableStatus = "idle" | "loading" | "success" | "error";

export type PageSelectionState = "none" | "some" | "all";

export type DataTableState<TRow> = {
    mode: DataTableMode;
    sorting: SortingState;
    pagination: PaginationState;
    selection: SelectionState;
    columnVisibility: ColumnVisibilityState;
    filters: DataTableFilter[];
    rows: TRow[];
    total: number;
    pageCount: number;
    status: DataTableStatus;
    loading: boolean;
    error: Error | null;
};

export type DataTableControllerOptions<TRow> = {
    columns: DataTableColumn<TRow>[];
    getRowId: (row: TRow, index: number) => string;
    mode?: DataTableMode;
    rows?: TRow[];
    fetchRows?: (args: FetchRowsArgs) => Promise<FetchRowsResult<TRow>>;
    sorting?: SortingState;
    defaultSorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    pagination?: PaginationState;
    defaultPagination?: PaginationState;
    onPaginationChange?: (pagination: PaginationState) => void;
    selection?: SelectionState;
    defaultSelection?: SelectionState;
    onSelectionChange?: (selection: SelectionState) => void;
    columnVisibility?: ColumnVisibilityState;
    defaultColumnVisibility?: ColumnVisibilityState;
    onColumnVisibilityChange?: (columnVisibility: ColumnVisibilityState) => void;
    filters?: DataTableFilter[];
    defaultFilters?: DataTableFilter[];
    onFiltersChange?: (filters: DataTableFilter[]) => void;
    multiSort?: boolean;
    autoReload?: boolean;
    isRowDisabled?: (row: TRow) => boolean;
};
