# `@sometic/drafts`

App and entity draft persistence for Sometic: save in-progress document state to memory or `localStorage`, restore it later, and migrate when your schema version changes.

`createDraftController` is for entity drafts (notes, invoices, editors), not form field drafts. Form value drafts stay in [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms). Storage is injectable, so tests use memory while browsers can use `localStorage` without import-time browser access.

Why it exists: draft save looks simple until you need debounce, pick/omit/sanitize, version migration, and serialized writes that survive rapid edits. This package owns that lifecycle so every framework restores the same record.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only.

Docs: [introduction](https://sometic.dev/guide/introduction) and [https://sometic.dev](https://sometic.dev).

## Install

```bash
pnpm add @sometic/drafts
```

```bash
npm install @sometic/drafts
```

```bash
yarn add @sometic/drafts
```

## Usage

```ts
import {
    createDraftController,
    createLocalStorageDraftStorage,
    createMemoryDraftStorage,
} from "@sometic/drafts";

let values = { title: "", body: "" };

const drafts = createDraftController({
    key: "note:draft",
    version: 1,
    storage: createLocalStorageDraftStorage(),
    getValues: () => values,
    setValues: (next) => {
        values = next;
    },
    debounceMs: 300,
    omit: ["password"],
});

await drafts.load();
drafts.scheduleSave();
await drafts.clear();
drafts.dispose();
```

Use memory storage in tests or SSR:

```ts
const storage = createMemoryDraftStorage();
const drafts = createDraftController({
    key: "note:draft",
    version: 1,
    storage,
    getValues: () => values,
    setValues: (next) => {
        values = next;
    },
});
```

## API

- `createDraftController({ key, version, storage, getValues, setValues, debounceMs?, migrate?, omit?, pick?, sanitize?, now? })`.
- `save()`, `load()`, `clear()`, `scheduleSave()`.
- `createMemoryDraftStorage(map?)`, `createLocalStorageDraftStorage(storage?)`.
- `dispose()`, `disposed`.

Version mismatches return `null` unless you provide `migrate`. Blank keys, bad versions, parse failures, and calls after `dispose()` throw typed errors (`DRAFT_*`).

## When not to use

Skip it for plain form field restore; use `@sometic/forms` drafts instead. Prefer a real sync backend when drafts must survive across devices or require conflict merge. This package persists one keyed record at a time; it is not a CRDT or multiplayer store.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [https://sometic.dev](https://sometic.dev)

## License

MIT
