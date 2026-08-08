# Events, API

`createEventEmitter<TEvents>(options?)`

- `on(event, handler, { signal? })` → `Disposable`
- `once(event, handler, { signal? })` → `Disposable`
- `off(event, handler)`
- `emit(event, payload)`
- `listenerCount(event)`
- `dispose()` / `disposed`
- `onListenerError(error, eventName)` option isolates handler failures
