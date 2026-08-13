# Menu

Non-modal menu surface with `role="menu"`, open state, and overlay dismiss (Escape / outside press). Pair with `MenuItem` (`role="menuitem"`) for item semantics.

<PreviewMenu />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Menu, MenuItem } from "@sometic/react/overlay";

export function Example() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Actions
            </button>
            <Menu open={open} onOpenChange={setOpen}>
                <MenuItem>Edit</MenuItem>
                <MenuItem>Duplicate</MenuItem>
                <MenuItem disabled>Delete</MenuItem>
            </Menu>
        </>
    );
}
```

```vue [Vue]
<!-- Vue adapter not shipped for this surface yet. Use React or @sometic/dom (Vanilla). -->
```

```js [Vanilla]
import { createMenuController, resolveMenu, resolveMenuItem } from "@sometic/dom/menu";

const panel = document.querySelector("#menu");
const controller = createMenuController({
    defaultOpen: false,
    getContent: () => panel,
    onOpenChange: (open) => {
        const view = resolveMenu({ open });
        Object.assign(panel.dataset, { state: view.attributes["data-state"] });
        panel.hidden = !open;
    },
});

document.querySelector("#open-menu").addEventListener("click", () => {
    controller.setOpen(true);
});

for (const item of panel.querySelectorAll("[data-menuitem]")) {
    const view = resolveMenuItem({
        disabled: item.hasAttribute("disabled"),
    });
    Object.assign(item, { role: "menuitem" });
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

## How it works

1. **Resolve (`resolveMenu` / `resolveMenuItem`)**: menu and menuitem ARIA plus `data-state` / disabled attrs.
2. **Controller (`createMenuController`)**: non-modal overlay with optional positioning update via `updatePosition`.
3. **React**: Menu owns the controller; MenuItem is resolve-only.

## Anatomy

| Part      | Role              |
| --------- | ----------------- |
| Menu root | `role="menu"`     |
| Menu item | `role="menuitem"` |

## Props / attributes

### React `MenuProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the panel when open (`ref` supported via the panel element).

| Prop           | Type                      | Default | Description              |
| -------------- | ------------------------- | ------- | ------------------------ |
| `open`         | `boolean`                 | —       | Controlled open          |
| `defaultOpen`  | `boolean`                 | `false` | Uncontrolled initial     |
| `onOpenChange` | `(open: boolean) => void` | —       | Open changes             |
| `children`     | `ReactNode`               | —       | Usually `MenuItem` nodes |
| Native attrs   | remaining div HTML attrs  | —       | Forwarded to the panel   |

### React `MenuItemProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the item root.

| Prop         | Type                     | Default | Description                    |
| ------------ | ------------------------ | ------- | ------------------------------ |
| `disabled`   | `boolean`                | `false` | Sets `aria-disabled`           |
| `checked`    | `boolean`                | `false` | Optional checked presentation  |
| `children`   | `ReactNode`              | —       | Item label                     |
| Native attrs | remaining div HTML attrs | —       | Forwarded to the menuitem root |

### Vue

No Vue `Menu` / `MenuItem` component adapter. Use React or the DOM controller. `@sometic/vue` does not re-export a Menu surface; call `@sometic/dom/menu` from a Vue setup if needed.

### Custom element

**CE not shipped.** Use Vanilla DOM controller above (or React).

## Events / callbacks

| Surface        | Event          | Payload   |
| -------------- | -------------- | --------- |
| React          | `onOpenChange` | `boolean` |
| Vue            | —              | —         |
| Custom element | —              | —         |
| DOM controller | `onOpenChange` | `boolean` |

## Controlled vs uncontrolled

- **Controlled:** pass `open` and update from `onOpenChange` (including Escape / outside press).
- **Uncontrolled:** omit `open`, use `defaultOpen`; dismiss still notifies `onOpenChange`.

## Accessibility

- Use real menu/menuitem roles from resolve.
- Keep a clear trigger with `aria-haspopup="menu"` in your opener when composing.
- Prefer keyboard handling in your app layer for arrow keys in this beta (roving focus helpers can wrap the list).

## Styling

Target `[role="menu"]`, `[role="menuitem"]`, `[data-disabled]`, `[data-state]`.

## When to use / When not

**Use** for action menus and command lists.

**Do not use** for modal confirmations ([Dialog](/components/dialog)) or pointer-positioned context menus ([Context menu](/components/context-menu)).

## FAQ

**Modal?** No. Outside press and Escape dismiss.

**Positioning?** Call `updatePosition` on the DOM controller, or style the panel yourself in React.

**Is there an `sometic-menu` custom element?** No. CE not shipped — use `@sometic/dom/menu` or React.

**Vue component?** Not shipped. React + DOM are primary.

**Does React forward native attrs?** Yes, remaining `HTMLAttributes<HTMLDivElement>` merge onto the panel / item.

**SSR?** Create controllers only in the browser.

## Related links

- [Context menu](/components/context-menu)
- [Popover](/components/popover)
- [Drawer](/components/drawer)
- [Styling slots](/concepts/styling-slots)
