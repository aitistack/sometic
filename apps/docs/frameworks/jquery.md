# jQuery (Experimental)

Wave C legacy adapter. Claimed capabilities: **`storeBind`** and **`button`**. Not a jQuery UI replacement and not a full Sometic component port.

Prefer Wave A ([React](/frameworks/react), [Vue](/frameworks/vue), [Elements](/frameworks/vanilla)) for new apps.

## Overview

| Item         | Value                                               |
| ------------ | --------------------------------------------------- |
| Package      | `@sometic/jquery`                                   |
| Exports      | `.` only                                            |
| Capabilities | `storeBind`, `button` (`jqueryAdapterCapabilities`) |
| Peer         | `jquery` `^3.7` (optional peer)                     |
| Maturity     | Experimental                                        |

### When to use

- Existing jQuery pages that need Sometic button behavior and store bind without a SPA rewrite.
- You can call `destroy` when removing nodes.

### When not to use

- Greenfield apps. Use Wave A.
- Expecting widgets for dialog, form, or select. Not in this package.

## Installation

<InstallCommands packages="@sometic/jquery jquery" />

## API surface

```ts
import {
    createJQueryStoreBind,
    bindJQueryButton,
    registerJQueryAdapters,
    jqueryAdapterCapabilities,
    type JQueryStoreBind,
} from "@sometic/jquery";
```

| Export                   | Role                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| `createJQueryStoreBind`  | Store bind with `get` / `set` / `update` / `subscribe` / `dispose` |
| `bindJQueryButton`       | Low-level bind returning a `Disposable`                            |
| `registerJQueryAdapters` | Installs `$.fn.someticButton` plugin API                           |

Plugin command union: options object, options factory, or `"destroy"`.

## Usage

```ts
import $ from "jquery";
import { bindJQueryButton, createJQueryStoreBind, registerJQueryAdapters } from "@sometic/jquery";

const store = createJQueryStoreBind({ count: 0 });
registerJQueryAdapters($);

$("button").someticButton(() => ({
    onPress: () => store.update((state) => ({ count: state.count + 1 })),
}));

$("button").someticButton("destroy");
store.dispose();
```

Low-level path without the plugin:

```ts
const button = document.querySelector("button");
if (button instanceof HTMLButtonElement) {
    const binding = bindJQueryButton(button, () => ({ onPress: () => {} }));
    binding.dispose();
}
```

## Limits (honest)

- Always destroy before removing nodes when you are not going through the plugin destroy path.
- No form / overlay / auth / HTTP jQuery adapters.
- Types use structural `JQueryStaticLike` so you can pass a compatible `$` without fighting DefinitelyTyped edges.
- CLI does not scaffold jQuery.

## FAQ

### Does this depend on jQuery UI?

No. Peer is `jquery` only.

### Can I mix with Elements?

Yes, carefully. Do not attach both `someticButton` and an `sometic-button` controller to the same DOM node.

## Related

- [Compatibility](/frameworks/compatibility)
- [Stores](/stores/)
- [Components](/components/)
- [Beta maturity](/releases/beta)
