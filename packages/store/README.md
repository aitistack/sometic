# `@sometic/store`

Framework-independent external store for Sometic.

## Install

```bash
pnpm add @sometic/store
```

## Quick start

```ts
import { createStore, select } from "@sometic/store";

const store = createStore({ count: 0 });
const count = select(store, (state) => state.count);
store.update((state) => ({ count: state.count + 1 }));
```

Persistence:

```ts
import { createPersistentStore, createMemoryStorage } from "@sometic/store/persistent";
```

Cross-tab:

```ts
import { createCrossTabStore } from "@sometic/store/cross-tab";
```

## License

MIT
