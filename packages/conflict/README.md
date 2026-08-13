# `@sometic/conflict`

Conflict records and merge strategies for Sometic: open local/remote disagreements, resolve them with built-in or custom strategies, and keep a list UI can render.

`createConflictController` ships last-write-wins, client-wins, and server-wins strategies. You can register more, resolve manually, and clear resolved rows. Records are copied on read so callers cannot mutate internal state by accident.

Why it exists: offline writes and multi-tab edits eventually disagree. Status chrome can show a badge, but something still has to own the record, strategy choice, and resolution value. This package is that engine.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only.

Docs: [introduction](https://sometic.dev/guide/introduction) and [https://sometic.dev](https://sometic.dev).

## Install

```bash
pnpm add @sometic/conflict
```

```bash
npm install @sometic/conflict
```

```bash
yarn add @sometic/conflict
```

## Usage

```ts
import {
    createConflictController,
    lastWriteWinsStrategy,
} from "@sometic/conflict";

const conflicts = createConflictController({
    defaultStrategyId: lastWriteWinsStrategy.id,
});

const opened = conflicts.open({
    key: "invoice:42",
    local: { total: 100 },
    remote: { total: 120 },
    localUpdatedAt: 1_000,
    remoteUpdatedAt: 2_000,
});

const resolved = conflicts.resolve(opened.id);
console.log(resolved.resolution);

conflicts.resolveWith(opened.id, { total: 110 });
conflicts.clearResolved();
conflicts.dispose();
```

Add a custom strategy:

```ts
conflicts.registerStrategy({
    id: "prefer-local-title",
    resolve: (conflict) => ({
        ...(conflict.remote as object),
        title: (conflict.local as { title: string }).title,
    }),
});
```

## API

- `createConflictController({ strategies?, defaultStrategyId?, now?, onChange? })`.
- Built-ins: `lastWriteWinsStrategy`, `clientWinsStrategy`, `serverWinsStrategy`.
- `open(input)`, `resolve(id, strategyId?)`, `resolveWith(id, value)`.
- `get(id)`, `list(status?)`, `clearResolved()`, `registerStrategy(strategy)`.
- `subscribe(listener)`, `dispose()`, `disposed`.

Blank keys, unknown ids/strategies, duplicate strategy ids, and calls after `dispose()` throw typed errors (`CONFLICT_*`). Resolving an already resolved conflict returns the existing record.

## When not to use

Skip it when the server always wins and the client just reloads. Prefer a CRDT or OT layer when concurrent editors must merge character-by-character. This package records and resolves discrete conflicts; it does not detect them from raw network traffic.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [https://sometic.dev](https://sometic.dev)

## License

MIT
