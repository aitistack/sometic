import { createError } from "@sometic/core/error";
import type {
    QueryAstIssue,
    QueryBuilderAst,
    QueryBuilderField,
    QueryBuilderFieldType,
    QueryCombinator,
    QueryGroup,
    QueryNode,
    QueryOperator,
    QueryRule,
    ValidateAstOptions,
    ValidateAstResult,
} from "./types.js";

const operatorsByFieldType: Record<QueryBuilderFieldType, QueryOperator[]> = {
    string: [
        "equals",
        "notEquals",
        "contains",
        "notContains",
        "startsWith",
        "endsWith",
        "isEmpty",
        "isNotEmpty",
    ],
    number: [
        "equals",
        "notEquals",
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
        "isEmpty",
        "isNotEmpty",
    ],
    boolean: ["isTrue", "isFalse"],
    date: [
        "equals",
        "notEquals",
        "greaterThan",
        "greaterThanOrEqual",
        "lessThan",
        "lessThanOrEqual",
        "isEmpty",
        "isNotEmpty",
    ],
    enum: ["equals", "notEquals", "in", "notIn", "isEmpty", "isNotEmpty"],
};

const allOperators = new Set<string>([
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
    "isTrue",
    "isFalse",
]);

export function defaultOperatorsForFieldType(type: QueryBuilderFieldType): QueryOperator[] {
    return operatorsByFieldType[type].slice();
}

export function operatorsForField(field: QueryBuilderField): QueryOperator[] {
    if (field.operators && field.operators.length > 0) {
        return field.operators.slice();
    }
    return defaultOperatorsForFieldType(field.type);
}

export function isQueryOperator(value: unknown): value is QueryOperator {
    return typeof value === "string" && allOperators.has(value);
}

export function operatorNeedsValue(operator: QueryOperator): boolean {
    return (
        operator !== "isEmpty" &&
        operator !== "isNotEmpty" &&
        operator !== "isTrue" &&
        operator !== "isFalse"
    );
}

export function createEmptyGroup(
    combinator: QueryCombinator = "and",
    createNodeId: () => string,
): QueryGroup {
    return { kind: "group", id: createNodeId(), combinator, children: [] };
}

export function cloneQueryNode(node: QueryNode): QueryNode {
    if (node.kind === "group") {
        return {
            kind: "group",
            id: node.id,
            combinator: node.combinator,
            children: node.children.map(cloneQueryNode),
            ...(node.negated === undefined ? {} : { negated: node.negated }),
            ...(node.disabled === undefined ? {} : { disabled: node.disabled }),
        };
    }

    return {
        kind: "rule",
        id: node.id,
        field: node.field,
        operator: node.operator,
        value: node.value,
        ...(node.disabled === undefined ? {} : { disabled: node.disabled }),
    };
}

export function cloneQueryAst(ast: QueryBuilderAst): QueryBuilderAst {
    const cloned = cloneQueryNode(ast);
    if (cloned.kind !== "group") {
        throw createError({
            code: "query_builder_invalid_ast",
            message: "A query builder AST root must be a group",
        });
    }
    return cloned;
}

