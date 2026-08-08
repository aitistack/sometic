# Store

`@sometic/store` is a minimal external store designed for `useSyncExternalStore`, signals, and Vanilla subscriptions. Persistence and cross-tab sync live on intentional subpaths so the core stays small.

## Overview

| Module           | Import                                                        |
| ---------------- | ------------------------------------------------------------- |
| Basic store      | `@sometic/store`                                              |
| Selector helper  | `@sometic/store` → `select`                                   |
| Persistent store | `@sometic/store/persistent`                                   |
| Cross-tab store  | `@sometic/store/cross-tab`                                    |
| Immer adapter    | [`@sometic/store-immer`](/stores/store-immer) (optional peer) |

### When to use

Shared application or engine state that must work across frameworks without pulling Redux, Zustand, or Signals into every adapter.

### When not to use

- Component-local controlled props → `@sometic/core/controllable-state`
- Fire-and-forget pub/sub → `@sometic/events`
- Deep nested mutable trees as the default → only then consider [Immer](/stores/store-immer)

## Installation

::: code-group

```bash [npm]
npm install @sometic/store
```

```bash [pnpm]
pnpm add @sometic/store
```

```bash [yarn]
yarn add @sometic/store
```

```bash [bun]
bun add @sometic/store
```

:::

Peer-free core. Depends on `@sometic/core` for disposable, error, and JSON helpers used by persistence.

## Usage

### Create, get, set, update, subscribe

::: code-group

```js [JS]
import { createStore } from "@sometic/store";

const store = createStore({ count: 0 });

store.get();
store.set({ count: 1 });
store.update((state) => ({ count: state.count + 1 }));

const unsubscribe = store.subscribe((state, previous) => {
    console.log(previous.count, "→", state.count);
});

unsubscribe();
store.dispose();
```

```ts [TS]
import { createStore } from "@sometic/store";

type CounterState = { count: number };

const store = createStore<CounterState>({ count: 0 });

store.get(); // { count: 0 }

store.set({ count: 1 });

store.update((state) => ({ count: state.count + 1 }));

const unsubscribe = store.subscribe((state, previous) => {
    console.log(previous.count, "→", state.count);
});

unsubscribe();
store.dispose();
```

```js [Vanilla]
import { createStore } from "@sometic/store";

const store = createStore({ count: 0 });
const unsubscribe = store.subscribe((state) => {
    console.log(state.count);
});
store.update((state) => ({ count: state.count + 1 }));
unsubscribe();
store.dispose();
```

:::

### Batch

`batch` collapses nested writes into one notification after the callback finishes. Nested `batch` calls nest correctly.

```ts
store.batch(() => {
    store.set({ count: 1 });
    store.update((state) => ({ count: state.count + 1 }));
});
// listeners run once with the final state
```

### Equality

By default, `Object.is` decides whether `set` / `update` commit. Pass `equalityFn` when you need structural or shallow equality for whole-state replacement.

```ts
import { createStore } from "@sometic/store";
import { shallowEqual } from "@sometic/core/utils";

const store = createStore({ count: 0, label: "n" }, { equalityFn: shallowEqual });
```

### Dispose

After `dispose()`, `get` / `set` / `update` / `batch` / `subscribe` throw. Disposing twice is a no-op. Always dispose stores you create in tests, SSR request scopes, or short-lived engines.

## Selectors (`select`)

`select(store, selector, equalityFn?)` returns a slice view: `get` and `subscribe` that notify only when the selected value changes (default `Object.is` on the slice).

```ts
import { createStore, select } from "@sometic/store";

const store = createStore({ count: 0, name: "Ada" });
const countSlice = select(store, (state) => state.count);

countSlice.get(); // 0

countSlice.subscribe((count, previous) => {
    console.log(previous, "→", count);
});

store.update((state) => ({ ...state, name: "Grace" }));
// countSlice does not notify

store.update((state) => ({ ...state, count: 1 }));
// countSlice notifies with 1
```

Use a custom equality function for selected objects or arrays:

