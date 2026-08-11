# HTMX (Experimental)

Wave C HTML-first adapter. Claimed capabilities: **`storeBind`** and **`button`**, with swap-safe re-init. Not a full HTMX component catalog.

Prefer [Elements](/frameworks/vanilla) or Wave A when you need forms, overlays, and auth UI.

## Overview

| Item         | Value                                             |
| ------------ | ------------------------------------------------- |
| Package      | `@sometic/htmx`                                   |
| Exports      | `.` only                                          |
| Capabilities | `storeBind`, `button` (`htmxAdapterCapabilities`) |
| Peer         | `htmx.org` `^2` (optional peer)                   |
| Maturity     | Experimental                                      |

### When to use

- Server-rendered HTML enhanced with HTMX swaps that must rebind Sometic buttons without stacking listeners.
- You keep native HTML fragments as the source of truth.

### When not to use

- Expecting HTMX attributes for every Sometic overlay or form control. Only store bind + button helpers ship.

## Installation

<InstallCommands packages="@sometic/htmx" />

Install `htmx.org` in the page when you rely on HTMX events. The peer is optional so the bind helpers can load in tests without HTMX.

## API surface

```ts
import {
    createHtmxStoreBind,
    bindHtmxButton,
    createHtmxBinderRoot,
    htmxAdapterCapabilities,
    type HtmxBinderRoot,
} from "@sometic/htmx";
```

| Export                 | Role                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------- |
| `createHtmxStoreBind`  | Store bind with `get` / `set` / `update` / `subscribe` / `dispose`                     |
| `bindHtmxButton`       | Bind one `HTMLButtonElement`                                                           |
| `createHtmxBinderRoot` | Register selectors, `scan`, dispose disconnected nodes; listens for `htmx:afterSettle` |

## Usage

### Binder root (swap-safe)

```ts
import { bindHtmxButton, createHtmxBinderRoot } from "@sometic/htmx";

const root = createHtmxBinderRoot(document.body);

root.register({
    selector: "[data-sometic-button]",
    bind: (el) => {
        if (!(el instanceof HTMLButtonElement)) {
            return {
                get disposed() {
                    return true;
                },
                dispose() {},
            };
        }
        return bindHtmxButton(el, () => ({
            onPress: () => console.log("pressed"),
        }));
    },
});

root.scan();
```

After HTMX settles, the root disposes disconnected bindings and rebinds matches so swaps do not stack listeners. Call `root.dispose()` when tearing down the page section.

### Store bind

```ts
import { createHtmxStoreBind } from "@sometic/htmx";

const store = createHtmxStoreBind({ count: 0 });
store.update((state) => ({ count: state.count + 1 }));
store.dispose();
```

## Limits (honest)

- Capabilities stop at store bind + button.
- You must choose stable selectors and return real `Disposable`s from `bind`.
- No automatic wiring of `sometic-form` or overlays through HTMX attributes.
- CLI does not scaffold HTMX.

## FAQ

### Why not bind on every `htmx:load` manually?

`createHtmxBinderRoot` centralizes dispose + rescan so partial swaps do not leak. Prefer it over ad-hoc listeners.

### Can I use Elements with HTMX?

Yes. Register elements once, let HTMX swap HTML, and ensure upgraded tags appear in the fragment. Still avoid double-binding the same control with `bindHtmxButton`.

## Related

- [Compatibility](/frameworks/compatibility)
- [Stores](/stores/)
- [Components](/components/)
- [Beta maturity](/releases/beta)
- [Vanilla](/frameworks/vanilla)
