# Angular (Experimental)

Wave B foundation adapter. **`storeBind` only.** There is no Angular component kit for button, input, form, or overlay in this package yet.

Prefer [React](/frameworks/react), [Vue](/frameworks/vue), or [Elements](/frameworks/vanilla) for production UI. Use this package when you need Sometic store semantics inside an Angular `^19` app while you own the templates.

## Overview

| Item         | Value                                      |
| ------------ | ------------------------------------------ |
| Package      | `@sometic/angular`                         |
| Exports      | `.` only (no `/button`, `/form`, …)        |
| Capabilities | `storeBind` (`angularAdapterCapabilities`) |
| Peer         | `@angular/core` `^19` (optional peer)      |
| Maturity     | Experimental                               |

### When to use

- You already run Angular and want a disposable Sometic store bind with `get` / `set` / `update` / `subscribe`.
- You will render UI with Angular templates, Elements, or your own components.

### When not to use

- You expect `@sometic/angular/button` or form directives. They are not shipped.
- You can use React / Vue / Elements instead for Wave A completeness.

## Installation

<InstallCommands packages="@sometic/angular @sometic/store" />

## API surface

```ts
import {
    createAngularStoreBind,
    angularAdapterCapabilities,
    type AngularStoreBind,
} from "@sometic/angular";
```

`AngularStoreBind<TState>` extends `AdapterLifecycleContract` (`dispose()`) and exposes:

| Member                | Role                                 |
| --------------------- | ------------------------------------ |
| `store`               | Underlying `@sometic/store` instance |
| `get()`               | Snapshot                             |
| `set(state)`          | Replace state                        |
| `update(updater)`     | Functional update                    |
| `subscribe(listener)` | Listen; returns unsubscribe          |
| `dispose()`           | Tear down                            |

## Usage

```ts
import { createAngularStoreBind } from "@sometic/angular";

const bind = createAngularStoreBind({ count: 0 });

bind.update((state) => ({ count: state.count + 1 }));
const stop = bind.subscribe((state) => {
    console.log(state.count);
});

stop();
bind.dispose();
```

Wire `get` / `subscribe` into Angular change detection yourself (signals, async pipe patterns, or manual `markForCheck`). This package does not ship a `Signal` or `NgModule` integration beyond the bind object.

## Limits (honest)

- No button, field, input, form, overlay, auth, or HTTP Angular adapters.
- CLI `--framework` does not accept `angular`.
- Capability list is exactly `["storeBind"]`.
- For UI, compose with `@sometic/elements` or wait for a future Wave expansion.

## FAQ

### Is this production-ready UI?

No. Experimental store-bind foundation only. See [Beta maturity](/releases/beta).

### Can I use Elements inside Angular?

Yes. Register `sometic-*` in the browser and host them in templates. Keep one source of truth for state.

### Do I need to dispose?

Yes. Call `dispose()` when the owning service or component is destroyed so subscriptions do not leak.

## Related

- [Compatibility](/frameworks/compatibility)
- [Stores](/stores/)
- [Components](/components/) (Wave A UI)
- [Beta maturity](/releases/beta)
