import type { DataTableColumn, DataTableFilter, SortingState } from "./types.js";

export function readColumnValue<TRow>(column: DataTableColumn<TRow>, row: TRow): unknown {
    if (column.accessor) {
        return column.accessor(row);
    }

    if (typeof row !== "object" || row === null) {
        return undefined;
    }

    return Reflect.get(row, column.id);
}

export function compareValues(left: unknown, right: unknown): number {
    if (left === right) {
        return 0;
    }

    const leftMissing = left === null || left === undefined;
    const rightMissing = right === null || right === undefined;
    if (leftMissing && rightMissing) {
        return 0;
    }
    if (leftMissing) {
        return 1;
    }
    if (rightMissing) {
        return -1;
    }

    if (typeof left === "number" && typeof right === "number") {
        if (Number.isNaN(left) && Number.isNaN(right)) {
            return 0;
        }
        if (Number.isNaN(left)) {
            return 1;
        }
        if (Number.isNaN(right)) {
            return -1;
        }
        return left - right;
    }

    if (typeof left === "boolean" && typeof right === "boolean") {
        return left === right ? 0 : left ? 1 : -1;
    }

    if (left instanceof Date && right instanceof Date) {
        return left.getTime() - right.getTime();
    }

    return String(left).localeCompare(String(right));
}

function toText(value: unknown): string {
    if (value === null || value === undefined) {
        return "";
    }
    return String(value).toLowerCase();
}

function isEmptyValue(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === "string") {
        return value.trim().length === 0;
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    return false;
}

type ResolvedFilterOperator = NonNullable<DataTableFilter["operator"]>;

export function resolveFilterOperator(filter: DataTableFilter): ResolvedFilterOperator {
    if (filter.operator !== undefined) {
        return filter.operator;
    }
    return typeof filter.value === "string" ? "contains" : "equals";
}

export function matchesFilterValue(value: unknown, filter: DataTableFilter): boolean {
    const operator = resolveFilterOperator(filter);

    switch (operator) {
        case "equals":
            return value === filter.value || toText(value) === toText(filter.value);
        case "notEquals":
            return !(value === filter.value || toText(value) === toText(filter.value));
        case "contains":
            return toText(value).includes(toText(filter.value));
        case "notContains":
            return !toText(value).includes(toText(filter.value));
        case "startsWith":
            return toText(value).startsWith(toText(filter.value));
        case "endsWith":
            return toText(value).endsWith(toText(filter.value));
        case "greaterThan":
            return compareValues(value, filter.value) > 0;
        case "greaterThanOrEqual":
            return compareValues(value, filter.value) >= 0;
        case "lessThan":
            return compareValues(value, filter.value) < 0;
        case "lessThanOrEqual":
            return compareValues(value, filter.value) <= 0;
        case "in":
            return Array.isArray(filter.value) && filter.value.some((entry) => entry === value);
        case "notIn":
            return !(Array.isArray(filter.value) && filter.value.some((entry) => entry === value));
        case "isEmpty":
            return isEmptyValue(value);
        case "isNotEmpty":
            return !isEmptyValue(value);
    }
}

export function filterRows<TRow>(
    rows: TRow[],
    columns: DataTableColumn<TRow>[],
    filters: DataTableFilter[],
): TRow[] {
    if (filters.length === 0) {
        return rows.slice();
    }

    const byId = new Map(columns.map((column) => [column.id, column]));

    return rows.filter((row) =>
        filters.every((filter) => {
            const column = byId.get(filter.id);
            if (!column) {
                return true;
            }
            if (column.filterFn) {
                return column.filterFn(row, filter);
            }
            return matchesFilterValue(readColumnValue(column, row), filter);
        }),
    );
}

export function sortRows<TRow>(
    rows: TRow[],
    columns: DataTableColumn<TRow>[],
    sorting: SortingState,
): TRow[] {
    if (sorting.length === 0) {
        return rows.slice();
    }

    const byId = new Map(columns.map((column) => [column.id, column]));
    const active = sorting.filter((sort) => byId.has(sort.id));
    if (active.length === 0) {
        return rows.slice();
    }

    return rows
        .map((row, index) => ({ row, index }))
        .sort((left, right) => {
            for (const sort of active) {
                const column = byId.get(sort.id);
                if (!column) {
                    continue;
                }
                const compare = column.compare ?? compareValues;
                const result = compare(
                    readColumnValue(column, left.row),
                    readColumnValue(column, right.row),
                );
                if (result !== 0) {
                    return sort.direction === "asc" ? result : -result;
                }
            }
            return left.index - right.index;
        })
        .map((entry) => entry.row);
}
