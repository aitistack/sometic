# Context menu

Pointer-positioned menu opened at client coordinates (`openAt(x, y)` on the controller). Same `role="menu"` semantics as Menu, with fixed positioning for the pointer.

<PreviewContextMenu />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { ContextMenu, MenuItem } from "@sometic/react/overlay";

export function Example() {
    const [open, setOpen] = useState(false);
    const [point, setPoint] = useState({ x: 0, y: 0 });
    return (
        <div
            onContextMenu={(event) => {
                event.preventDefault();
                setPoint({ x: event.clientX, y: event.clientY });
                setOpen(true);
            }}
        >
            Right-click me
            <ContextMenu open={open} onOpenChange={setOpen} x={point.x} y={point.y}>
                <MenuItem>Copy</MenuItem>
                <MenuItem>Paste</MenuItem>
            </ContextMenu>
        </div>
    );
}
```

```vue [Vue]
<!-- Vue adapter not shipped for this surface yet. Use React or @sometic/dom (Vanilla). -->
```

```js [Vanilla]
import { createContextMenuController, resolveContextMenu } from "@sometic/dom/context-menu";
import { resolveMenuItem } from "@sometic/dom/menu";

const panel = document.querySelector("#context-menu");
const controller = createContextMenuController({
    defaultOpen: false,
    getContent: () => panel,
    onOpenChange: (open) => {
        panel.hidden = !open;
    },
});

document.querySelector("#surface").addEventListener("contextmenu", (event) => {
    event.preventDefault();
    controller.openAt(event.clientX, event.clientY);
    const view = resolveContextMenu({
        open: true,
        x: event.clientX,
        y: event.clientY,
    });
    Object.assign(panel.style, view.style);
    for (const [key, value] of Object.entries(view.attributes)) {
        panel.setAttribute(key, value);
    }
});

for (const item of panel.querySelectorAll("[data-menuitem]")) {
    const view = resolveMenuItem({});
    for (const [key, value] of Object.entries(view.attributes)) {
        item.setAttribute(key, value);
    }
}
```

```html [Custom Elements (Web Components)]
<!-- CE not shipped for this surface. Use React, Vue, or @sometic/dom (Vanilla) above. -->
```

```html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
```
:::

> Custom element not shipped in this beta; use the DOM controller.

Custom element **not shipped** for Context menu. Vanilla uses `@sometic/dom/context-menu`. React + DOM are primary; no Vue ContextMenu component.

## How it works

1. **Resolve (`resolveContextMenu`)**: `role="menu"` plus fixed `left` / `top` from `x` / `y`.
2. **Controller (`createContextMenuController`)**: `openAt(x, y)` stores coordinates and opens; non-modal overlay chrome.
3. **React**: syncs `open` and coordinates through the controller; reuse `MenuItem` for items.

## Anatomy

| Part         | Role              |
| ------------ | ----------------- |
| Context menu | `role="menu"`     |
| Menu item    | `role="menuitem"` |

## Props / attributes

### React `ContextMenuProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the panel when open.

| Prop           | Type                      | Default | Description            |
| -------------- | ------------------------- | ------- | ---------------------- |
| `open`         | `boolean`                 | —       | Controlled open        |
| `defaultOpen`  | `boolean`                 | `false` | Uncontrolled initial   |
| `onOpenChange` | `(open: boolean) => void` | —       | Open changes           |
| `x`            | `number`                  | `0`     | Viewport X coordinate  |
| `y`            | `number`                  | `0`     | Viewport Y coordinate  |
| `children`     | `ReactNode`               | —       | Usually `MenuItem`s    |
| Native attrs   | remaining div HTML attrs  | —       | Forwarded to the panel |

### React `MenuItemProps`

See [Menu](/components/menu) — same `MenuItem` component (`disabled`, `checked`, children, forwarded div attrs).

### Vue

No Vue `ContextMenu` component. Use React or `@sometic/dom/context-menu`.

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

Pass `open` + `onOpenChange` for controlled apps. Omit `open` and use `defaultOpen` for local state; still sync `x` / `y` when opening.

## Accessibility

- Prevent the browser menu with `event.preventDefault()` on `contextmenu`.
- Close on outside click / Escape via the overlay controller.
- Reuse `MenuItem` for item roles.

## Styling

Target `[role="menu"]`, fixed `left` / `top` from resolve, `[data-state]`.

## When to use / When not

**Use** for canvas / list item contextual actions.

**Do not use** for toolbar menus ([Menu](/components/menu)).

## FAQ

**Same roles as Menu?** Yes (`role="menu"` / menuitem).

**How do I set position?** Pass `x` / `y` (React) or call `openAt(x, y)` on the DOM controller.

**Is there an `sometic-context-menu`?** No. CE not shipped.

**Vue adapter?** Not shipped. React + DOM primary.

**Does React forward native attrs?** Yes, onto the panel when open.

## Related links

- [Menu](/components/menu)
- [Popover](/components/popover)
- [Styling slots](/concepts/styling-slots)
