# Persistence

Draft persistence is an optional module (`@sometic/forms/drafts`). It is not wired into `createForm` automatically, you compose storage with `getValues` / `setValues` / `subscribe`.

## Import

```ts
import {
    createDraftController,
    createLocalStorageDraftStorage,
    createMemoryDraftStorage,
} from "@sometic/forms/drafts";
import type { DraftController, DraftRecord, DraftStorage } from "@sometic/forms/drafts";
```

Also available from the package root re-exports.

## Storage adapters

```ts
type DraftStorage = {
    getItem(key: string): string | null | Promise<string | null>;
    setItem(key: string, value: string): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
};
```

| Helper                                     | Behavior                                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| `createMemoryDraftStorage(map?)`           | In-memory `Map`, tests / ephemeral sessions               |
| `createLocalStorageDraftStorage(storage?)` | Lazy `globalThis.localStorage`; SSR-safe no-op if missing |

Bring your own adapter for IndexedDB, sessionStorage, or remote drafts.

## Draft record

```ts
type DraftRecord<T> = {
    version: number;
    savedAt: number;
    values: T;
};
```

`save` writes JSON with `Date.now()`. `load` compares `version`; on mismatch it calls optional `migrate` or returns `null`.

## Controller

```ts
const form = createForm({
    defaultValues: { title: "", body: "" },
});

const drafts = createDraftController({
    key: "sometic:draft:post-editor",
    version: 1,
    storage: createLocalStorageDraftStorage(),
    getValues: () => form.getValues(),
    setValues: (values) => {
        form.reset(values);
    },
    debounceMs: 300,
    migrate: (draft) => {
        // map older shapes → current T, or return null to discard
        return draft.values as { title: string; body: string };
    },
});

await drafts.load();

const stop = form.subscribe(() => {
    drafts.scheduleSave();
});

// later
await drafts.save();
await drafts.clear();
drafts.dispose();
stop();
```

### API

| Method           | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `save()`         | Persist current `getValues()` immediately                          |
| `load()`         | Read draft; on success calls `setValues`; returns values or `null` |
| `clear()`        | Remove storage key                                                 |
| `scheduleSave()` | Debounced save (default `debounceMs: 300`)                         |
| `dispose()`      | Cancel timers / release                                            |

## Versioning and migration

Bump `version` when the shape of `defaultValues` changes incompatibly. Provide `migrate(draft)` to transform older `DraftRecord<unknown>` payloads, or return `null` to ignore them.

## Security and privacy

- Do not persist secrets (passwords, tokens, card data) to `localStorage`.
- Scope keys per user when accounts share a browser profile (`sometic:draft:${userId}:…`).
- Clear drafts after successful submit.
- Remember `localStorage` is origin-wide and readable by any script on the origin.

## SSR

`createLocalStorageDraftStorage` does not touch `localStorage` at import time. Call `load` in the browser (e.g. `onMounted` / `useEffect`).

## Related

- [Forms overview](/forms/)
- [Fields](/forms/fields)
- [Form component](/components/form)
- [SSR guide](/guide/ssr)
