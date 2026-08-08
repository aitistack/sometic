# Store, API

## `createStore(initialState, { equalityFn? })`

`get` · `set` · `update` · `subscribe` · `batch` · `dispose`

## `select(store, selector, equalityFn?)`

Slice `get` + `subscribe` that notifies only when the selected value changes.

## Persistent (`@sometic/store/persistent`)

`createPersistentStore`, `createMemoryStorage`, `createWebStorageAdapter`

Options: `key`, `storage`, `version`, `migrations`, `onPersistError`, `syncInitial`

## Cross-tab (`@sometic/store/cross-tab`)

`createCrossTabStore`, `createBroadcastChannelTransport`, `createStorageEventTransport`

Ignores own `sourceId` messages; accepts newer `revision` by default.
