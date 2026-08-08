# Alpine.js (Experimental)

Wave C HTML-first adapter. Claimed capabilities: **`storeBind`** and **`button`**. Not a full Alpine component kit for forms, overlays, or auth.

Prefer [Elements](/frameworks/vanilla) or Wave A frameworks when you need the full control surface.

## Overview

| Item         | Value                                               |
| ------------ | --------------------------------------------------- |
| Package      | `@sometic/alpine`                                   |
| Exports      | `.` only                                            |
| Capabilities | `storeBind`, `button` (`alpineAdapterCapabilities`) |
| Peer         | `alpinejs` `^3.14` (optional peer)                  |
| Maturity     | Experimental                                        |

### When to use

- Alpine pages that need Sometic button behavior and a disposable store bind.
- You will keep native HTML and Alpine directives as the composition layer.

### When not to use

- Expecting Alpine magics for every Sometic component family. Only store bind + button helpers ship today.

## Installation

::: code-group

```bash [npm]
npm install @sometic/alpine @sometic/store
```

```bash [pnpm]
pnpm add @sometic/alpine @sometic/store
```

```bash [yarn]
yarn add @sometic/alpine @sometic/store
```

```bash [bun]
bun add @sometic/alpine @sometic/store
```

:::

## API surface

```ts
import {
    createAlpineStoreBind,
    bindAlpineButton,
    createAlpineSometicPlugin,
    alpineAdapterCapabilities,
    type AlpineStoreBind,
} from "@sometic/alpine";
```

| Export                      | Role                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| `createAlpineStoreBind`     | Store bind with `get` / `set` / `update` / `subscribe` / `dispose`  |
| `bindAlpineButton`          | Bind a real `HTMLButtonElement` via `@sometic/dom` options          |
| `createAlpineSometicPlugin` | Optional Alpine plugin registering a directive using button options |

Pass Alpine’s `cleanup` into `bindAlpineButton` so dispose runs when the element is removed.

## Usage

### Store bind

```ts
import { createAlpineStoreBind } from "@sometic/alpine";

const store = createAlpineStoreBind({ count: 0 });
store.update((state) => ({ count: state.count + 1 }));
store.dispose();
```

### Button with Alpine cleanup

```ts
import { bindAlpineButton, createAlpineStoreBind } from "@sometic/alpine";

const store = createAlpineStoreBind({ count: 0 });
const button = document.querySelector("button");

if (button instanceof HTMLButtonElement) {
    bindAlpineButton(
        button,
        () => ({
            onPress: () => store.update((state) => ({ count: state.count + 1 })),
        }),
        cleanup,
    );
}
```

Pass Alpine’s `utilities.cleanup` from a directive as the third argument so dispose runs when the node is removed.

### Plugin

```ts
import Alpine from "alpinejs";
import { createAlpineSometicPlugin } from "@sometic/alpine";

Alpine.plugin(
    createAlpineSometicPlugin(() => ({
        onPress: () => console.log("pressed"),
    })),
);
Alpine.start();
```

Registers an `sometic-button` directive that binds matching `<button>` elements. Confirm options against the shipped `.d.ts`; the plugin is a thin registration helper, not a full UI system.

## Limits (honest)

- No form, input, overlay, auth, or HTTP Alpine adapters.
- Native HTML stays the source of truth; Sometic does not replace Alpine’s reactivity model.
- CLI does not scaffold Alpine.
- Lifecycle safety depends on passing `cleanup` correctly. Skipping it leaks listeners.

## FAQ

### Can I use `sometic-*` elements with Alpine?

Yes. Register Elements and drive them from Alpine. Do not double-bind the same button with both `bindAlpineButton` and a conflicting element controller.

### Is Wave C production UI?

Experimental contract surface. See [Beta maturity](/releases/beta).

## Related

- [Compatibility](/frameworks/compatibility)
- [Stores](/stores/)
- [Components](/components/)
- [Beta maturity](/releases/beta)
- [Vanilla](/frameworks/vanilla)
