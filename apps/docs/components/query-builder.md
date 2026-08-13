# Query builder

Filter AST behavior from `@sometic/query-builder`: nested and/or groups, sixteen operators, validation with stable issue codes, JSON serialize and parse, and a bridge that turns the tree into [Data table](/components/data-table) filters. This is a query **builder** (a filter expression tree), not [Query](/utilities/query), which is the server-state cache.

::: tip System standout: table filter bridge
`toDataTableFilters` flattens the AST into portable `{ id, value, operator }` rows the data table already understands. One builder powers React, Vue, and Vanilla chrome without freezing a rule-row design.
:::

<PreviewQueryBuilder />

## Usage

::: code-group

```tsx [React]
// No dedicated React adapter for this surface. Use the engine from @sometic/query-builder (same API as Vanilla).
```

```vue [Vue]
<!-- No dedicated Vue adapter for this surface. Use the engine from @sometic/query-builder (same API as Vanilla). -->
```

```js [JS]
import {
    createQueryBuilderController,
    defaultOperatorsForFieldType,
    toDataTableFilters,
} from "@sometic/query-builder";

const builder = createQueryBuilderController({
    fields: [
        {
            id: "name",
            label: "Name",
            type: "string",
            operators: defaultOperatorsForFieldType("string"),
        },
        {
            id: "role",
            label: "Role",
            type: "string",
            operators: defaultOperatorsForFieldType("string"),
        },
    ],
});

builder.addRule(undefined, { field: "name", operator: "contains", value: "Person" });
builder.addRule(undefined, { field: "role", operator: "equals", value: "Admin" });

const unsubscribe = builder.subscribe((ast) => {
    console.log(builder.validate().valid, toDataTableFilters(ast));
});
```

```html [Vanilla]
<div id="rules"></div>
<button type="button" id="add">Add rule</button>
<pre id="output"></pre>

<script type="module">
    import {
        createQueryBuilderController,
        defaultOperatorsForFieldType,
        toDataTableFilters,
    } from "@sometic/query-builder";

    const host = document.querySelector("#rules");
    const output = document.querySelector("#output");

    const builder = createQueryBuilderController({
        fields: [
            {
                id: "name",
                label: "Name",
                type: "string",
                operators: defaultOperatorsForFieldType("string"),
            },
            {
                id: "role",
                label: "Role",
                type: "string",
                operators: defaultOperatorsForFieldType("string"),
            },
        ],
    });

    builder.addRule(undefined, { field: "name", operator: "contains", value: "Person" });

    const render = () => {
        host.replaceChildren();
        for (const child of builder.getValue().children) {
            if (child.kind !== "rule") {
                continue;
            }
            const row = document.createElement("div");
            const input = document.createElement("input");
            input.value = String(child.value ?? "");
            input.addEventListener("input", () => {
                builder.updateRule(child.id, { value: input.value });
            });
            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "Remove";
            remove.addEventListener("click", () => builder.removeRule(child.id));
            row.append(document.createTextNode(`${child.field} ${child.operator} `), input, remove);
            host.append(row);
        }
        output.textContent = JSON.stringify(toDataTableFilters(builder.getValue()), null, 2);
    };

    document.querySelector("#add").addEventListener("click", () => {
        builder.addRule(undefined, { field: "role", operator: "equals", value: "Admin" });
    });

    builder.subscribe(render);
    render();
</script>
```

```html [Custom Elements (Web Components)]
<!-- CE not shipped for this surface. Use React, Vue, or @sometic/dom (Vanilla) above. -->
```

```html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
```
:::

> Custom element not shipped for data surfaces in this beta; use the engine directly.

Query builder is **engine only**. There is no `QueryBuilder` component in `@sometic/react/data` or `@sometic/vue/data`, and no custom element: rule rows are too design specific to freeze. Import `@sometic/query-builder` directly from React, Vue, or Vanilla and render your own rows. The engine is the same in all three, which is why the Usage triad above shows the same calls.

## How it works

