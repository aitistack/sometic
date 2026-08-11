# Svelte (Experimental)

Wave B foundation adapter. **`storeBind` only.** No Svelte component library for Sometic button / input / form / overlay yet.

Prefer [React](/frameworks/react), [Vue](/frameworks/vue), or [Elements](/frameworks/vanilla) for production UI.

## Overview

| Item         | Value                                     |
| ------------ | ----------------------------------------- |
| Package      | `@sometic/svelte`                         |
| Exports      | `.` only                                  |
| Capabilities | `storeBind` (`svelteAdapterCapabilities`) |
| Peer         | `svelte` `^5` (optional peer)             |
| Maturity     | Experimental                              |

### When to use

- Svelte 5 app that needs an Sometic-backed store with a Svelte-friendly `subscribe` / `set` / `update` shape.
- You will build UI in `.svelte` files or host Elements.

### When not to use

- You expect `@sometic/svelte/button` components. Not shipped.
- You need Wave A completeness → use React, Vue, or Elements.

## Installation

<InstallCommands packages="@sometic/svelte @sometic/store" />

## API surface

```ts
import {
    createSvelteStoreBind,
    svelteAdapterCapabilities,
    type SvelteStoreBind,
} from "@sometic/svelte";
```

| Member            | Role                              |
| ----------------- | --------------------------------- |
| `store`           | Underlying Sometic store          |
| `subscribe(run)`  | Svelte store-compatible subscribe |
| `set(value)`      | Replace state                     |
| `update(updater)` | Functional update                 |
| `dispose()`       | Tear down                         |

`subscribe` follows the Svelte store contract closely enough to use with auto-subscription (`$`) patterns when you treat the bind as a store-like object. Always `dispose()` when the owner unmounts.

## Usage

```ts
import { createSvelteStoreBind } from "@sometic/svelte";

const bind = createSvelteStoreBind({ count: 0 });

const stop = bind.subscribe((state) => {
    console.log(state.count);
});

bind.update((state) => ({ count: state.count + 1 }));

stop();
bind.dispose();
```

## Limits (honest)

- Capability list is exactly `["storeBind"]`.
- No form / overlay / auth / HTTP Svelte adapters.
- CLI does not scaffold `framework: svelte`.
- Deferred catalogs remain deferred even if you host Elements.

## FAQ

### Is `$bind` officially supported?

The bind exposes `subscribe` / `set` / `update`. Treat auto-subscription as a convenience on top of that contract; verify in your Svelte 5 version. Dispose explicitly.

### Can I ship production UI with only this package?

No. Pair with Elements or a Wave A framework, or own the components yourself.

## Related

- [Compatibility](/frameworks/compatibility)
- [Stores](/stores/)
- [Components](/components/)
- [Beta maturity](/releases/beta)
