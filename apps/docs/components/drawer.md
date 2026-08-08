# Drawer

Modal side panel with open state, `role="dialog"`, side placement (`data-side`), and the same modal overlay chrome as Dialog: portal mounting, body scroll lock, focus trap, and Escape dismiss.

<PreviewDrawer />

## Usage

::: code-group

```tsx [JS]
import { useState } from "react";
import { Drawer } from "@sometic/react/overlay";

export function Example() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Open
            </button>
            <Drawer open={open} onOpenChange={setOpen} side="right">
                Account settings
            </Drawer>
        </>
    );
}
```

```tsx [TS]
import { useState } from "react";
import { Drawer } from "@sometic/react/overlay";

export function Example(): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Open
            </button>
            <Drawer open={open} onOpenChange={setOpen} side="right">
                Account settings
            </Drawer>
        </>
    );
}
```

```js [Vanilla]
import { createDrawerController, resolveDrawer } from "@sometic/dom/drawer";

const panel = document.querySelector("#drawer");
const controller = createDrawerController({
    defaultOpen: false,
    side: "right",
    getContent: () => panel,
    onOpenChange: (open) => {
        const view = resolveDrawer({ open, side: "right" });
        for (const [key, value] of Object.entries(view.attributes)) {
            panel.setAttribute(key, value);
        }
        panel.hidden = !open;
    },
});

document.querySelector("#open-drawer").addEventListener("click", () => {
    controller.setOpen(true);
});
```

:::

> Custom element not shipped in this beta; use the DOM controller.

Custom element **not shipped** for Drawer. Vanilla uses `@sometic/dom/drawer`. React + DOM are primary; no Vue Drawer component.

## How it works

1. **Resolve (`resolveDrawer`)**: pure view model with `role="dialog"`, `data-side`, `data-state`, and `aria-modal` when open.
2. **Controller (`createDrawerController`)**: wraps `createOverlayController({ modal: true })` like Dialog.
3. **React adapter**: syncs `open` / `defaultOpen` / `side`, disposes on unmount, returns `null` when closed.

## Anatomy

| Part    | `data-slot` / attrs | Role                              |
| ------- | ------------------- | --------------------------------- |
| Panel   | `root`, `data-side` | Dialog surface anchored to a side |
| Trigger | —                   | App-owned opener                  |

## Props / attributes

### React `DrawerProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the panel when open.

| Prop           | Type                                     | Default   | Description                   |
| -------------- | ---------------------------------------- | --------- | ----------------------------- |
| `open`         | `boolean`                                | —         | Controlled open               |
| `defaultOpen`  | `boolean`                                | `false`   | Uncontrolled initial          |
| `onOpenChange` | `(open: boolean) => void`                | —         | Open changes including Escape |
| `side`         | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Placement side                |
| `children`     | `ReactNode`                              | —         | Panel content                 |
| Native attrs   | remaining div HTML attrs                 | —         | Forwarded to the panel        |

Engine resolve also supports `titleId`, `descriptionId`, `disabled`, and styling hooks (`unstyled`, `classes`, `styles`, `cssVariables`, …) when calling `resolveDrawer` / `createDrawerController` directly.

### Vue

No Vue `Drawer` component. Use React or `@sometic/dom/drawer`.

### Custom element

**CE not shipped.** Use Vanilla DOM controller or React.

## Events / callbacks

| Surface        | Event          | Payload   |
| -------------- | -------------- | --------- |
| React          | `onOpenChange` | `boolean` |
| Vue            | —              | —         |
| Custom element | —              | —         |
| DOM controller | `onOpenChange` | `boolean` |

## Controlled vs uncontrolled

- **Controlled:** pass `open` and update from `onOpenChange` (including Escape).
- **Uncontrolled:** omit `open`, use `defaultOpen`.

## Accessibility

- Modal path: focus trap, scroll lock, Escape dismiss, `aria-modal="true"`.
- Name the panel with `titleId` / `aria-label` (engine options or native attrs).
- Prefer one open drawer at a time.

## Styling

Target `[data-side]`, `[data-state="open"]`, `[role="dialog"]`. Unstyled by default.

## When to use / When not

**Use** for side settings panels and secondary flows that still need modal chrome.

**Do not use** for centered confirms ([Dialog](/components/dialog)) or non-modal menus ([Menu](/components/menu)).

## FAQ

**Same chrome as Dialog?** Yes. Modal overlay controller.

**Outside click?** Does not dismiss (modal).

**Is there an `sometic-drawer`?** No. CE not shipped.

**Vue adapter?** Not shipped. React + DOM primary.

**Does React forward native attrs?** Yes, onto the panel when open.

**SSR?** Create controllers only in the browser.

## Related links

- [Dialog](/components/dialog)
- [Menu](/components/menu)
- [Accessibility](/guide/accessibility)
- [Styling slots](/concepts/styling-slots)
