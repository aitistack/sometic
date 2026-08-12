export type QueryBuilderFieldType = "string" | "number" | "boolean" | "date" | "enum";

export type QueryOperator =
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
    | "isNotEmpty"
    | "isTrue"
    | "isFalse";

export type QueryCombinator = "and" | "or";

export type QueryFieldOption = {
    value: unknown;
    label?: string;
};

export type QueryBuilderField = {
    id: string;
    label?: string;
    type: QueryBuilderFieldType;
    operators?: QueryOperator[];
    options?: QueryFieldOption[];
    defaultValue?: unknown;
};

export type QueryRule = {
    kind: "rule";
    id: string;
    field: string;
    operator: QueryOperator;
    value: unknown;
    disabled?: boolean;
};

export type QueryGroup = {
    kind: "group";
    id: string;
    combinator: QueryCombinator;
    children: QueryNode[];
    negated?: boolean;
    disabled?: boolean;
};

export type QueryNode = QueryRule | QueryGroup;

export type QueryBuilderAst = QueryGroup;

export type QueryAstIssueCode =
    | "invalid-node"
    | "duplicate-node-id"
    | "circular-nesting"
    | "max-depth-exceeded"
    | "unknown-field"
    | "invalid-operator";

export type QueryAstIssue = {
    code: QueryAstIssueCode;
    message: string;
    nodeId?: string;
};

export type ValidateAstOptions = {
    fields?: QueryBuilderField[];
    maxDepth?: number;
};

export type ValidateAstResult = {
    valid: boolean;
    issues: QueryAstIssue[];
};

export type QueryRuleInit = {
    field?: string;
    operator?: QueryOperator;
    value?: unknown;
    disabled?: boolean;
};

export type QueryRulePatch = QueryRuleInit;

export type DataTableFilterLike = {
    id: string;
    value: unknown;
    operator?: Exclude<QueryOperator, "isTrue" | "isFalse">;
};

export type CreateQueryBuilderControllerOptions = {
    fields: QueryBuilderField[];
    value?: QueryBuilderAst;
    defaultValue?: QueryBuilderAst;
    onValueChange?: (value: QueryBuilderAst) => void;
    createNodeId?: () => string;
    maxDepth?: number;
};
