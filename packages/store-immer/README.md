# `@sometic/store-immer`

Optional Immer adapter for `@sometic/store`. Immer is a **peer dependency** and is never bundled into `@sometic/store`.

```bash
pnpm add @sometic/store @sometic/store-immer immer
```

```ts
import { createImmerStore } from "@sometic/store-immer";

const store = createImmerStore({ count: 0, nested: { ok: true } });
store.produce((draft) => {
    draft.count += 1;
});
```

## License

MIT
