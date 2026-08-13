# History FAQ

## How do I install it?

```bash
pnpm add @sometic/history
```

Depends on `@sometic/core` only.

## What must an entry provide?

`execute` and `undo`. Optional: `id`, `label`, `redo`. If `redo` is omitted, redo re-runs `execute`.

## Depth limit?

`maxDepth` (default 100). Oldest undo entries drop when the cap is exceeded.

## Concurrent undo / execute?

Operations are serialized on an internal promise chain so reentrancy cannot corrupt the stacks.

## Checkpoints?

`checkpoint(label?)` marks a named point for app-level resets. It does not invent a separate product timeline; use it when your UI needs a labeled boundary before a bulk edit.

## Is this an audit log?

No. Use [`@sometic/activity`](/packages/activity/faq) for append-only timelines. History is a reversible local stack.

## Related?

[Comparison](./comparison) · [App primitives](/guide/app-primitives) · [Commands FAQ](/packages/commands/faq)