1. **AST**: the value is always a `QueryGroup` root (`{ kind: "group", combinator, children, negated?, disabled? }`) whose children are rules or nested groups. Rules are `{ kind: "rule", id, field, operator, value, disabled? }`.
2. **Controller (`createQueryBuilderController`)**: wraps the AST in controllable state (`value` / `defaultValue` / `onValueChange`), generates node ids through `createNodeId` (defaults to a prefixed id from `@sometic/core`), and enforces `maxDepth` when adding groups.
3. **Defaults**: `addRule` picks the first operator allowed for the field and a type-aware default value (empty string for `string`, `null` for `number` and `date`, first option for `enum`, `true` for `boolean`, `[]` for `in` and `notIn`).
4. **Validation (`validateAst`)**: returns `{ valid, issues }` with codes `invalid-node`, `duplicate-node-id`, `circular-nesting`, `max-depth-exceeded`, `unknown-field`, and `invalid-operator`, each with an optional `nodeId`.
5. **Serialization**: `serialize()` and `serializeQuery` produce JSON; `parseQuery` throws on malformed input and `safeParseQuery` returns `undefined` instead, which is what you want for URL or localStorage input.
6. **Bridge (`toDataTableFilters`)**: flattens the tree into `{ id, value, operator }` filters for the data table engine, skipping disabled nodes unless `includeDisabled: true`, and mapping `isTrue` / `isFalse` to `equals` with a boolean value.

## Anatomy

| Part          | Shape                 | Notes                                                         |
| ------------- | --------------------- | ------------------------------------------------------------- |
| Root group    | `QueryGroup`          | Always present, holds `combinator`                            |
| Rule          | `QueryRule`           | Field, operator, value, optional `disabled`                   |
| Nested group  | `QueryGroup`          | Created by `addGroup(parentId, combinator)`                   |
| Field catalog | `QueryBuilderField[]` | `id`, `label`, `type`, `operators`, `options`, `defaultValue` |
| Issue         | `QueryAstIssue`       | `code`, `message`, optional `nodeId`                          |

Because there is no shipped markup, you own the slots. The preview uses one row per rule with the field and operator as text, an input for the value, and a Remove button.

## Props / attributes

### `CreateQueryBuilderControllerOptions`

| Option          | Type                               | Default           | Description                                            |
| --------------- | ---------------------------------- | ----------------- | ------------------------------------------------------ |
| `fields`        | `QueryBuilderField[]`              | **required**      | Field catalog, drives allowed operators                |
| `value`         | `QueryBuilderAst`                  | -                 | Controlled AST                                         |
| `defaultValue`  | `QueryBuilderAst`                  | empty `and` group | Uncontrolled initial AST                               |
| `onValueChange` | `(value: QueryBuilderAst) => void` | -                 | Fires on every mutation                                |
| `createNodeId`  | `() => string`                     | prefixed id       | Deterministic ids for tests and SSR                    |
| `maxDepth`      | `number`                           | unlimited         | Rejects deeper groups and reports `max-depth-exceeded` |

### `QueryBuilderField`

| Field          | Type                                                    | Description                                      |
| -------------- | ------------------------------------------------------- | ------------------------------------------------ |
| `id`           | `string`                                                | Matches the rule `field` and the table column id |
| `label`        | `string`                                                | Display label, falls back to `id`                |
| `type`         | `"string" \| "number" \| "boolean" \| "date" \| "enum"` | Drives default operators and default values      |
| `operators`    | `QueryOperator[]`                                       | Allowed operators, defaults per type             |
| `options`      | `{ value: unknown; label?: string }[]`                  | Choices for `enum` fields                        |
| `defaultValue` | `unknown`                                               | Overrides the type default for new rules         |

### Controller API

