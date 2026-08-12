# `@sometic/query-builder`

Filter and query **AST** builder for Sometic: nested `and` / `or` groups, per-field operator catalogs, JSON serialize and parse, validation, and a bridge that turns a query into [`@sometic/data-table`](https://www.npmjs.com/package/@sometic/data-table) filters.

This is not [`@sometic/query`](https://www.npmjs.com/package/@sometic/query). That package is the server-state cache for fetching and invalidating data. This package models the _user built filter_ that a person edits in an advanced search panel, then hands to a table, an API, or your own SQL layer.

`createQueryBuilderController` owns an immutable AST. Every mutation clones, applies, and commits, so subscribers always receive a fresh value and callers cannot corrupt internal state by holding a reference. Operators are validated against the field catalog, so a string field can never end up with a numeric comparison.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only. No browser globals at import time, so it works in SSR and Node.

Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [https://sometic.aitistack.com](https://sometic.aitistack.com).

## Install

```bash
pnpm add @sometic/query-builder
```

```bash
npm install @sometic/query-builder
```

```bash
yarn add @sometic/query-builder
```

## Usage

Build a filter and feed a data table:

```ts
import { createQueryBuilderController, toDataTableFilters } from "@sometic/query-builder";

const builder = createQueryBuilderController({
    fields: [
        { id: "name", label: "Name", type: "string" },
        { id: "age", label: "Age", type: "number" },
        { id: "active", label: "Active", type: "boolean" },
    ],
});

const rule = builder.addRule(undefined, { field: "name", operator: "contains", value: "ada" });
const group = builder.addGroup(undefined, "or");
builder.addRule(group?.id, { field: "age", operator: "greaterThan", value: 30 });

table.setFilters(toDataTableFilters(builder.getValue()));
```

Persist and restore a saved view:

```ts
import { parseQuery, serializeQuery, validateAst } from "@sometic/query-builder";

const saved = serializeQuery(builder.getValue());
const restored = parseQuery(saved);

const result = validateAst(restored, { fields });
if (!result.valid) {
    console.warn(result.issues);
}
```

Disable a rule without deleting it:

```ts
builder.setRuleDisabled(rule.id, true);
```

## API

- Types: `QueryBuilderFieldType`, `QueryOperator`, `QueryCombinator`, `QueryRule`, `QueryGroup`, `QueryNode`, `QueryBuilderAst`, `QueryBuilderField`.
- `createQueryBuilderController({ fields, value?, defaultValue?, onValueChange?, createNodeId?, maxDepth? })` exposes `getValue`, `setValue`, `getFields`, `getOperatorsForField`, `addRule`, `removeRule`, `updateRule`, `addGroup`, `removeGroup`, `setCombinator`, `setRuleDisabled`, `clear`, `validate`, `serialize`, `subscribe`, `dispose`.
- `serializeQuery(ast)` and `parseQuery(raw)`; `safeParseQuery(raw)` returns `undefined` instead of throwing.
- `validateAst(ast, { fields?, maxDepth? })` returns `{ valid, issues }`. An empty group is valid. Unknown fields, operators a field does not allow, duplicate node ids, self nesting, and over deep nesting are reported as issues.
- `toDataTableFilters(ast, { includeDisabled? })` flattens enabled rules and maps `isTrue` and `isFalse` onto equality filters.

## When not to use

Skip it for a single search input: keep one piece of state instead. Prefer a server side query language when the filter must express joins, aggregates, or window functions. This package does not execute queries, so pair it with `@sometic/data-table` for client filtering or with your own backend translation layer.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Query cache](https://sometic.aitistack.com/utilities/query)

## License

MIT
