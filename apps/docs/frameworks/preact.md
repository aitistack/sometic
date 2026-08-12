# Preact (Experimental)

Wave B foundation adapter. **`storeBind` only.** This is not a drop-in replacement for `@sometic/react`.

Prefer `@sometic/react` when you run React, or [Elements](/frameworks/vanilla) for host-agnostic UI.

## Overview

| Item         | Value                                     |
| ------------ | ----------------------------------------- |
| Package      | `@sometic/preact`                         |
| Exports      | `.` only                                  |
| Capabilities | `storeBind` (`preactAdapterCapabilities`) |
| Peer         | `preact` `^10` (optional peer)            |
| Maturity     | Experimental                              |

### When to use

- Preact app that needs an external-store-shaped bind (`getSnapshot` / `subscribe` / `set`) for Sometic state.
- You will write Preact components yourself or host Elements.

### When not to use

- Expecting React component re-exports under `@sometic/preact/button`. Not shipped.
- Using `preact/compat` with `@sometic/react` is **not** a claimed support path.

## Installation

<InstallCommands packages="@sometic/preact @sometic/store" />

This is the full Preact install for this beta. Do not add `@sometic/preact/button` or `@sometic/preact/structure`: those subpaths do not exist.

## Components

**Not shipped.** `@sometic/preact` has no button, form, overlay, or structure components. Phase 20 surfaces live here:

| Surface                                                                                | Package                                                                                                                         |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Tabs, Accordion, Breadcrumb, Command palette, Tree, Badge, Progress, Spinner, Skeleton | `@sometic/react/structure` or `@sometic/vue/structure`                                                                          |
| Vanilla / no framework UI                                                              | `@sometic/dom` controllers or `@sometic/elements` where a CE exists                                                             |
| Preact UI in this beta                                                                 | Host [custom elements](/frameworks/vanilla) next to `createPreactStoreBind`, or write your own Preact views over `@sometic/dom` |

`preact/compat` plus `@sometic/react` is **not** a claimed support path.

## API surface

```ts
import {
    createPreactStoreBind,
    preactAdapterCapabilities,
    type PreactStoreBind,
} from "@sometic/preact";
```

| Member                     | Role                                   |
| -------------------------- | -------------------------------------- |
| `store`                    | Underlying Sometic store               |
| `getSnapshot()`            | Snapshot (external-store style)        |
| `subscribe(onStoreChange)` | Subscribe; listener takes no state arg |
| `set(state)`               | Replace state                          |
| `dispose()`                | Tear down                              |

Shape aligns with `useSyncExternalStore`-style APIs. There is no packaged `useStore` hook in `@sometic/preact`.

## Usage

```ts
import { createPreactStoreBind } from "@sometic/preact";

const bind = createPreactStoreBind({ count: 0 });

const stop = bind.subscribe(() => {
    console.log(bind.getSnapshot().count);
});

bind.set({ count: 1 });

stop();
bind.dispose();
```

## Limits (honest)

- Capabilities: `["storeBind"]` only.
- No button / form / overlay / structure / auth / HTTP Preact adapters.
- Phase 20 Command palette and Tree are React, Vue, and Vanilla only.
- Not validated as a compat layer over `@sometic/react`.
- CLI does not scaffold Preact.

## FAQ

### Can I import React adapters into Preact?

Not a supported claim. Use this bind + your Preact UI, or Elements.

### Why `getSnapshot` instead of `get`?

Matches external-store naming familiar to Preact/React subscription helpers.

## Related

- [Compatibility](/frameworks/compatibility)
- [Stores](/stores/)
- [Components](/components/)
- [Beta maturity](/releases/beta)
- [React](/frameworks/react)
