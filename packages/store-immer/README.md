# `@sometic/store-immer`

Optional Immer adapter that adds draft-style `produce` updates to Sometic stores.

`@sometic/store-immer` exports `createImmerStore`, a thin wrapper around `createStore` from [`@sometic/store`](https://www.npmjs.com/package/@sometic/store). You keep the same `get`, `set`, `update`, `batch`, `subscribe`, and `dispose` API, plus `produce(updater)` that runs Immer’s `produce` against the current state and commits the next immutable snapshot.

Sometic keeps the core store free of Immer so most apps never pay for draft machinery. This package exists for teams that prefer mutable-looking updates for nested objects while still shipping portable, framework-independent store behavior. It is an opt-in peer layer, not a second state system.

Out of the box you get typed `ImmerUpdater` drafts, full `DisposableStore` compatibility, and the same `CreateStoreOptions` (including custom equality) as the base store. There is no persistence or cross-tab logic here: compose with `@sometic/store/persistent` and related subpaths when you need those features on a plain store, or wrap only the in-memory slice that benefits from Immer.

In the ecosystem, install this only when Immer is already (or will be) a peer in your app. It sits beside [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) and ultimately [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Theme, auth, and forms do not require it. Product context: [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction).

## Install

```bash
pnpm add @sometic/store-immer @sometic/store immer
```

```bash
npm install @sometic/store-immer @sometic/store immer
```

```bash
yarn add @sometic/store-immer @sometic/store immer
```

## Usage

Draft updates with `produce`:

```ts
import { createImmerStore } from "@sometic/store-immer";

type TodoState = {
    items: Array<{ id: string; done: boolean }>;
};

const store = createImmerStore<TodoState>({
    items: [{ id: "1", done: false }],
});

store.produce((draft) => {
    const first = draft.items[0];
    if (first) {
        first.done = true;
    }
});

console.log(store.get().items[0]?.done);
```

Same subscription surface as `@sometic/store`:

```ts
import { createImmerStore } from "@sometic/store-immer";

const store = createImmerStore({ nested: { count: 0 } });

const unsubscribe = store.subscribe((state, previous) => {
    console.log(previous.nested.count, "->", state.nested.count);
});

store.produce((draft) => {
    draft.nested.count += 1;
});

unsubscribe();
store.dispose();
```

## Peers / when not to use

Peer dependencies: [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) (`>=1.0.0`) and `immer` (`^10`). Skip this package when immutable `update` spreads are enough, when bundle size is tight, or when you do not want Immer in the dependency graph. Prefer plain [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) for most Sometic integrations.

## Docs

- Introduction: [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction)
- Immer adapter: [https://sometic.dev/stores/store-immer](https://sometic.dev/stores/store-immer)
- Store: [https://sometic.dev/stores/store](https://sometic.dev/stores/store)
- Core on npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)
- Store-immer on npm: [https://www.npmjs.com/package/@sometic/store-immer](https://www.npmjs.com/package/@sometic/store-immer)

## License

MIT