| Member                                        | Description                                         |
| --------------------------------------------- | --------------------------------------------------- |
| `getValue()` / `setValue(ast)`                | Read or replace the whole tree                      |
| `getFields()` / `getOperatorsForField(id)`    | Field catalog and allowed operators                 |
| `addRule(groupId?, init?)`                    | Adds to the root or a group, returns the new rule   |
| `updateRule(ruleId, patch)`                   | Patch `field`, `operator`, `value`, or `disabled`   |
| `removeRule(ruleId)` / `removeGroup(groupId)` | Returns `false` when the id is unknown              |
| `addGroup(parentGroupId?, combinator?)`       | Nested group, respects `maxDepth`                   |
| `setCombinator(groupId, combinator)`          | Switch a group between `and` and `or`               |
| `setRuleDisabled(ruleId, disabled)`           | Keeps the rule visible but out of the filter output |
| `clear()`                                     | Resets to an empty root group                       |
| `validate()`                                  | `{ valid, issues }`                                 |
| `serialize()`                                 | JSON string of the current AST                      |
| `subscribe(listener)`                         | Called with the new AST on every change             |
| `dispose()` / `disposed`                      | Releases listeners                                  |

### Helpers

`defaultOperatorsForFieldType`, `operatorsForField`, `operatorNeedsValue`, `isQueryOperator`, `createEmptyGroup`, `cloneQueryAst`, `cloneQueryNode`, `findRuleById`, `findGroupById`, `removeNodeById`, `countRules`, `serializeQuery`, `parseQuery`, `safeParseQuery`, `validateAst`, `toDataTableFilters`.

### Custom element

**CE not shipped.** Compose the engine in your own component.

## Events / callbacks

| Surface        | Event                 | Payload           |
| -------------- | --------------------- | ----------------- |
| Engine         | `onValueChange`       | `QueryBuilderAst` |
| Engine         | `subscribe(listener)` | `QueryBuilderAst` |
| React / Vue    | your own props        | -                 |
| Custom element | -                     | -                 |

Every mutating method (`addRule`, `updateRule`, `removeRule`, `addGroup`, `removeGroup`, `setCombinator`, `setRuleDisabled`, `clear`, `setValue`) triggers one notification with the next tree.

## Controlled vs uncontrolled

- **Uncontrolled**: pass `defaultValue` (or nothing) and read `getValue()` after each `subscribe` call. This is the common case for a builder panel.
- **Controlled**: pass `value` plus `onValueChange` and keep the AST in your store, router, or saved-view record. Mutations call `onValueChange` with the next tree and do not mutate your object in place.
- **Round trips**: persist with `serialize()` and restore with `safeParseQuery` plus `setValue`. Pair with `validate()` so a stale saved view with removed fields surfaces `unknown-field` instead of silently filtering nothing.

## Accessibility

The engine emits no DOM, so accessibility is yours to compose, and these are the rules the demos follow:

- Give each rule row a group label (`role="group"` with `aria-label`, or a fieldset and legend) so the field, operator, and value controls read as one unit.
- Label the field and operator selects; never rely on position alone.
- Announce structural changes. Adding or removing a rule should move focus to the new row or to the add button, and a polite live region can report the rule count.
- Combinator switches (and / or) are best as radio groups or a toggle with `aria-pressed`, not as unlabeled buttons.
- `operatorNeedsValue(operator)` tells you when to hide the value input (`isEmpty`, `isNotEmpty`, `isTrue`, `isFalse`). Hide it rather than leaving a disabled input that traps screen reader focus.
- Surface `validate()` issues near the offending row using `aria-describedby`, and keep `nodeId` so you can map an issue back to its rule.

## Styling

No classes, no attributes, no CSS from the package. Style your own rows and groups. A useful convention is to mirror the Sometic data attributes yourself, for example `data-slot="rule"`, `data-slot="group"`, `data-combinator="and"`, and `data-disabled` on paused rules, so the same CSS works in every framework.

## Edge cases

