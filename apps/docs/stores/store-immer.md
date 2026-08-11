# Immer adapter

`@sometic/store-immer` adds draft-style updates on top of `@sometic/store` without pulling Immer into the default store bundle. `immer` is a **peer dependency**.

## Overview

| Export             | Role                                      |
| ------------------ | ----------------------------------------- |
| `createImmerStore` | Disposable store plus `produce(updater)`  |
| `ImmerUpdater`     | `(draft: Draft<TState>) => void`          |
| `ImmerStore`       | `DisposableStore` extended with `produce` |

State must be an `object` (Immer's `produce` constraint). You still get `get`, `set`, `update`, `batch`, `subscribe`, and `dispose` from the underlying store.

### When to use

- Deep nested trees where immutable spreads become noisy
- Existing Immer habits in an app that also binds Sometic engines
- Localized mutable drafts while keeping the public store immutable

### When not to use

- Flat counters, flags, or small preference objects (plain `update` is enough)
- Avoiding the `immer` peer weight in hot paths or size-sensitive bundles
- Expecting Redux Toolkit-style slices or middleware (out of scope)

## Installation

Install the adapter **and** the peer:

<InstallCommands packages="@sometic/store-immer immer @sometic/store" />

`@sometic/store` is also a peer (`>=0.0.1`). `immer` must satisfy `^10.0.0`.

## Usage

::: code-group

```ts [TS]
import { createImmerStore } from "@sometic/store-immer";

type TodosState = {
    items: Array<{ id: string; title: string; done: boolean }>;
};

const store = createImmerStore<TodosState>({
    items: [{ id: "1", title: "Ship docs", done: false }],
});

store.produce((draft) => {
    const first = draft.items[0];
    if (first) {
        first.done = true;
    }
    draft.items.push({ id: "2", title: "Write FAQ", done: false });
});

store.get().items[0]?.done; // true

store.dispose();
```

```js [JS]
import { createImmerStore } from "@sometic/store-immer";

const store = createImmerStore({
    items: [{ id: "1", title: "Ship docs", done: false }],
});

store.produce((draft) => {
    const first = draft.items[0];
    if (first) {
        first.done = true;
    }
    draft.items.push({ id: "2", title: "Write FAQ", done: false });
});

store.dispose();
```

:::

`produce` is implemented as `store.set(produce(store.get(), updater))`. Equality, batching, and subscribe behavior match `createStore`. You can still call `set` / `update` when a full replacement is clearer.

```ts
store.batch(() => {
    store.produce((draft) => {
        draft.items[0]!.done = true;
    });
    store.produce((draft) => {
        draft.items.push({ id: "3", title: "Batch", done: false });
    });
});
```

Optional `equalityFn` is forwarded to `createStore`:

```ts
const store = createImmerStore({ nested: { n: 0 } }, { equalityFn: Object.is });
```

## How it works

1. `createImmerStore` wraps `createStore` from `@sometic/store`.
2. `produce(updater)` runs Immer's `produce` against the current state and `set`s the result.
3. Listeners see immutable next states (structural sharing from Immer), same as any other store commit.
4. No persistence or cross-tab logic lives here; compose with `@sometic/store/persistent` or `/cross-tab` at the app layer if needed (wrap or mirror state yourself).

## Edge cases

| Case                           | Behavior                                               |
| ------------------------------ | ------------------------------------------------------ |
| Non-object initial state       | TypeScript rejects; Immer expects objects              |
| Mutating outside `produce`     | Do not mutate `get()` results; treat them as frozen    |
| `produce` that returns a value | Prefer recipe side effects on `draft` (Immer rules)    |
| Disposed store                 | Same throws as core store                              |
| Missing `immer` peer           | Install fails / runtime import fails; keep it explicit |

## Performance notes

- Adapter itself targets ≤ 1 KB gzip; **`immer` is extra** and often dominates size.
- Prefer plain `createStore` for small slices.
- Structural sharing helps large trees; for tiny state it is overhead without benefit.

## FAQ

### Why is Immer a peer instead of a dependency?

Most Sometic stores never need drafts. Peer-forcing `immer` would tax every consumer of `@sometic/store`. The adapter keeps the choice explicit.

### Does `createImmerStore` replace `createStore`?

No. Use it only where drafts help. Adapters (`useStore`) accept either store shape because both implement `get` / `subscribe`.

### Can I persist an Immer store?

Not as a one-liner from this package. Persist the same state shape with `createPersistentStore`, or keep an Immer store and write your own hydrate/persist bridge. Theme persistence uses the plain persistent store, not Immer.

### Does `produce` notify selectors?

Yes. After `set`, `select` and framework `useStore` selectors re-run against the next immutable state.

### Is this Redux Toolkit?

No. No slices, middleware, or entity adapters. Only draft updates on the Sometic store contract.

### TypeScript: why `TState extends object`?

That matches Immer's `produce` typing for draftable values.

### Can I use `select` with an Immer store?

Yes. Import `select` from `@sometic/store` and pass the immer store.

### What about SSR?

Same as core store: no import-time browser access. Immer runs wherever your bundle runs.

## Comparison

| Approach                  | Tradeoff                                                 |
| ------------------------- | -------------------------------------------------------- |
| Plain `update` spreads    | Zero Immer cost; verbose for deep trees                  |
| `@sometic/store-immer`    | Draft DX; peer weight; object-only state                 |
| App-level Zustand + Immer | Fine at the app boundary; do not pull into Sometic cores |

## Related

- [Store](/stores/store) for core, persistence, and cross-tab
- [Stores hub](/stores/)
- [React](/frameworks/react) · [Vue](/frameworks/vue)
