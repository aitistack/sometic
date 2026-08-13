# Commands FAQ

## How do I install it?

```bash
pnpm add @sometic/commands
```

Depends on `@sometic/core` only.

## Is this the command palette?

No. `@sometic/commands` is a **registry/bus**: register, `canExecute`, `execute`, subscribe. The searchable UI lives under structure / [command palette](/components/command-palette) (`@sometic/dom`). A palette may call into this registry later; they are not the same package.

## Does register replace an existing id?

No. Duplicate ids throw `COMMAND_DUPLICATE`. Unregister first, or keep one owner per id.

## How do I gate availability?

Pass `canExecute` on the definition. `execute` throws when `canExecute` returns false.

## Undo?

Optional `undo` on a definition is metadata for composition. The undo **stack** is `@sometic/history`. Pair them when toolbar undo must reverse a command result.

## Events?

`subscribe` receives `register`, `unregister`, `execute`, and `error`. Execute failures emit `error` then rethrow.

## Related?

[Comparison](/guide/primitives/commands-comparison) · [App primitives](/guide/app-primitives) · [Command palette](/components/command-palette)
