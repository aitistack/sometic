# `@sometic/commands`

Framework-free command registry for Sometic: register named actions, gate them with `canExecute`, run them with shared context, and observe register/execute/error events.

`createCommandRegistry` is the bus behind toolbars, shortcuts, and command palettes. It does not render UI. A palette can search labels; this package owns identity, execution, and disposal.

Why it exists: apps accumulate one-off `onClick` handlers until the same action must run from a menu, a hotkey, and a test. A registry keeps one execute path so every surface stays honest about availability and errors.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only.

Docs: [introduction](https://sometic.dev/guide/introduction) and [https://sometic.dev](https://sometic.dev).

## Install

```bash
pnpm add @sometic/commands
```

```bash
npm install @sometic/commands
```

```bash
yarn add @sometic/commands
```

## Usage

```ts
import { createCommandRegistry } from "@sometic/commands";

const commands = createCommandRegistry();

const unregister = commands.register({
    id: "document.save",
    label: "Save document",
    canExecute: (context) => context?.["dirty"] === true,
    execute: async (context) => {
        await saveDocument(context?.["id"]);
        return "saved";
    },
});

if (commands.canExecute("document.save", { dirty: true, id: "doc-1" })) {
    await commands.execute("document.save", { dirty: true, id: "doc-1" });
}

unregister();
commands.dispose();
```

Listen for lifecycle events:

```ts
const stop = commands.subscribe((event) => {
    if (event.type === "error") report(event.error);
});

stop();
```

## API

- `createCommandRegistry({ onEvent? })`.
- `register(command)` returns an unregister function.
- `unregister(id)`, `has(id)`, `list()`, `get(id)`.
- `canExecute(id, context?)`, `execute(id, context?)`.
- `subscribe(listener)`, `dispose()`, `disposed`.

Duplicate ids, blank ids, unknown commands, blocked `canExecute`, and calls after `dispose()` throw typed errors (`COMMAND_*`). Execute failures rethrow after emitting an `error` event.

## When not to use

Skip it when you have a single button with a single handler. Prefer a full workflow engine when you need durable sagas, retries, or server-driven steps. Pair with `@sometic/history` when actions must undo; this registry does not keep an undo stack by itself.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [https://sometic.dev](https://sometic.dev)

## License

MIT
