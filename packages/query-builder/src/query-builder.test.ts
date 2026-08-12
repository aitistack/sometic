import { describe, expect, it, vi } from "vitest";
import {
    countRules,
    createEmptyGroup,
    defaultOperatorsForFieldType,
    isQueryOperator,
    operatorNeedsValue,
    parseQuery,
    safeParseQuery,
    serializeQuery,
    validateAst,
} from "./ast.js";
import { createQueryBuilderController } from "./query-builder.js";
import { toDataTableFilters } from "./bridge.js";
import type { QueryBuilderAst, QueryBuilderField } from "./types.js";

const fields: QueryBuilderField[] = [
    { id: "name", label: "Name", type: "string" },
    { id: "age", label: "Age", type: "number" },
    { id: "active", label: "Active", type: "boolean" },
    { id: "role", label: "Role", type: "enum", options: [{ value: "admin" }, { value: "user" }] },
];

function createIdFactory(): () => string {
    let counter = 0;
    return () => {
        counter += 1;
        return `n${counter}`;
    };
}

function createController(
    overrides: Partial<Parameters<typeof createQueryBuilderController>[0]> = {},
) {
    return createQueryBuilderController({
        fields,
        createNodeId: createIdFactory(),
        ...overrides,
    });
}

describe("query builder ast helpers", () => {
    it("treats an empty group as valid", () => {
        const ast = createEmptyGroup("and", () => "root");
        expect(validateAst(ast, { fields })).toEqual({ valid: true, issues: [] });
        expect(countRules(ast)).toBe(0);
    });

    it("exposes default operators per field type", () => {
        expect(defaultOperatorsForFieldType("boolean")).toEqual(["isTrue", "isFalse"]);
        expect(defaultOperatorsForFieldType("number")).toContain("greaterThan");
        expect(defaultOperatorsForFieldType("enum")).toContain("in");
        expect(isQueryOperator("contains")).toBe(true);
        expect(isQueryOperator("sortOf")).toBe(false);
        expect(operatorNeedsValue("isEmpty")).toBe(false);
        expect(operatorNeedsValue("equals")).toBe(true);
    });

    it("rejects an operator the field does not allow", () => {
        const ast: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "and",
            children: [
                { kind: "rule", id: "r1", field: "name", operator: "greaterThan", value: "a" },
            ],
        };

        const result = validateAst(ast, { fields });
        expect(result.valid).toBe(false);
        expect(result.issues).toEqual([
            {
                code: "invalid-operator",
                message: "Operator greaterThan is not allowed on field name",
                nodeId: "r1",
            },
        ]);
    });

    it("reports unknown fields and duplicate node ids", () => {
        const ast: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "and",
            children: [
                { kind: "rule", id: "dup", field: "ghost", operator: "equals", value: 1 },
                { kind: "rule", id: "dup", field: "age", operator: "equals", value: 1 },
            ],
        };

        const result = validateAst(ast, { fields });
        expect(result.valid).toBe(false);
        expect(result.issues.map((issue) => issue.code)).toEqual([
            "unknown-field",
            "duplicate-node-id",
        ]);
    });

    it("detects circular nesting instead of recursing forever", () => {
        const root: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "and",
            children: [],
        };
        const child: QueryBuilderAst = {
            kind: "group",
            id: "child",
            combinator: "or",
            children: [root],
        };
        root.children.push(child);

        const result = validateAst(root, { fields });
        expect(result.valid).toBe(false);
        expect(result.issues.some((issue) => issue.code === "circular-nesting")).toBe(true);
    });

    it("flags nesting deeper than the configured maximum", () => {
        let node: QueryBuilderAst = { kind: "group", id: "leaf", combinator: "and", children: [] };
        for (let depth = 0; depth < 5; depth += 1) {
            node = { kind: "group", id: `g${depth}`, combinator: "and", children: [node] };
        }

        const result = validateAst(node, { fields, maxDepth: 2 });
        expect(result.valid).toBe(false);
        expect(result.issues.some((issue) => issue.code === "max-depth-exceeded")).toBe(true);
    });

    it("round trips through serialize and parse", () => {
        const ast: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "or",
            negated: true,
            children: [
                { kind: "rule", id: "r1", field: "name", operator: "contains", value: "ada" },
                {
                    kind: "group",
                    id: "g1",
                    combinator: "and",
                    children: [
                        {
                            kind: "rule",
                            id: "r2",
                            field: "age",
                            operator: "greaterThanOrEqual",
                            value: 18,
                            disabled: true,
                        },
                    ],
                },
            ],
        };

        const parsed = parseQuery(serializeQuery(ast));
        expect(parsed).toEqual(ast);
        expect(parsed).not.toBe(ast);
        expect(countRules(parsed)).toBe(2);
        expect(countRules(parsed, false)).toBe(1);
    });

    it("throws typed errors for malformed input", () => {
        expect(() => parseQuery("{")).toThrow(/valid JSON/);
        expect(() => parseQuery(JSON.stringify({ kind: "rule", id: "r1" }))).toThrow(/group node/);
        expect(() => parseQuery(JSON.stringify({ kind: "group", id: "g" }))).toThrow(/group node/);
        expect(() =>
            parseQuery(
                JSON.stringify({
                    kind: "group",
                    id: "g",
                    combinator: "and",
                    children: [{ kind: "rule", id: "r", field: "name", operator: "nope" }],
                }),
            ),
        ).toThrow(/group node/);
        expect(safeParseQuery("nope")).toBeUndefined();
    });
});

