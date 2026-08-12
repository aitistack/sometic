import { createDisposable, type Disposable } from "@sometic/core/disposable";
import type {
    DataTableFilter,
    DataTableFilterOperator,
    PaginationState,
    SortingState,
} from "./types.js";

export type DataTableUrlKeys = {
    page: string;
    pageSize: string;
    sort: string;
    filters: string;
};

export const defaultDataTableUrlKeys: DataTableUrlKeys = {
    page: "page",
    pageSize: "pageSize",
    sort: "sort",
    filters: "filters",
};

export type DataTableUrlSyncTarget = {
    getState(): {
        sorting: SortingState;
        pagination: PaginationState;
        filters: DataTableFilter[];
    };
    setSorting(sorting: SortingState): void;
    setPagination(pagination: PaginationState): void;
    setFilters(filters: DataTableFilter[]): void;
    subscribe(listener: () => void): () => void;
};

export type SyncDataTableToUrlOptions = {
    controller: DataTableUrlSyncTarget;
    getSearchParams: () => URLSearchParams;
    setSearchParams: (params: URLSearchParams) => void;
    keys?: Partial<DataTableUrlKeys>;
    writeOnInit?: boolean;
};

const filterOperators: readonly DataTableFilterOperator[] = [
    "equals",
    "notEquals",
    "contains",
    "notContains",
    "startsWith",
    "endsWith",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
    "in",
    "notIn",
    "isEmpty",
    "isNotEmpty",
];

const filterOperatorNames = new Set<string>(filterOperators);

function isFilterOperator(value: unknown): value is DataTableFilterOperator {
    return typeof value === "string" && filterOperatorNames.has(value);
}

export function encodeDataTableSorting(sorting: SortingState): string {
    return sorting.map((sort) => `${sort.id}:${sort.direction}`).join(",");
}

export function decodeDataTableSorting(raw: string): SortingState {
    if (raw.trim().length === 0) {
        return [];
    }

    const result: SortingState = [];
    for (const chunk of raw.split(",")) {
        const trimmed = chunk.trim();
        if (trimmed.length === 0) {
            continue;
        }
        const separator = trimmed.lastIndexOf(":");
        const id = separator === -1 ? trimmed : trimmed.slice(0, separator);
        const direction = separator === -1 ? "asc" : trimmed.slice(separator + 1);
        if (id.length === 0) {
            continue;
        }
        result.push({ id, direction: direction === "desc" ? "desc" : "asc" });
    }
    return result;
}

export function encodeDataTableFilters(filters: DataTableFilter[]): string {
    return JSON.stringify(
        filters.map((filter) => ({
            id: filter.id,
            value: filter.value,
            ...(filter.operator === undefined ? {} : { operator: filter.operator }),
        })),
    );
}

export function decodeDataTableFilters(raw: string): DataTableFilter[] {
    if (raw.trim().length === 0) {
        return [];
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }

    if (!Array.isArray(parsed)) {
        return [];
    }

    const result: DataTableFilter[] = [];
    for (const entry of parsed) {
        if (typeof entry !== "object" || entry === null) {
            continue;
        }
        const id = Reflect.get(entry, "id");
        if (typeof id !== "string" || id.length === 0) {
            continue;
        }
        const operator: unknown = Reflect.get(entry, "operator");
        result.push({
            id,
            value: Reflect.get(entry, "value"),
            ...(isFilterOperator(operator) ? { operator } : {}),
        });
    }
    return result;
}

export function syncDataTableToUrl(options: SyncDataTableToUrlOptions): Disposable {
    const keys: DataTableUrlKeys = { ...defaultDataTableUrlKeys, ...options.keys };
    const { controller } = options;

    const initial = options.getSearchParams();
    const rawPage = initial.get(keys.page);
    const rawPageSize = initial.get(keys.pageSize);
    const rawSort = initial.get(keys.sort);
    const rawFilters = initial.get(keys.filters);

    if (rawFilters !== null) {
        controller.setFilters(decodeDataTableFilters(rawFilters));
    }

    if (rawSort !== null) {
        controller.setSorting(decodeDataTableSorting(rawSort));
    }

    if (rawPage !== null || rawPageSize !== null) {
        const current = controller.getState().pagination;
        const parsedPage = rawPage === null ? Number.NaN : Number.parseInt(rawPage, 10);
        const parsedPageSize = rawPageSize === null ? Number.NaN : Number.parseInt(rawPageSize, 10);
        controller.setPagination({
            pageIndex: Number.isFinite(parsedPage)
                ? Math.max(0, parsedPage - 1)
                : current.pageIndex,
            pageSize:
                Number.isFinite(parsedPageSize) && parsedPageSize > 0
                    ? parsedPageSize
                    : current.pageSize,
        });
    }

    const write = (): void => {
        const state = controller.getState();
        const params = new URLSearchParams(options.getSearchParams());

        params.set(keys.page, String(state.pagination.pageIndex + 1));
        params.set(keys.pageSize, String(state.pagination.pageSize));

        const sort = encodeDataTableSorting(state.sorting);
        if (sort.length === 0) {
            params.delete(keys.sort);
        } else {
            params.set(keys.sort, sort);
        }

        if (state.filters.length === 0) {
            params.delete(keys.filters);
        } else {
            params.set(keys.filters, encodeDataTableFilters(state.filters));
        }

        options.setSearchParams(params);
    };

    if (options.writeOnInit !== false) {
        write();
    }

    const unsubscribe = controller.subscribe(write);

    return createDisposable(() => {
        unsubscribe();
    });
}
