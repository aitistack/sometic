# `@sometic/history`

Undo and redo for Sometic: execute reversible entries, walk an undo stack, redo cleared branches, and checkpoint named markers.

`createHistoryController` is store-agnostic. You supply `execute` and `undo` (plus optional `redo`). Depth is capped, concurrent operations are serialized, and a new execute clears the redo branch the way desktop editors do.

Why it exists: reversible edits show up in canvases, document editors, and settings screens. Without a shared stack, each UI reinvents race handling and depth limits. This package owns that timeline so adapters only bind buttons.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only.

Docs: [introduction](https://sometic.dev/guide/introduction) and [https://sometic.dev](https://sometic.dev).

## Install

```bash
pnpm add @sometic/history
```

```bash
npm install @sometic/history
```

```bash
yarn add @sometic/history
```

## Usage

```ts
import { createHistoryController } from "@sometic/history";

const history = createHistoryController({ maxDepth: 50 });
let title = "Untitled";

await history.execute({
    label: "Rename",
    execute: () => {
        const previous = title;
        title = "Invoice";
        return previous;
    },
    undo: (previous) => {
        title = previous;
    },
});

await history.undo();
await history.redo();
history.checkpoint("before-export");
history.clear();
history.dispose();
```

Subscribe for toolbar state:

```ts
const stop = history.subscribe((state) => {
    setUndoEnabled(state.canUndo);
    setRedoEnabled(state.canRedo);
});

stop();
```

## API

- `createHistoryController({ maxDepth?, onChange? })`.
- `execute(entry)`, `undo()`, `redo()`, `canUndo()`, `canRedo()`.
- `checkpoint(label?)`, `clear()`, `getState()`.
- `subscribe(listener)`, `dispose()`, `disposed`.

Empty undo/redo stacks and calls after `dispose()` throw typed errors (`HISTORY_*`). If `redo` is omitted, redo re-runs `execute`.

## When not to use

Skip it for append-only audit logs; use [`@sometic/activity`](https://www.npmjs.com/package/@sometic/activity) instead. Prefer operational transforms or CRDTs when multiple users edit the same document concurrently. This package is a local undo stack, not a sync protocol.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [https://sometic.dev](https://sometic.dev)

## License

MIT