describe("createQueryBuilderController", () => {
    it("starts with an empty and group", () => {
        const controller = createController();
        const value = controller.getValue();
        expect(value.combinator).toBe("and");
        expect(value.children).toEqual([]);
        expect(controller.validate().valid).toBe(true);
        controller.dispose();
    });

    it("adds rules with catalog defaults", () => {
        const controller = createController();
        const rule = controller.addRule();

        expect(rule).toMatchObject({ field: "name", operator: "equals", value: "" });
        expect(controller.getValue().children).toHaveLength(1);

        const numeric = controller.addRule(undefined, { field: "age", operator: "greaterThan" });
        expect(numeric).toMatchObject({ field: "age", operator: "greaterThan", value: null });

        const enumRule = controller.addRule(undefined, { field: "role" });
        expect(enumRule).toMatchObject({ field: "role", operator: "equals", value: "admin" });

        const listRule = controller.addRule(undefined, { field: "role", operator: "in" });
        expect(listRule?.value).toEqual([]);

        const boolRule = controller.addRule(undefined, { field: "active" });
        expect(boolRule).toMatchObject({ operator: "isTrue", value: true });
        controller.dispose();
    });

    it("refuses rules for unknown fields, unknown groups, and disallowed operators", () => {
        const controller = createController();

        expect(controller.addRule("missing-group")).toBeUndefined();
        expect(controller.addRule(undefined, { field: "ghost" })).toBeUndefined();
        expect(
            controller.addRule(undefined, { field: "name", operator: "greaterThan" }),
        ).toBeUndefined();
        expect(controller.getValue().children).toEqual([]);
        controller.dispose();
    });

    it("returns undefined when the catalog is empty", () => {
        const controller = createQueryBuilderController({
            fields: [],
            createNodeId: createIdFactory(),
        });
        expect(controller.addRule()).toBeUndefined();
        expect(controller.getOperatorsForField("name")).toEqual([]);
        controller.dispose();
    });

    it("updates rules and resets the value when the field changes", () => {
        const controller = createController();
        const rule = controller.addRule(undefined, { field: "name", value: "ada" });
        expect(rule).toBeDefined();
        const ruleId = rule?.id ?? "";

        expect(controller.updateRule(ruleId, { value: "grace" })).toBe(true);
        expect(controller.getValue().children[0]).toMatchObject({ value: "grace" });

        expect(controller.updateRule(ruleId, { field: "age" })).toBe(true);
        expect(controller.getValue().children[0]).toMatchObject({
            field: "age",
            operator: "equals",
            value: null,
        });

        expect(controller.updateRule(ruleId, { operator: "contains" })).toBe(false);
        expect(controller.updateRule("nope", { value: 1 })).toBe(false);
        expect(controller.updateRule(ruleId, { field: "ghost" })).toBe(false);
        controller.dispose();
    });

    it("falls back to an allowed operator when the field switch invalidates it", () => {
        const controller = createController();
        const rule = controller.addRule(undefined, { field: "name", operator: "contains" });
        const ruleId = rule?.id ?? "";

        expect(controller.updateRule(ruleId, { field: "active" })).toBe(true);
        expect(controller.getValue().children[0]).toMatchObject({
            field: "active",
            operator: "isTrue",
        });
        controller.dispose();
    });

    it("toggles disabled rules and keeps them in the ast", () => {
        const controller = createController();
        const rule = controller.addRule();
        const ruleId = rule?.id ?? "";

        expect(controller.setRuleDisabled(ruleId, true)).toBe(true);
        expect(controller.getValue().children[0]).toMatchObject({ disabled: true });
        expect(countRules(controller.getValue(), false)).toBe(0);

        expect(controller.setRuleDisabled("nope", true)).toBe(false);
        controller.dispose();
    });

    it("nests groups, switches combinators, and removes nodes", () => {
        const controller = createController();
        const group = controller.addGroup(undefined, "or");
        expect(group?.combinator).toBe("or");
        const groupId = group?.id ?? "";

        const nested = controller.addRule(groupId, {
            field: "age",
            operator: "lessThan",
            value: 5,
        });
        expect(nested).toBeDefined();
        expect(controller.getValue().children).toHaveLength(1);
        expect(countRules(controller.getValue())).toBe(1);

        expect(controller.setCombinator(groupId, "and")).toBe(true);
        expect(controller.setCombinator("nope", "or")).toBe(false);

        expect(controller.removeRule(nested?.id ?? "")).toBe(true);
        expect(countRules(controller.getValue())).toBe(0);
        expect(controller.removeRule("nope")).toBe(false);

        expect(controller.removeGroup(groupId)).toBe(true);
        expect(controller.getValue().children).toEqual([]);
        expect(controller.removeGroup(controller.getValue().id)).toBe(false);
        controller.dispose();
    });

    it("does not let removeRule delete groups or removeGroup delete rules", () => {
        const controller = createController();
        const group = controller.addGroup();
        const rule = controller.addRule();

        expect(controller.removeRule(group?.id ?? "")).toBe(false);
        expect(controller.removeGroup(rule?.id ?? "")).toBe(false);
        expect(controller.getValue().children).toHaveLength(2);
        controller.dispose();
    });

    it("honors a maximum nesting depth for new groups", () => {
        const controller = createController({ maxDepth: 1 });
        const first = controller.addGroup();
        expect(first).toBeDefined();
        expect(controller.addGroup(first?.id ?? "")).toBeUndefined();
        controller.dispose();
    });

    it("notifies subscribers and stops after unsubscribe and dispose", () => {
        const controller = createController();
        const listener = vi.fn();
        const unsubscribe = controller.subscribe(listener);

        controller.addRule();
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        controller.addRule();
        expect(listener).toHaveBeenCalledTimes(1);

        const second = vi.fn();
        controller.subscribe(second);
        controller.dispose();
        controller.addRule();
        expect(second).not.toHaveBeenCalled();
        expect(controller.disposed).toBe(true);
        expect(controller.subscribe(vi.fn())).toBeTypeOf("function");
    });

    it("keeps controlled values immutable and reports changes", () => {
        const onValueChange = vi.fn();
        const value: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "and",
            children: [],
        };
        const controller = createQueryBuilderController({
            fields,
            value,
            onValueChange,
            createNodeId: createIdFactory(),
        });

        controller.addRule();
        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(value.children).toEqual([]);
        expect(controller.getValue().children).toEqual([]);
        controller.dispose();
    });

    it("clears children while keeping the root identity", () => {
        const controller = createController();
        controller.addRule();
        controller.addGroup();
        const rootId = controller.getValue().id;

        controller.clear();
        expect(controller.getValue()).toEqual({
            kind: "group",
            id: rootId,
            combinator: "and",
            children: [],
        });
        controller.dispose();
    });

    it("serializes, validates, and replaces the whole value", () => {
        const controller = createController();
        controller.addRule(undefined, { field: "name", value: "ada" });

        const serialized = controller.serialize();
        expect(parseQuery(serialized).children).toHaveLength(1);

        const replacement: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "or",
            children: [{ kind: "rule", id: "r1", field: "ghost", operator: "equals", value: 1 }],
        };
        controller.setValue(replacement);
        expect(controller.getValue().combinator).toBe("or");
        expect(controller.validate().valid).toBe(false);
        controller.dispose();
    });

    it("exposes the field catalog and its operators as copies", () => {
        const controller = createController();
        const catalog = controller.getFields();
        catalog[0] = { id: "mutated", type: "string" };

        expect(controller.getFields()[0]?.id).toBe("name");
        expect(controller.getOperatorsForField("name")).toContain("startsWith");
        expect(controller.getOperatorsForField("ghost")).toEqual([]);
        controller.dispose();
    });
});

