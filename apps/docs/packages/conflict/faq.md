# Conflict FAQ

## How do I install it?

```bash
pnpm add @sometic/conflict
```

Depends on `@sometic/core` only.

## Which strategies ship built-in?

`lastWriteWinsStrategy` (`lww`), `clientWinsStrategy`, `serverWinsStrategy`. Register more with `registerStrategy`.

## Does it detect conflicts from the network?

No. You open a record when your sync or offline flush path knows local and remote disagree. Status chrome under `@sometic/dom/status` can present the badge; this package owns the record and resolution value.

## Can I resolve manually?

Yes: `resolveWith(id, value)` bypasses strategies. `resolve(id, strategyId?)` uses the default or named strategy.

## Idempotent resolve?

Resolving an already resolved conflict returns the existing record.

## Related?

[Comparison](./comparison) · [App primitives](/guide/app-primitives) · [Offline queue FAQ](/packages/offline-queue/faq)
