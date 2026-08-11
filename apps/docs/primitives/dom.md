# DOM

`@sometic/dom` is the imperative behavior layer for Sometic controls and overlays. Framework adapters and `sometic-*` custom elements call these controllers; they do not reimplement button, field, or dialog logic per framework.

Early stubs described this package as “portal / scroll lock only.” Those helpers live in [`@sometic/accessibility`](/primitives/accessibility). `@sometic/dom` owns **control engines**: resolve view-models, bind to elements, and orchestrate open / value / async state.

## Overview

| Family              | Example subpaths                                                                                                                       | Role                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Buttons             | `/button`, `/icon-button`, `/toggle-button`, `/async-button`, `/button-group`                                                          | Press, toggle, async, grouping        |
| Fields / inputs     | `/field`, `/input`, `/input-password`, `/input-otp`, `/input-number`, `/input-file`, `/input-masked`, `/input-currency`, `/input-date` | Field ids, native input controllers   |
| Selection           | `/checkbox`, `/radio`, `/switch`, `/select`                                                                                            | Boolean / group / select engines      |
| Overlays / feedback | `/overlay`, `/dialog`, `/popover`, `/tooltip`, `/toast`, `/alert`                                                                      | Open state, positioning hooks, queues |

### When to use

- Vanilla or custom-element integrations that need the same behavior as React / Vue adapters
- Tests that drive controllers without mounting a framework
- Building a new adapter that must stay thin

### When not to use

- Prefer [Components](/components/) when you want React, Vue, or CE markup directly
- Focus traps, portals, scroll lock, announcers → [`@sometic/accessibility`](/primitives/accessibility)
- Placement math alone → [`@sometic/positioning`](/primitives/positioning)
- Form-wide draft / submit orchestration → [`@sometic/forms`](/forms/)

## Installation

<InstallCommands packages="@sometic/dom" />

Depends on foundation packages such as core, styling, accessibility, positioning, and date-core as needed by each subpath. Prefer **subpath imports**.

## Usage

### Button resolve + bind

```ts
import { resolveButton, bindButton } from "@sometic/dom/button";

const view = resolveButton({
    disabled: false,
    type: "button",
});

const button = document.querySelector("button");
if (button instanceof HTMLButtonElement) {
    const binding = bindButton(button, () => ({
        type: "button",
        onPress: () => {
            console.log("pressed");
        },
    }));
    binding.dispose();
}
```

### Field + input controller

```ts
import { createFieldIds, resolveField } from "@sometic/dom/field";
import { createInputController } from "@sometic/dom/input";

const ids = createFieldIds("email");
resolveField({
    ids,
    required: true,
});

createInputController({
    defaultValue: "",
    onValueChange: (value) => {
        console.log(value);
    },
});
```

### Dialog / popover (engines)

```ts
import { createDialogController } from "@sometic/dom/dialog";
import { createPopoverController } from "@sometic/dom/popover";

const dialog = createDialogController({
    defaultOpen: false,
    getContent: () => document.getElementById("dialog"),
    getTrigger: () => document.getElementById("open-dialog"),
});
dialog.setOpen(true);
dialog.setOpen(false);
dialog.dispose();

const popover = createPopoverController({
    defaultOpen: false,
    getContent: () => document.getElementById("popover"),
    getTrigger: () => document.getElementById("open-popover"),
});
popover.setOpen(true);
popover.dispose();
```

For product-facing props, keyboard matrices, and framework examples, use the component pages. This page documents the engine package boundary.

## Key APIs (map)

| Subpath                                  | Primary exports                                               |
| ---------------------------------------- | ------------------------------------------------------------- |
| `/button`                                | `resolveButton`, `bindButton`, `handleButtonPress`            |
| `/icon-button`                           | `resolveIconButton`                                           |
| `/toggle-button`                         | `createToggleButtonController`, `resolveToggleButton`         |
| `/async-button`                          | `createAsyncButtonController`                                 |
| `/button-group`                          | `resolveButtonGroup`                                          |
| `/field`                                 | `createFieldIds`, `resolveField`                              |
| `/input*`                                | `create*Controller`, `resolve*`, `bindInput` where applicable |
| `/checkbox` `/radio` `/switch` `/select` | Controllers + resolve helpers                                 |
| `/dialog` `/popover` `/tooltip`          | `create*Controller`, `resolve*`                               |
| `/toast`                                 | `createToastQueue`                                            |
| `/alert`                                 | `resolveAlert`                                                |
| `/overlay`                               | `createOverlayController`                                     |

Root `@sometic/dom` re-exports these surfaces. Subpaths keep bundles small.

## How it works

Controllers hold controllable open / value state (via `@sometic/core`), emit view-models for slots and state attributes (via `@sometic/styling`), and compose accessibility / positioning helpers when overlays need them. Adapters map view-models to JSX, Vue render functions, or custom elements without copying business rules.

SSR: factories must not touch `window` / `document` at import time. Bind / activate only in browser lifecycles.

## Edge cases

| Edge                      | Behavior                                                                   |
| ------------------------- | -------------------------------------------------------------------------- |
| Dispose                   | Always `dispose()` controllers and bindings to drop listeners              |
| Controlled open / value   | Sync external props into controller options each update (adapters do this) |
| Date inputs               | Inject a [`DateAdapter`](/primitives/date)                                 |
| Select vs Menu / Combobox | Select is native `<select>`; Menu / Combobox are separate shipped surfaces |

## FAQ

### Is `@sometic/dom` the same as accessibility portal helpers?

No. Portal, scroll lock, and observers ship from `@sometic/accessibility`. DOM controllers _compose_ those helpers inside overlay engines.

### Should app code import `@sometic/dom` directly?

Optional. Framework apps usually import `@sometic/react` / `@sometic/vue` / `@sometic/elements`. Vanilla apps and adapter authors import DOM subpaths.

### Where are component docs?

[Components](/components/) (Button, Field, Dialog, Popover, Toast, and the rest of Wave A).

### Tree-shaking?

Import `@sometic/dom/button` (and siblings), not only the root, when you need a single engine.

## Related

- [Components](/components/)
- [Accessibility](/primitives/accessibility)
- [Positioning](/primitives/positioning)
- [Styling](/primitives/styling)
- [Date adapters](/primitives/date)
- [Forms](/forms/)
- [Vanilla](/frameworks/vanilla)
- [Package index](/api/packages)
