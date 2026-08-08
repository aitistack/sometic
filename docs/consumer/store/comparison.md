# Store — Comparison

## Why not Zustand/Redux/Jotai in core?

Those are excellent libraries but pull opinions/size into every framework adapter. Sometic needs a tiny external store contract for adapters (`useSyncExternalStore`, signals) with optional persistence/cross-tab layers.

## Why Immer is optional

Most stores do not need structural sharing. `@sometic/store-immer` keeps Immer as a peer so default bundles stay small.

## Under the hood

Notifications are synchronous and batched via `batch`. Persistence writes after hydration completes. Cross-tab uses revision + source id to prevent loops.
