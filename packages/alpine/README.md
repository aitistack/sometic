# `@sometic/alpine`

Alpine.js adapters for Sometic: store bind, button bind, and lifecycle cleanup via Alpine `cleanup`.

```bash
pnpm add @sometic/alpine alpinejs
```

```ts
import { bindAlpineButton, createAlpineStoreBind } from "@sometic/alpine";

const store = createAlpineStoreBind({ count: 0 });
```

Capability: **storeBind** + **button**. Docs: https://sometic.aitistack.com
