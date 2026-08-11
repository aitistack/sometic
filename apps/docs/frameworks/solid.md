# Solid (Experimental)

Wave B foundation adapter. **`storeBind` only.** No Solid component kit for Sometic controls.

Prefer [React](/frameworks/react), [Vue](/frameworks/vue), or [Elements](/frameworks/vanilla) for production UI.

## Overview

| Item         | Value                                    |
| ------------ | ---------------------------------------- |
| Package      | `@sometic/solid`                         |
| Exports      | `.` only                                 |
| Capabilities | `storeBind` (`solidAdapterCapabilities`) |
| Peer         | `solid-js` `^1.8` (optional peer)        |
| Maturity     | Experimental                             |

### When to use

- Solid app that needs a disposable Sometic store bind (`get` / `set` / `subscribe`).
- You bridge into Solid signals yourself.

### When not to use

- Expecting `@sometic/solid/button` or form primitives. Not shipped.

## Installation

<InstallCommands packages="@sometic/solid @sometic/store" />

## API surface

```ts
import {
    createSolidStoreBind,
    solidAdapterCapabilities,
    type SolidStoreBind,
} from "@sometic/solid";
```

| Member                | Role                        |
| --------------------- | --------------------------- |
| `store`               | Underlying Sometic store    |
| `get()`               | Snapshot                    |
| `set(state)`          | Replace state               |
| `subscribe(listener)` | Listen; returns unsubscribe |
| `dispose()`           | Tear down                   |

There is no `update` helper on the Solid bind. Use `set` with a new object, or call methods on `bind.store` when you need `update` / `batch` from `@sometic/store`.

## Usage

```ts
import { createSolidStoreBind } from "@sometic/solid";
import { createSignal, onCleanup } from "solid-js";

const bind = createSolidStoreBind({ count: 0 });
const [count, setCount] = createSignal(bind.get().count);

const stop = bind.subscribe((state) => setCount(state.count));
onCleanup(() => {
    stop();
    bind.dispose();
});

bind.set({ count: 1 });
```

## Limits (honest)

- Capabilities: `["storeBind"]` only.
- No Solid JSX component exports.
- CLI frameworks: `vanilla` \| `react` \| `vue` only.

## FAQ

### Does this create a Solid store?

It creates an Sometic store wrapped for Solid-friendly subscribe/get/set. You still connect to `createSignal` / `createStore` yourself if you want fine-grained JSX updates.

### Production UI?

Use Elements or Wave A. This package alone is not a UI kit.

## Related

- [Compatibility](/frameworks/compatibility)
- [Stores](/stores/)
- [Components](/components/)
- [Beta maturity](/releases/beta)
