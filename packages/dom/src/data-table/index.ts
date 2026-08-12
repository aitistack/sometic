import type { PageSelectionState, SortDirection } from "@sometic/data-table";
import { resolveRootStyle, type StyleableRootOptions } from "../internal/styleable.js";
import {
    getGridKeyboardAction,
    type GetGridKeyboardActionOptions,
    type GridKeyboardAction,
    type GridKeyboardEvent,
    type GridPosition,
} from "../internal/grid-navigation.js";

export type DataTableViewModel = {
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolveDataTableOptions = StyleableRootOptions & {
    rowCount?: number;
    columnCount?: number;
    headerRows?: number;
    mode?: "client" | "server";
    busy?: boolean;
    interactive?: boolean;
    selectionCount?: number;
    label?: string;
    labelledBy?: string;
};

export function resolveDataTable(options: ResolveDataTableOptions = {}): DataTableViewModel {
    const styled = resolveRootStyle(options);
    const headerRows = Math.max(0, Math.floor(options.headerRows ?? 1));
    const busy = options.busy === true;
    const interactive = options.interactive !== false;
    return {
        className: styled.className,
        style: styled.style,
        attributes: {
            role: interactive ? "grid" : "table",
            "data-slot": "root",
            ...(options.mode === undefined ? {} : { "data-mode": options.mode }),
            "data-busy": busy ? "true" : "false",
            ...(busy ? { "aria-busy": "true" } : {}),
            ...(options.rowCount === undefined
                ? {}
                : {
                      "aria-rowcount": String(
                          Math.max(0, Math.floor(options.rowCount)) + headerRows,
                      ),
                  }),
            ...(options.columnCount === undefined
                ? {}
                : { "aria-colcount": String(Math.max(0, Math.floor(options.columnCount))) }),
            ...(options.selectionCount === undefined
                ? {}
                : {
                      "data-selection-count": String(
                          Math.max(0, Math.floor(options.selectionCount)),
                      ),
                  }),
            ...(options.label === undefined ? {} : { "aria-label": options.label }),
            ...(options.labelledBy === undefined ? {} : { "aria-labelledby": options.labelledBy }),
        },
    };
}

export type DataTableHeaderViewModel = {
    columnId: string;
    sortable: boolean;
    sortDirection: SortDirection | null;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolveDataTableHeaderOptions = StyleableRootOptions & {
    columnId: string;
    sortable?: boolean;
    sortDirection?: SortDirection | null;
    columnIndex?: number;
    focused?: boolean;
    disabled?: boolean;
};

function ariaSortValue(direction: SortDirection | null): string {
    if (direction === "asc") {
        return "ascending";
    }
    if (direction === "desc") {
        return "descending";
    }
    return "none";
}

export function resolveDataTableHeader(
    options: ResolveDataTableHeaderOptions,
): DataTableHeaderViewModel {
    const styled = resolveRootStyle(options);
    const sortable = options.sortable === true;
    const sortDirection = options.sortDirection ?? null;
    const disabled = options.disabled === true;
    return {
        columnId: options.columnId,
        sortable,
        sortDirection,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "columnheader",
            "data-slot": "header",
            "data-column": options.columnId,
            "data-sortable": sortable ? "true" : "false",
            ...(sortable ? { "aria-sort": ariaSortValue(sortDirection) } : {}),
            ...(options.columnIndex === undefined
                ? {}
                : {
                      "aria-colindex": String(Math.max(0, Math.floor(options.columnIndex)) + 1),
                  }),
            ...(options.focused === undefined ? {} : { tabindex: options.focused ? "0" : "-1" }),
            ...(disabled ? { "aria-disabled": "true", "data-disabled": "" } : {}),
        },
    };
}

export type DataTableRowViewModel = {
    rowId: string;
    selected: boolean;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolveDataTableRowOptions = StyleableRootOptions & {
    rowId: string;
    selected?: boolean;
    disabled?: boolean;
    rowIndex?: number;
    headerRows?: number;
};

export function resolveDataTableRow(options: ResolveDataTableRowOptions): DataTableRowViewModel {
    const styled = resolveRootStyle(options);
    const selected = options.selected === true;
    const disabled = options.disabled === true;
    const headerRows = Math.max(0, Math.floor(options.headerRows ?? 1));
    return {
        rowId: options.rowId,
        selected,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "row",
            "data-slot": "row",
            "data-row-id": options.rowId,
            "data-state": selected ? "selected" : "unselected",
            ...(options.selected === undefined
                ? {}
                : { "aria-selected": selected ? "true" : "false" }),
            ...(options.rowIndex === undefined
                ? {}
                : {
                      "aria-rowindex": String(
                          Math.max(0, Math.floor(options.rowIndex)) + headerRows + 1,
                      ),
                  }),
            ...(disabled ? { "aria-disabled": "true", "data-disabled": "" } : {}),
        },
    };
}

export type DataTableCellViewModel = {
    columnId: string;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolveDataTableCellOptions = StyleableRootOptions & {
    columnId: string;
    columnIndex?: number;
    focused?: boolean;
    disabled?: boolean;
};

export function resolveDataTableCell(options: ResolveDataTableCellOptions): DataTableCellViewModel {
    const styled = resolveRootStyle(options);
    const disabled = options.disabled === true;
    return {
        columnId: options.columnId,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "gridcell",
            "data-slot": "cell",
            "data-column": options.columnId,
            ...(options.columnIndex === undefined
                ? {}
                : {
                      "aria-colindex": String(Math.max(0, Math.floor(options.columnIndex)) + 1),
                  }),
            ...(options.focused === undefined ? {} : { tabindex: options.focused ? "0" : "-1" }),
            ...(disabled ? { "aria-disabled": "true", "data-disabled": "" } : {}),
        },
    };
}

export type DataTableCheckboxScope = "row" | "page";

export type DataTableCheckboxViewModel = {
    scope: DataTableCheckboxScope;
    checked: boolean;
    indeterminate: boolean;
    disabled: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export type ResolveDataTableCheckboxOptions = StyleableRootOptions & {
    scope?: DataTableCheckboxScope;
    checked?: boolean;
    pageSelection?: PageSelectionState;
    disabled?: boolean;
    label?: string;
};

export function resolveDataTableCheckbox(
    options: ResolveDataTableCheckboxOptions = {},
): DataTableCheckboxViewModel {
    const styled = resolveRootStyle(options);
    const scope = options.scope ?? "row";
    const pageSelection = options.pageSelection;
    const indeterminate = pageSelection === "some";
    const checked =
        pageSelection === undefined ? options.checked === true : pageSelection === "all";
    const disabled = options.disabled === true;
    const label =
        options.label ?? (scope === "page" ? "Select all rows on this page" : "Select row");
    return {
        scope,
        checked,
        indeterminate,
        disabled,
        className: styled.className,
        style: styled.style,
        attributes: {
            type: "checkbox",
            "data-slot": "checkbox",
            "data-scope": scope,
            "data-state": indeterminate ? "indeterminate" : checked ? "checked" : "unchecked",
            "aria-label": label,
            ...(indeterminate ? { "aria-checked": "mixed", "data-indeterminate": "" } : {}),
            ...(checked ? { checked: "" } : {}),
            ...(disabled ? { disabled: "", "aria-disabled": "true" } : {}),
        },
    };
}

export type DataTableKeyboardAction = GridKeyboardAction;
export type DataTableGridPosition = GridPosition;
export type GetDataTableKeyboardActionOptions = GetGridKeyboardActionOptions;

export function getDataTableKeyboardAction(
    event: GridKeyboardEvent,
    options: GetDataTableKeyboardActionOptions,
): DataTableKeyboardAction | undefined {
    return getGridKeyboardAction(event, options);
}

export {
    createDataTableController,
    decodeDataTableFilters,
    decodeDataTableSorting,
    defaultDataTableUrlKeys,
    encodeDataTableFilters,
    encodeDataTableSorting,
    filterRows,
    getVirtualItems,
    sortRows,
    syncDataTableToUrl,
} from "@sometic/data-table";
export type {
    ColumnVisibilityState,
    DataTableColumn,
    DataTableController,
    DataTableControllerOptions,
    DataTableFilter,
    DataTableFilterOperator,
    DataTableMode,
    DataTableSort,
    DataTableState,
    DataTableStatus,
    DataTableUrlKeys,
    FetchRowsArgs,
    FetchRowsResult,
    GetVirtualItemsOptions,
    PageSelectionState,
    PaginationState,
    SelectionState,
    SortDirection,
    SortingState,
    SyncDataTableToUrlOptions,
    VirtualItem,
    VirtualWindow,
} from "@sometic/data-table";