```ts
import { shallowEqual } from "@sometic/core/utils";

const profile = select(store, (state) => ({ name: state.name, count: state.count }), shallowEqual);
```

## Persistent store

Import from `@sometic/store/persistent`.

### API surface

| Export                    | Role                                             |
| ------------------------- | ------------------------------------------------ |
| `createPersistentStore`   | Store + hydrate + auto-write                     |
| `createMemoryStorage`     | In-memory `StorageAdapter` (tests / SSR default) |
| `createWebStorageAdapter` | Lazy `localStorage` / `sessionStorage` adapter   |

### Options

| Option                      | Type                 | Default       | Description                             |
| --------------------------- | -------------------- | ------------- | --------------------------------------- |
| `key`                       | `string`             | required      | Storage key                             |
| `storage`                   | `StorageAdapter`     | required      | Read/write/remove adapter               |
| `version`                   | `number`             | `1`           | Envelope version for migrations         |
| `migrations`                | `PersistMigration[]` | `[]`          | Ordered upgrades from older versions    |
| `serialize` / `deserialize` | functions            | JSON envelope | Custom codecs                           |
| `equalityFn`                | `StoreEqualityFn`    | `Object.is`   | Passed to inner store                   |
| `onPersistError`            | `(error) => void`    | none          | Quota, corrupt payload, migration gaps  |
| `syncInitial`               | `boolean`            | `true`        | Write initial state when key is missing |

Extra methods on the returned store: `hydrated` (Promise), `persistNow()`, `clearPersisted()`.

### Example

::: code-group

```ts [TS]
import { createPersistentStore, createWebStorageAdapter } from "@sometic/store/persistent";

type Prefs = { locale: string; density: "comfortable" | "compact" };

const prefs = createPersistentStore<Prefs>(
    { locale: "en", density: "comfortable" },
    {
        key: "app-prefs",
        storage: createWebStorageAdapter("localStorage"),
        version: 2,
        migrations: [
            {
                version: 2,
                migrate(previous) {
                    const legacy = previous as { locale?: string };
                    return {
                        locale: legacy.locale ?? "en",
                        density: "comfortable" as const,
                    };
                },
            },
        ],
        onPersistError(error) {
            console.warn("prefs persist failed", error);
        },
    },
);

await prefs.hydrated;
prefs.update((state) => ({ ...state, density: "compact" }));
await prefs.persistNow();
```

```js [JS]
import { createPersistentStore, createWebStorageAdapter } from "@sometic/store/persistent";

const prefs = createPersistentStore(
    { locale: "en", density: "comfortable" },
    {
        key: "app-prefs",
        storage: createWebStorageAdapter("localStorage"),
        version: 2,
        migrations: [
            {
                version: 2,
                migrate(previous) {
                    return {
                        locale: previous?.locale ?? "en",
                        density: "comfortable",
                    };
                },
            },
        ],
        onPersistError(error) {
            console.warn("prefs persist failed", error);
        },
    },
);

await prefs.hydrated;
prefs.update((state) => ({ ...state, density: "compact" }));
```

:::

Writes run only after hydration completes (`ready`). Failed writes call `onPersistError` and do not crash subscribers. Web adapters resolve storage inside methods (no import-time `window`). Missing storage no-ops reads/writes safely.

Corrupt envelopes raise `STORE_PERSIST_CORRUPT` via `onPersistError` and leave the in-memory initial state. Migration gaps raise `STORE_PERSIST_MIGRATION_GAP`.

Theme preferences use this same layer. See [Theme store](/stores/theme) and [Theming](/theming/).

## Cross-tab store

Import from `@sometic/store/cross-tab`.

| Export                            | Role                          |
| --------------------------------- | ----------------------------- |
| `createCrossTabStore`             | Local store + remote apply    |
| `createBroadcastChannelTransport` | Preferred transport           |
| `createStorageEventTransport`     | Fallback via `storage` events |

### Options

