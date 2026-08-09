# `@sometic/store`

Framework-independent reactive stores, selectors, and optional persistence for Sometic.

`@sometic/store` gives you `createStore` and `select` as a tiny, disposable state container with batching, custom equality, and subscribe/unsubscribe. Subpaths add persistence (`@sometic/store/persistent`), cross-tab sync (`@sometic/store/cross-tab`), and store kinds (`@sometic/store/kinds`) without forcing Immer or a framework store library into every consumer.

Sometic models portable behavior across stacks. Application state must be explicit, injectable, SSR-safe, and disposable: no hidden module singletons and no browser globals at import time. This package exists so theme, auth, forms, and adapters share one store contract while you keep React Context, Pinia, or Vanilla wiring at the edges.

Standout features include immutable-by-convention `set` / `update`, nested `batch` notifications, `select` with equality to avoid noisy updates, `createPersistentStore` with storage adapters and migrations, memory and web storage helpers, and a dispose path that clears listeners. Optional [`@sometic/store-immer`](https://www.npmjs.com/package/@sometic/store-immer) adds draft updates when you want Immer without baking it into the core store.

In the ecosystem, store depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) and powers packages such as [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme). Framework adapters subscribe to stores rather than reimplementing state machines. Start from [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction) and the store docs under `/stores/`.

## Install

```bash
pnpm add @sometic/store
```

```bash
npm install @sometic/store
```

```bash
yarn add @sometic/store
```

## Usage

Create a store and select a slice:

```ts
import { createStore, select } from "@sometic/store";

type CounterState = { count: number; label: string };

const store = createStore<CounterState>({ count: 0, label: "demo" });

const count = select(store, (state) => state.count);
count.subscribe((next, previous) => {
    console.log(previous, "->", next);
});

store.update((state) => ({ ...state, count: state.count + 1 }));
store.batch(() => {
    store.set({ count: 2, label: "batched" });
});
```

Persist with a memory adapter (swap for `createWebStorageAdapter` in the browser):

```ts
import {
    createMemoryStorage,
    createPersistentStore,
} from "@sometic/store/persistent";

const storage = createMemoryStorage();

const prefs = createPersistentStore(
    { themeId: "light", density: "comfortable" },
    {
        key: "sometic.prefs",
        storage,
        version: 1,
    },
);

await prefs.hydrated;
prefs.update((state) => ({ ...state, themeId: "dark" }));
await prefs.persistNow();
```

## Peers / when not to use

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). No framework peers. Use this for portable shared state; do not use it as a Redux replacement with middleware ecosystems, and do not reach for it when a local `createControllableState` from core is enough for one field. Add Immer only via [`@sometic/store-immer`](https://www.npmjs.com/package/@sometic/store-immer) when mutable draft updates are worth the peer cost.

## Docs

- Introduction: [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction)
- Store: [https://sometic.aitistack.com/stores/store](https://sometic.aitistack.com/stores/store)
- Stores overview: [https://sometic.aitistack.com/stores/](https://sometic.aitistack.com/stores/)
- Immer adapter: [https://sometic.aitistack.com/stores/store-immer](https://sometic.aitistack.com/stores/store-immer)
- Core on npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)
- Store on npm: [https://www.npmjs.com/package/@sometic/store](https://www.npmjs.com/package/@sometic/store)

## License

MIT
