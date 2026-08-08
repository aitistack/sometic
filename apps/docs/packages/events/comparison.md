# Events, Comparison

## Why not mitt / eventemitter3?

Those are fine libraries, but Sometic needs first-party AbortSignal + Disposable integration, typed maps, and a ≤1KB gzip budget aligned with monorepo dependency rules.

## Why not Node `EventEmitter`?

Not isomorphic for browser bundles without polyfills, and typings for payload maps are weaker for our use cases.

## Under the hood

Handlers are snapshotted before emit so `off` during emit is safe. Listener exceptions are caught and forwarded to `onListenerError` so one bad listener cannot break others.