| Option         | Description                                                     |
| -------------- | --------------------------------------------------------------- |
| `key`          | Logical channel key (messages filtered by key)                  |
| `transport`    | Optional custom `CrossTabTransport`                             |
| `equalityFn`   | Inner store equality                                            |
| `shouldAccept` | Defaults to accepting messages with `revision` newer than local |

Each instance has a unique `sourceId`. Own messages are ignored. Applying a remote message does not re-broadcast (avoids loops). Default transport: `BroadcastChannel` when available, otherwise storage-event transport. Without either, a noop transport keeps the store local-only.

```ts
import { createCrossTabStore } from "@sometic/store/cross-tab";

const shared = createCrossTabStore({ draft: "" }, { key: "editor-draft" });

shared.subscribe((state) => {
    console.log("revision", shared.revision, state.draft);
});

shared.set({ draft: "hello from this tab" });
```

## How it works

1. **Core store** holds one `state` value, a listener `Set`, and a batch depth counter. Commits that fail equality are ignored. Pending previous state is captured once per notify window so listeners always see `(current, previous)`.
2. **Notifications** are synchronous. Re-entrant updates during notification re-queue and flush after the current fan-out.
3. **`select`** wraps subscribe and compares only the selected slice, so unchanged slices skip listeners.
4. **Persistence** wraps the same store: hydrate once, then subscribe and write envelopes `{ version, state }`. `hydrated` settles whether read succeeds or fails.
5. **Cross-tab** posts `{ sourceId, key, revision, state }` on local change and applies remote states when `shouldAccept` passes.

Under the hood this is an intentional external-store contract for adapters (`useSyncExternalStore`, signals), not a miniature Redux.

## Edge cases

| Case                                | Behavior                                                             |
| ----------------------------------- | -------------------------------------------------------------------- |
| Same value via `Object.is`          | No notify                                                            |
| Nested `batch`                      | Single notify when outermost batch ends                              |
| Subscribe during dispose            | Throws; disposed stores reject new work                              |
| Persist before hydrate finishes     | Auto-writes skipped until `ready`                                    |
| `localStorage` quota / private mode | `STORE_STORAGE_*` errors → `onPersistError`                          |
| Corrupt JSON envelope               | Reported; state stays at initial                                     |
| Missing migration path              | `STORE_PERSIST_MIGRATION_GAP`                                        |
| Cross-tab own message               | Ignored by `sourceId`                                                |
| No `BroadcastChannel`               | Storage-event or noop fallback                                       |
| SSR / no storage                    | Web adapter returns `null` / no-ops; memory storage works everywhere |

## Performance notes

- Core gzip budget: ≤ 1.5 KB. Prefer `select` over full-store subscriptions in UI trees.
- Prefer immutable updates (`update` returning new objects) so `Object.is` stays cheap.
- Batch multi-field writes to avoid N renders in adapters.
- Persistence serializes after every committed change post-hydrate; debounce at the app layer if you write large trees frequently.
- Cross-tab posts the whole state; keep synced slices small or provide a custom transport.

## Framework pointers

### React

`useStore` from `@sometic/react/store` binds with `useSyncExternalStore` and an optional selector:

```tsx
import { useStore } from "@sometic/react/store";
import { createStore } from "@sometic/store";

const store = createStore({ count: 0 });

export function Counter() {
    const count = useStore(store, (state) => state.count);
    return (
        <button type="button" onClick={() => store.update((s) => ({ count: s.count + 1 }))}>
            {count}
        </button>
    );
}
```

Full adapter guide: [React](/frameworks/react).

### Vue

`useStore` from `@sometic/vue/store` follows the same store contract:

```ts
import { useStore } from "@sometic/vue/store";
```

Full adapter guide: [Vue](/frameworks/vue).

### Vanilla

Call `subscribe` / `dispose` yourself, or use DOM bind helpers from framework Wave packages where available.

## API reference

### `createStore(initialState, options?)`

Returns `DisposableStore<TState>`:

