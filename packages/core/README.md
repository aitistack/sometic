# `@sometic/core`

Framework-independent foundation primitives for Sometic.

## Install

```bash
pnpm add @sometic/core
```

## Quick start

```ts
import { createDisposable, createControllableState, createAsyncOperation } from "@sometic/core";

const state = createControllableState({ defaultValue: "" });
const operation = createAsyncOperation(async (signal, id: string) => {
    const response = await fetch(`/api/${id}`, { signal });
    return response.json();
});
```

Prefer subpaths such as `@sometic/core/utils` for tree-shaking.

## Documentation

- Consumer: `docs/consumer/core/`
- Maintainer: `docs/maintainer/core/`

## License

MIT