export function findGroupById(root: QueryGroup, id: string): QueryGroup | undefined {
    if (root.id === id) {
        return root;
    }
    for (const child of root.children) {
        if (child.kind === "group") {
            const found = findGroupById(child, id);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
}

export function findRuleById(root: QueryGroup, id: string): QueryRule | undefined {
    for (const child of root.children) {
        if (child.kind === "rule") {
            if (child.id === id) {
                return child;
            }
            continue;
        }
        const found = findRuleById(child, id);
        if (found) {
            return found;
        }
    }
    return undefined;
}

export function removeNodeById(root: QueryGroup, id: string, kind?: QueryNode["kind"]): boolean {
    const index = root.children.findIndex(
        (child) => child.id === id && (kind === undefined || child.kind === kind),
    );
    if (index >= 0) {
        root.children.splice(index, 1);
        return true;
    }
    for (const child of root.children) {
        if (child.kind === "group" && removeNodeById(child, id, kind)) {
            return true;
        }
    }
    return false;
}

export function countRules(root: QueryGroup, includeDisabled = true): number {
    let total = 0;
    for (const child of root.children) {
        if (child.kind === "rule") {
            if (includeDisabled || child.disabled !== true) {
                total += 1;
            }
            continue;
        }
        total += countRules(child, includeDisabled);
    }
    return total;
}

function isPlainRecord(value: unknown): value is object {
    return typeof value === "object" && value !== null;
}

function parseNode(value: unknown, issues: QueryAstIssue[]): QueryNode | undefined {
    if (!isPlainRecord(value)) {
        issues.push({ code: "invalid-node", message: "A query node must be an object" });
        return undefined;
    }

    const kind: unknown = Reflect.get(value, "kind");
    const id: unknown = Reflect.get(value, "id");
    if (typeof id !== "string" || id.length === 0) {
        issues.push({ code: "invalid-node", message: "A query node requires a string id" });
        return undefined;
    }

    if (kind === "group") {
        const combinator: unknown = Reflect.get(value, "combinator");
        const rawChildren: unknown = Reflect.get(value, "children");
        if (combinator !== "and" && combinator !== "or") {
            issues.push({
                code: "invalid-node",
                message: "A group combinator must be and or or",
                nodeId: id,
            });
            return undefined;
        }
        if (!Array.isArray(rawChildren)) {
            issues.push({
                code: "invalid-node",
                message: "A group requires a children array",
                nodeId: id,
            });
            return undefined;
        }

        const children: QueryNode[] = [];
        for (const rawChild of rawChildren) {
            const child = parseNode(rawChild, issues);
            if (!child) {
                return undefined;
            }
            children.push(child);
        }

        const negated: unknown = Reflect.get(value, "negated");
        const disabled: unknown = Reflect.get(value, "disabled");
        return {
            kind: "group",
            id,
            combinator,
            children,
            ...(typeof negated === "boolean" ? { negated } : {}),
            ...(typeof disabled === "boolean" ? { disabled } : {}),
        };
    }

    if (kind !== "rule") {
        issues.push({
            code: "invalid-node",
            message: "A query node kind must be rule or group",
            nodeId: id,
        });
        return undefined;
    }

    const field: unknown = Reflect.get(value, "field");
    const operator: unknown = Reflect.get(value, "operator");
    if (typeof field !== "string" || field.length === 0) {
        issues.push({ code: "invalid-node", message: "A rule requires a field id", nodeId: id });
        return undefined;
    }
    if (!isQueryOperator(operator)) {
        issues.push({
            code: "invalid-operator",
            message: `Unknown operator on rule ${id}`,
            nodeId: id,
        });
        return undefined;
    }

    const disabled: unknown = Reflect.get(value, "disabled");
    return {
        kind: "rule",
        id,
        field,
        operator,
        value: Reflect.get(value, "value"),
        ...(typeof disabled === "boolean" ? { disabled } : {}),
    };
}

export function serializeQuery(ast: QueryBuilderAst): string {
    return JSON.stringify(cloneQueryAst(ast));
}

export function parseQuery(raw: string): QueryBuilderAst {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (cause) {
        throw createError({
            code: "query_builder_parse_failed",
            message: "Query builder AST is not valid JSON",
            cause,
        });
    }

    const issues: QueryAstIssue[] = [];
    const node = parseNode(parsed, issues);
    if (!node || node.kind !== "group") {
        throw createError({
            code: "query_builder_parse_failed",
            message: "Query builder AST must be a group node",
            details: { issues },
        });
    }
    return node;
}

export function safeParseQuery(raw: string): QueryBuilderAst | undefined {
    try {
        return parseQuery(raw);
    } catch {
        return undefined;
    }
}

export function validateAst(
    ast: QueryBuilderAst,
    options: ValidateAstOptions = {},
): ValidateAstResult {
    const issues: QueryAstIssue[] = [];
    const maxDepth = options.maxDepth ?? 32;
    const fields = options.fields;
    const fieldsById = fields ? new Map(fields.map((field) => [field.id, field])) : undefined;
    const seenIds = new Set<string>();

    const walk = (node: QueryNode, depth: number, path: Set<QueryNode>): void => {
        if (path.has(node)) {
            issues.push({
                code: "circular-nesting",
                message: `Node ${node.id} is nested inside itself`,
                nodeId: node.id,
            });
            return;
        }

        if (seenIds.has(node.id)) {
            issues.push({
                code: "duplicate-node-id",
                message: `Duplicate node id ${node.id}`,
                nodeId: node.id,
            });
        } else {
            seenIds.add(node.id);
        }

        if (depth > maxDepth) {
            issues.push({
                code: "max-depth-exceeded",
                message: `Query nesting deeper than ${maxDepth} levels`,
                nodeId: node.id,
            });
            return;
        }

        if (node.kind === "group") {
            const nextPath = new Set(path);
            nextPath.add(node);
            for (const child of node.children) {
                walk(child, depth + 1, nextPath);
            }
            return;
        }

        if (!fieldsById) {
            return;
        }

        const field = fieldsById.get(node.field);
        if (!field) {
            issues.push({
                code: "unknown-field",
                message: `Unknown field ${node.field}`,
                nodeId: node.id,
            });
            return;
        }

        if (!operatorsForField(field).includes(node.operator)) {
            issues.push({
                code: "invalid-operator",
                message: `Operator ${node.operator} is not allowed on field ${field.id}`,
                nodeId: node.id,
            });
        }
    };

    walk(ast, 0, new Set());

    return { valid: issues.length === 0, issues };
}
