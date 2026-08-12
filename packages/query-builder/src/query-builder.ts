import { createControllableState } from "@sometic/core/controllable-state";
import { createDisposable } from "@sometic/core/disposable";
import { createPrefixedId } from "@sometic/core/id";
import {
    cloneQueryAst,
    createEmptyGroup,
    findGroupById,
    findRuleById,
    operatorsForField,
    removeNodeById,
    serializeQuery,
    validateAst,
} from "./ast.js";
import type {
    CreateQueryBuilderControllerOptions,
    QueryBuilderAst,
    QueryBuilderField,
    QueryCombinator,
    QueryGroup,
    QueryOperator,
    QueryRule,
    QueryRuleInit,
    QueryRulePatch,
    ValidateAstResult,
} from "./types.js";

export type QueryBuilderController = {
    getValue(): QueryBuilderAst;
    setValue(value: QueryBuilderAst): void;
    getFields(): QueryBuilderField[];
    getOperatorsForField(fieldId: string): QueryOperator[];
    addRule(groupId?: string, init?: QueryRuleInit): QueryRule | undefined;
    removeRule(ruleId: string): boolean;
    updateRule(ruleId: string, patch: QueryRulePatch): boolean;
    addGroup(parentGroupId?: string, combinator?: QueryCombinator): QueryGroup | undefined;
    removeGroup(groupId: string): boolean;
    setCombinator(groupId: string, combinator: QueryCombinator): boolean;
    setRuleDisabled(ruleId: string, disabled: boolean): boolean;
    clear(): void;
    validate(): ValidateAstResult;
    serialize(): string;
    subscribe(listener: (value: QueryBuilderAst) => void): () => void;
    readonly disposed: boolean;
    dispose(): void;
};

function defaultValueForField(field: QueryBuilderField, operator: QueryOperator): unknown {
    if (field.defaultValue !== undefined) {
        return field.defaultValue;
    }
    if (operator === "in" || operator === "notIn") {
        return [];
    }
    switch (field.type) {
        case "number":
            return null;
        case "boolean":
            return operator === "isFalse" ? false : true;
        case "enum":
            return field.options?.[0]?.value ?? null;
        case "date":
            return null;
        case "string":
            return "";
    }
}

export function createQueryBuilderController(
    options: CreateQueryBuilderControllerOptions,
): QueryBuilderController {
    const fields = options.fields.slice();
    const fieldsById = new Map(fields.map((field) => [field.id, field]));
    const createNodeId = options.createNodeId ?? (() => createPrefixedId("node"));
    const listeners = new Set<(value: QueryBuilderAst) => void>();

    const state = createControllableState<QueryBuilderAst>({
        defaultValue: options.defaultValue
            ? cloneQueryAst(options.defaultValue)
            : createEmptyGroup("and", createNodeId),
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });

    const disposable = createDisposable(() => {
        listeners.clear();
    });

    const commit = (next: QueryBuilderAst): void => {
        state.set(next);
        for (const listener of Array.from(listeners)) {
            listener(state.get());
        }
    };

    const draft = (): QueryBuilderAst => cloneQueryAst(state.get());

    return {
        get disposed() {
            return disposable.disposed;
        },
        getValue() {
            return cloneQueryAst(state.get());
        },
        setValue(value) {
            commit(cloneQueryAst(value));
        },
        getFields() {
            return fields.map((field) => ({ ...field }));
        },
        getOperatorsForField(fieldId) {
            const field = fieldsById.get(fieldId);
            if (!field) {
                return [];
            }
            return operatorsForField(field);
        },
        addRule(groupId, init) {
            const next = draft();
            const group = groupId === undefined ? next : findGroupById(next, groupId);
            if (!group) {
                return undefined;
            }

            const fieldId = init?.field ?? fields[0]?.id;
            if (fieldId === undefined) {
                return undefined;
            }
            const field = fieldsById.get(fieldId);
            if (!field) {
                return undefined;
            }

            const allowed = operatorsForField(field);
            const operator = init?.operator ?? allowed[0];
            if (operator === undefined || !allowed.includes(operator)) {
                return undefined;
            }

            const rule: QueryRule = {
                kind: "rule",
                id: createNodeId(),
                field: field.id,
                operator,
                value:
                    init?.value === undefined ? defaultValueForField(field, operator) : init.value,
                ...(init?.disabled === undefined ? {} : { disabled: init.disabled }),
            };

            group.children.push(rule);
            commit(next);
            return { ...rule };
        },
        removeRule(ruleId) {
            const next = draft();
            if (!removeNodeById(next, ruleId, "rule")) {
                return false;
            }
            commit(next);
            return true;
        },
        updateRule(ruleId, patch) {
            const next = draft();
            const rule = findRuleById(next, ruleId);
            if (!rule) {
                return false;
            }

            const previousField = rule.field;
            const fieldId = patch.field ?? previousField;
            const field = fieldsById.get(fieldId);
            if (!field) {
                return false;
            }

            const allowed = operatorsForField(field);
            let operator = patch.operator ?? rule.operator;
            if (!allowed.includes(operator)) {
                if (patch.operator !== undefined) {
                    return false;
                }
                const fallback = allowed[0];
                if (fallback === undefined) {
                    return false;
                }
                operator = fallback;
            }

            rule.field = field.id;
            rule.operator = operator;
            if (patch.value !== undefined) {
                rule.value = patch.value;
            } else if (field.id !== previousField) {
                rule.value = defaultValueForField(field, operator);
            }
            if (patch.disabled !== undefined) {
                rule.disabled = patch.disabled;
            }

            commit(next);
            return true;
        },
        addGroup(parentGroupId, combinator = "and") {
            const next = draft();
            const parent = parentGroupId === undefined ? next : findGroupById(next, parentGroupId);
            if (!parent) {
                return undefined;
            }

            const depthLimit = options.maxDepth;
            if (depthLimit !== undefined && depthOf(next, parent.id) >= depthLimit) {
                return undefined;
            }

            const group = createEmptyGroup(combinator, createNodeId);
            parent.children.push(group);
            commit(next);
            return { ...group, children: [] };
        },
        removeGroup(groupId) {
            if (state.get().id === groupId) {
                return false;
            }
            const next = draft();
            if (!removeNodeById(next, groupId, "group")) {
                return false;
            }
            commit(next);
            return true;
        },
        setCombinator(groupId, combinator) {
            const next = draft();
            const group = findGroupById(next, groupId);
            if (!group) {
                return false;
            }
            group.combinator = combinator;
            commit(next);
            return true;
        },
        setRuleDisabled(ruleId, disabled) {
            const next = draft();
            const rule = findRuleById(next, ruleId);
            if (!rule) {
                return false;
            }
            rule.disabled = disabled;
            commit(next);
            return true;
        },
        clear() {
            const current = state.get();
            commit({
                kind: "group",
                id: current.id,
                combinator: current.combinator,
                children: [],
            });
        },
        validate() {
            return validateAst(state.get(), {
                fields,
                ...(options.maxDepth === undefined ? {} : { maxDepth: options.maxDepth }),
            });
        },
        serialize() {
            return serializeQuery(state.get());
        },
        subscribe(listener) {
            if (disposable.disposed) {
                return () => {};
            }
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            disposable.dispose();
        },
    };
}

function depthOf(root: QueryGroup, groupId: string, depth = 0): number {
    if (root.id === groupId) {
        return depth;
    }
    for (const child of root.children) {
        if (child.kind !== "group") {
            continue;
        }
        const found = depthOf(child, groupId, depth + 1);
        if (found >= 0) {
            return found;
        }
    }
    return -1;
}
