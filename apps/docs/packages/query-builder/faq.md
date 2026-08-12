# Query builder FAQ

## How do I install it?

```bash
pnpm add @sometic/query-builder
```

Depends on `@sometic/core`. No React component in this beta; use `createQueryBuilderController` from JS/TS/Vanilla.

## How do fields and operators relate?

Each `QueryBuilderField` has a `type` (`string`, `number`, `boolean`, `date`, `enum`). Default operators come from `defaultOperatorsForFieldType` / `operatorsForField`. Override with `operators`.

## How do I feed a data table?

```ts
import { toDataTableFilters } from "@sometic/query-builder";

table.setFilters(toDataTableFilters(builder.getValue()));
```

`isTrue` / `isFalse` map to equals true/false. Disabled rules are skipped unless `includeDisabled: true`.

## Can I nest groups?

Yes. `addGroup` nests under a parent. `validate({ maxDepth })` / controller `maxDepth` reject excessive nesting.

## Serialize for storage?

`serializeQuery` / `parseQuery` / `safeParseQuery`. Prefer safe parse at trust boundaries.

## Controlled AST?

Pass `value` + `onValueChange`. Otherwise use `defaultValue` or the empty `and` group.

## SSR?

Pure engine; safe to import. Create controllers per session/request as needed; dispose when done.

## Accessibility?

You own the UI. Label field/operator/value controls and keep remove actions clear.

## Security?

Treat AST from the client as untrusted. Re-validate operators/fields server-side before querying a database.

## Why not a full SQL builder?

Scope is product filters, not arbitrary SQL. See [comparison](./comparison).
