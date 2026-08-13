# Drafts FAQ

## How do I install it?

```bash
pnpm add @sometic/drafts
```

Depends on `@sometic/core` only.

## How is this different from `@sometic/forms` drafts?

`@sometic/drafts` persists **entity/document** values (notes, invoices, editors) behind an injectable `DraftStorage`. `@sometic/forms` drafts restore **form field** values for a form controller. Use forms drafts for login/settings forms; use this package for app-level documents.

## Which storage should I use?

- `createMemoryDraftStorage`: tests, SSR, ephemeral sessions
- `createLocalStorageDraftStorage`: browser persistence (factory only; no import-time `localStorage`)
- Custom adapter: IndexedDB or your backend, as long as it matches `getItem` / `setItem` / `removeItem`

## What about schema versions?

Set `version` on the controller. Older records return `null` from `load` unless you provide `migrate`.

## Can I omit secrets?

Yes: `omit`, `pick`, and `sanitize` run before persist. Prefer omitting passwords and tokens explicitly.

## Debounce?

`scheduleSave()` uses `debounceMs` (default behavior in the controller). Call `save()` for an immediate write.

## SSR?

Import is safe. Do not call `createLocalStorageDraftStorage()` at module top level in a shared SSR module graph if that would touch storage during import of other code paths; construct it when hydrating on the client.

## Related?

[Comparison](/guide/primitives/drafts-comparison) · [App primitives](/guide/app-primitives) · [Forms persistence](/forms/persistence)