- **Unknown ids**: `updateRule`, `removeRule`, `removeGroup`, `setCombinator`, and `setRuleDisabled` return `false` instead of throwing, which keeps optimistic UI safe after a concurrent removal.
- **Unknown field on `addRule`**: returns `undefined`; nothing is added.
- **Operator not allowed for the field**: `validate()` reports `invalid-operator` rather than silently coercing.
- **Changing field type**: patch `field` and `operator` together, otherwise a string operator can stay attached to a number field.
- **`maxDepth`**: `addGroup` refuses to exceed it and `validateAst` reports `max-depth-exceeded` for imported trees.
- **Duplicate ids or cycles** in imported JSON are reported as `duplicate-node-id` and `circular-nesting`.
- **Disabled nodes**: disabling a group disables its whole subtree for `toDataTableFilters`. Use `includeDisabled: true` when you want a preview of the paused rules.
- **Empty tree**: `toDataTableFilters` returns `[]`, which the data table treats as no filtering.
- **`in` and `notIn`**: default to `[]`. Keep the value an array or `matchesFilterValue` will never match.
- **`parseQuery` on bad JSON** throws a typed error; use `safeParseQuery` for URL and storage input.
- **Groups flatten in the bridge**: `toDataTableFilters` produces a flat AND-shaped filter list. Send the AST itself to your backend when or-groups must be preserved.
- **SSR**: no browser globals. Pass `createNodeId` for stable server and client ids if you serialize the tree during hydration.

## Performance notes

The AST is cloned on read and write, so trees stay immutable for change detection at the cost of copying. That is cheap for the tens or hundreds of rules a human writes, and it is not designed for machine-generated trees with thousands of nodes. `validate()` and `toDataTableFilters` walk the tree, so call them on change rather than in a render loop. Debounce value inputs that hit a network. The package depends only on `@sometic/core`; its gzip budget lives in `packages/query-builder/package.json`.

## When to use / When not

**Use** when users compose filters themselves (saved views, segments, audience rules, admin search) and you need one behavior model plus one serialized format across React, Vue, and Vanilla.

**Do not use** for a fixed set of two or three filter inputs (drive `setFilters` on the data table directly), for full SQL authoring, or for caching and deduplicating requests. That is [Query](/utilities/query).

**Vs react-querybuilder.** Prefer react-querybuilder when you want a React-only visual builder with batteries included. Sometic Query builder is an AST engine (validate, serialize, `toDataTableFilters`) without a frozen rule-row design: bring your own selects and layout.

## FAQ

**Is this the same as `@sometic/query`?** No. `@sometic/query` is the server-state cache (fetch, cache, revalidate). `@sometic/query-builder` produces a filter expression tree. They compose well: build the AST, convert it, fetch with the cache.

**Why is there no React or Vue component?** Rule rows are the most design-specific surface in this family (field pickers, operator pickers, value editors per type). Freezing that markup would be worse than shipping an engine you drive from any framework. The engine is identical in all of them.

**How do I feed the result to the data table?** `toDataTableFilters(builder.getValue())` returns entries shaped like `DataTableFilter`. Pass them to `setFilters` or the `filters` prop. Field ids must match column ids.

**Are or-groups preserved when converting?** No. The bridge flattens to a filter list that the client-side table engine applies with AND semantics. Send the AST to your API when you need real or-logic server side.

**How do I persist a saved view?** `serialize()` to JSON, store it, then `safeParseQuery` and `setValue` on load. Run `validate({ fields })` afterwards so removed columns become visible `unknown-field` issues.

**Can I keep a rule around without applying it?** Yes. `setRuleDisabled(id, true)` keeps it in the tree and out of `toDataTableFilters`, which is the usual "temporarily off" toggle.

**Which operators exist?** `equals`, `notEquals`, `contains`, `notContains`, `startsWith`, `endsWith`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `in`, `notIn`, `isEmpty`, `isNotEmpty`, `isTrue`, `isFalse`. `defaultOperatorsForFieldType` narrows them per field type.

**How do I get deterministic ids in tests?** Pass `createNodeId`, for example a counter, so snapshots stay stable.

**Does it validate values?** It validates structure, fields, and operators. Value shape is yours: use [Validation](/primitives/validation) if a rule value needs its own rules.

## Related links

- [Data table](/components/data-table)
- [Query](/utilities/query)
- [Validation](/primitives/validation)
- [Controlled state](/concepts/controlled-state)
- [Beta maturity](/releases/beta)
