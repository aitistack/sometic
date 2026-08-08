# Store — FAQ

## Is it SSR-safe?

Yes. Web storage adapters no-op when storage is missing. Cross-tab falls back to a noop/storage-event transport without import-time browser access beyond capability checks inside factories.

## What if localStorage throws (quota/private mode)?

Persistent store reports via `onPersistError` and does not crash subscribers.

## How do I migrate persisted data?

Provide `version` + ordered `migrations` with increasing `version` numbers.

## Does cross-tab work without BroadcastChannel?

Yes — storage-event transport is used as fallback when `BroadcastChannel` is unavailable.

## Can I use Immer?

```bash
pnpm add @sometic/store-immer immer
```
