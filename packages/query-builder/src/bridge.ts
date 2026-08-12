import type { DataTableFilterLike, QueryBuilderAst, QueryNode, QueryOperator } from "./types.js";

export type ToDataTableFiltersOptions = {
    includeDisabled?: boolean;
};

function mapOperator(
    operator: QueryOperator,
): { operator: DataTableFilterLike["operator"]; value?: boolean } {
    if (operator === "isTrue") {
        return { operator: "equals", value: true };
    }
    if (operator === "isFalse") {
        return { operator: "equals", value: false };
    }
    return { operator };
}

export function toDataTableFilters(
    ast: QueryBuilderAst,
    options: ToDataTableFiltersOptions = {},
): DataTableFilterLike[] {
    const includeDisabled = options.includeDisabled === true;
    const filters: DataTableFilterLike[] = [];

    const walk = (node: QueryNode, inheritedDisabled: boolean): void => {
        const disabled = inheritedDisabled || node.disabled === true;

        if (node.kind === "group") {
            for (const child of node.children) {
                walk(child, disabled);
            }
            return;
        }

        if (disabled && !includeDisabled) {
            return;
        }

        const mapped = mapOperator(node.operator);
        filters.push({
            id: node.field,
            value: mapped.value === undefined ? node.value : mapped.value,
            ...(mapped.operator === undefined ? {} : { operator: mapped.operator }),
        });
    };

    walk(ast, false);
    return filters;
}
