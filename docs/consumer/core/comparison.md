# Core — Comparison

## Why not Node `events` / browser `EventTarget`?

Those are environment-coupled and weakly typed for payload maps. Sometic uses `@sometic/events` for pub/sub and keeps core focused on disposable/state/async primitives.

## Why controllable state instead of a store?

Controllable state models component-local controlled/uncontrolled props. Application stores arrive in Phase 3 (`@sometic/store`).

## Why Result instead of throwing everywhere?

Throwing remains valid for hard failures (`SometicError`). `Result` is for expected branchable outcomes without try/catch noise.

## Why DisposableStack instead of `using` only?

Explicit stacks work in all supported targets today and compose with adapters that are not in a `using` scope.

## Under the hood

No import-time browser access. Async operations use `AbortController` for cancellation. Event listener errors are isolated in `@sometic/events`, not swallowed silently unless you omit `onListenerError`.
