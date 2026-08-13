# Feature flags FAQ

## How do I install it?

```bash
pnpm add @sometic/feature-flags
```

Depends on `@sometic/core` only.

## What is the evaluation order?

Override, then remote, then the flag definition default. `getSnapshot(key)` reports `source` as `"override" | "remote" | "default"`.

## Does it fetch flags from a vendor?

No. You supply definitions plus optional `remote` / `overrides`. Wire your own fetch and call `setRemote`.

## Are variants only booleans?

No. Variants may be `string | boolean | number | null`. Use `isEnabled` for on/off and `getVariant` for experiment arms.

## Is it SSR-safe?

Yes. No browser globals at import time. Controllers are explicit and disposable.

## What happens on unknown keys?

`isEnabled`, `getVariant`, and `getSnapshot` throw typed `FEATURE_FLAG_UNKNOWN` (and related `FEATURE_FLAG_*` codes for empty/duplicate/disposed cases).

## Multi-instance?

Create one controller per app or workspace. There is no module singleton.

## Related?

[Comparison](./comparison) · [App primitives](/guide/app-primitives)
