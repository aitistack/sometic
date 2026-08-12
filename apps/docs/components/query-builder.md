# Query builder

Filter AST builder. Distinct from @sometic/query (server-state cache).

## When to use

Use `@sometic/query-builder` when you need shared portable behavior without locking a UI kit.

## When not to use

Skip if a one-off local component is enough and you do not need cross-framework adapters.

## Usage

::: code-group

```js [JS]
import { } from "@sometic/query-builder";
```

```ts [TS]
import { } from "@sometic/query-builder";
```

```html [Vanilla]
<script type="module">
  import { } from "@sometic/query-builder";
</script>
```

:::

## Playground

Vanilla playground section `#query-builder`.