| Member      | Signature                                              |
| ----------- | ------------------------------------------------------ |
| `get`       | `() => TState`                                         |
| `set`       | `(nextState: TState) => void`                          |
| `update`    | `(updater: (current) => TState) => void`               |
| `subscribe` | `(listener: (state, previous) => void) => Unsubscribe` |
| `batch`     | `(run: () => void) => void`                            |
| `dispose`   | `() => void`                                           |
| `disposed`  | `boolean` (getter)                                     |

`CreateStoreOptions`: optional `equalityFn`.

### `select(store, selector, equalityFn?)`

Returns `{ get, subscribe }` for the selected slice.

### Persistent types

`StorageAdapter`, `PersistedEnvelope`, `PersistMigration`, `CreatePersistentStoreOptions`, `PersistentStore`.

### Cross-tab types

`CrossTabTransport`, `CrossTabMessage`, `CreateCrossTabStoreOptions`, `CrossTabStore` (`sourceId`, `revision`).

## FAQ

### Is the store SSR-safe?

Yes. Factories do not touch browser globals at import time. Web storage adapters resolve `localStorage` / `sessionStorage` inside methods and no-op when missing. Cross-tab chooses transport inside the factory.

### What if `localStorage` throws (quota or private mode)?

Persistent store reports via `onPersistError` and does not crash subscribers. In-memory state remains usable.

### How do I migrate persisted data?

Set `version` and provide ordered `migrations` with increasing `version` numbers. Each migration's `migrate` receives the previous payload and must produce the next shape. Gaps throw `STORE_PERSIST_MIGRATION_GAP`.

### Does cross-tab work without `BroadcastChannel`?

Yes. The default falls back to `createStorageEventTransport`. If neither channel nor storage listeners exist, a noop transport keeps state local.

### Can I use Immer?

Yes, via the optional peer package:

```bash
pnpm add @sometic/store-immer immer
```

See [Immer adapter](/stores/store-immer).

### Should every component use a store?

No. Prefer props and `@sometic/core/controllable-state` for component-local UI state. Reach for the store when multiple trees or frameworks share the same engine state.

### Why not put persistence in the root entry?

Subpaths keep tree-shaking honest: apps that only need `createStore` do not pay for JSON envelopes or storage adapters.

### How does this relate to theme?

`createThemeController({ persist: true, storage, storageKey })` builds a `createPersistentStore` for preferences. Details: [Theme store](/stores/theme).

### Are notifications async?

No. Listeners run synchronously after commit (or after the outermost `batch`). Schedule async work yourself inside listeners if needed.

### What equality should I use?

Default `Object.is` with immutable updates. Use `shallowEqual` from `@sometic/core/utils` only when you intentionally replace with new objects that share shallow fields.

## Comparison vs Redux / Zustand

| Concern                 | `@sometic/store`                       | Redux                        | Zustand                        |
| ----------------------- | -------------------------------------- | ---------------------------- | ------------------------------ |
| Role in Sometic         | Adapter-facing external store contract | App architecture             | App architecture               |
| Middleware / DevTools   | Out of scope                           | First-class                  | Available                      |
| Size in every adapter   | Tiny core + optional subpaths          | Heavier if pulled into cores | Small, but still an app choice |
| Persistence / cross-tab | First-party subpaths                   | Ecosystem                    | Ecosystem                      |
| Immer                   | Optional peer adapter                  | Common via middleware        | Common via middleware          |

**Why not Zustand/Redux/Jotai in core?** Those libraries are excellent at the application boundary. Sometic needs a tiny shared contract so React, Vue, Vanilla, and later adapters bind the same engines without shipping one app-state library into every package.

**Why Immer is optional:** most stores do not need structural sharing. Keeping `immer` as a peer preserves the ≤ 1.5 KB core budget.

Use Redux or Zustand for large app graphs if you prefer them; bind Sometic engines with this store (or adapters' `useStore`) at the edges.

## Related

- [Stores hub](/stores/)
- [Immer adapter](/stores/store-immer)
- [Theme store](/stores/theme)
- [Theming](/theming/)
- [React](/frameworks/react) · [Vue](/frameworks/vue)
- [API packages](/api/packages)
