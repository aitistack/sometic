# Core — API

## Environment

`getGlobalThis`, `isServerEnvironment`, `isBrowserEnvironment`, `canUseDom`, `detectRuntimeCapabilities`

## Id

`createId()`, `createPrefixedId(prefix)`

## Disposable

`createDisposable(fn)`, `DisposableStack` (`use`, `defer`, `adopt`, `move`, `dispose`)

## Error

`SometicError`, `createError({ code, message, cause?, details? })`, `isSometicError`

## Result

`ok`, `err`, `isOk`, `isErr`, `unwrap`, `mapResult`

## Controllable state

`createControllableState({ value?, defaultValue, onChange?, isEqual? })` → `get/set/update/reset/isControlled`

For controlled mode, include `value` at creation. Update `options.value` when the external value changes (adapters do this automatically later).

## Async operation

`createAsyncOperation(fn, { concurrency?, timeoutMs?, mapError?, onStateChange?, initialData? })`

- `execute(...args)`, `retry()`, `abort()`, `reset()`, `subscribe(listener)`
- concurrency: `latest` (default), `first`, `parallel`

## Utils

`once`, `debounce`, `throttle`, `shallowEqual`, `createDeferred`, `anySignal`, `normalizeError`, `safeJsonParse`, `safeJsonStringify`