describe("toDataTableFilters", () => {
    it("flattens enabled rules into table filters", () => {
        const ast: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "and",
            children: [
                { kind: "rule", id: "r1", field: "name", operator: "contains", value: "ada" },
                {
                    kind: "group",
                    id: "g1",
                    combinator: "or",
                    children: [
                        {
                            kind: "rule",
                            id: "r2",
                            field: "age",
                            operator: "greaterThan",
                            value: 30,
                        },
                        {
                            kind: "rule",
                            id: "r3",
                            field: "name",
                            operator: "startsWith",
                            value: "z",
                            disabled: true,
                        },
                    ],
                },
            ],
        };

        expect(toDataTableFilters(ast)).toEqual([
            { id: "name", value: "ada", operator: "contains" },
            { id: "age", value: 30, operator: "greaterThan" },
        ]);

        expect(toDataTableFilters(ast, { includeDisabled: true })).toHaveLength(3);
    });

    it("maps boolean operators onto equality filters", () => {
        const ast: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "and",
            children: [
                { kind: "rule", id: "r1", field: "active", operator: "isTrue", value: null },
                { kind: "rule", id: "r2", field: "active", operator: "isFalse", value: null },
            ],
        };

        expect(toDataTableFilters(ast)).toEqual([
            { id: "active", value: true, operator: "equals" },
            { id: "active", value: false, operator: "equals" },
        ]);
    });

    it("skips every rule inside a disabled group", () => {
        const ast: QueryBuilderAst = {
            kind: "group",
            id: "root",
            combinator: "and",
            children: [
                {
                    kind: "group",
                    id: "g1",
                    combinator: "and",
                    disabled: true,
                    children: [
                        { kind: "rule", id: "r1", field: "name", operator: "equals", value: "x" },
                    ],
                },
            ],
        };

        expect(toDataTableFilters(ast)).toEqual([]);
        expect(
            toDataTableFilters({ kind: "group", id: "e", combinator: "and", children: [] }),
        ).toEqual([]);
    });
});
