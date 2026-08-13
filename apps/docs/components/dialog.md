# Dialog

Modal dialog surface with open state, `role="dialog"`, and, via `createDialogController` / overlay, portal mounting, body scroll lock, focus trap, and Escape dismiss. React and Vue Dialog adapters use `createDialogController` (same modal overlay path as the custom element).

<PreviewDialog />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Dialog } from "@sometic/react/overlay";

export function Example() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Open
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
                Confirm?
            </Dialog>
        </>
    );
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { Dialog } from "@sometic/vue/overlay";

const open = ref(false);
</script>

<template>
    <button type="button" @click="open = true">Open</button>
    <Dialog v-model:open="open">Confirm?</Dialog>
</template>
```

```js [Vanilla]
import { createDialogController, resolveDialog } from "@sometic/dom/dialog";

const panel = document.querySelector("#dialog");
const controller = createDialogController({
    defaultOpen: false,
    getContent: () => panel,
    onOpenChange(next) {
        const view = resolveDialog({ open: next });
        panel.hidden = !next;
        for (const [key, attr] of Object.entries(view.attributes)) {
            panel.setAttribute(key, attr);
        }
    },
});

document.querySelector("#open").addEventListener("click", () => {
    controller.setOpen(true);
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerOverlayElements } from "@sometic/elements/overlay";
    registerOverlayElements();
</script>

<button type="button" id="open">Open</button>
<sometic-dialog>Confirm?</sometic-dialog>
<script type="module">
    document.getElementById("open").addEventListener("click", () => {
        document.querySelector("sometic-dialog").setAttribute("open", "");
    });
</script>
```

```html [CDN]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<button type="button" id="open">Open</button>
<sometic-dialog>Confirm?</sometic-dialog>
```

:::

## How it works

1. **Resolve (`resolveDialog`)**, pure view model: `role="dialog"`, `data-slot="root"`, `data-state="open"|"closed"`, `aria-modal` when open, optional `aria-labelledby` / `aria-describedby` from `titleId` / `descriptionId`.
2. **Controller (`createDialogController`)**, wraps `createOverlayController({ modal: true })`. On open: portal ensure, body scroll lock, focus trap (`returnFocus`, `initialFocus: "first"`), Escape dismiss. Outside press does **not** dismiss (modal). Optional `getTrigger` restores focus on close.
3. **Adapters**: React and Vue create a dialog controller bound to a panel ref, sync `open` / `defaultOpen` through `setOpen`, call `resolveDialog` for attributes, and dispose the controller on unmount. When closed, React/Vue return `null` (unmount panel).
4. **Custom element**: `sometic-dialog` moves children into `data-slot="panel"`, owns a controller, reflects `open`, emits `open-change`.

## Anatomy

| Part         | `data-slot`                     | Role                                                                |
| ------------ | ------------------------------- | ------------------------------------------------------------------- |
| Root / panel | `root` (resolve) / `panel` (CE) | Dialog surface                                                      |
| Trigger      | ,                               | App-owned; pass `getTrigger` on the DOM controller for return-focus |

Resolve attributes when open: `role="dialog"`, `aria-modal="true"`, `data-state="open"|"closed"`, optional labelledby/describedby.

## Props / attributes

### React `DialogProps`

`HTMLAttributes<HTMLDivElement>` plus:

| Prop             | Type                      | Default | Description                                       |
| ---------------- | ------------------------- | ------- | ------------------------------------------------- |
| `open`           | `boolean`                 | ,       | Controlled open                                   |
| `defaultOpen`    | `boolean`                 | `false` | Uncontrolled initial                              |
| `onOpenChange`   | `(open: boolean) => void` | ,       | Fired on Escape dismiss and when you call setters |
| `titleId`        | `string`                  | ,       | → `aria-labelledby`                               |
| `descriptionId`  | `string`                  | ,       | → `aria-describedby`                              |
| `children`       | `ReactNode`               | ,       | Dialog content                                    |
| Native div attrs | ,                         | ,       | Merged onto the panel when open                   |

Engine resolve also supports `disabled`, styling (`unstyled`, `classes`, `styles`, `cssVariables`, …), and controller-only `portalId` / `getTrigger` / `getContent` when you call `createDialogController` directly.

### Vue

Props: `open`, `defaultOpen`, `titleId`, `descriptionId`. Emits: `update:open`, `openChange`.

### Custom element (`sometic-dialog`)

Observed: `open`, `shadow`. Event: `open-change` → `{ open: boolean }`.

## Events / callbacks

| Surface        | Event                       | Payload             |
| -------------- | --------------------------- | ------------------- |
| React          | `onOpenChange`              | `boolean`           |
| Vue            | `update:open`, `openChange` | `boolean`           |
| Custom element | `open-change`               | `{ open: boolean }` |
| DOM controller | `onOpenChange`              | `boolean`           |

## Controlled vs uncontrolled

- **Controlled:** pass `open` and update it from `onOpenChange` (including Escape).
- **Uncontrolled:** omit `open`, use `defaultOpen`; Escape updates internal state and still notifies `onOpenChange`.

## Form participation

Dialog is not a form control. You may nest a `<form>` or [Form](/components/form) inside the panel; focus trap keeps tab order inside the dialog while open.

## Accessibility

- Modal path: focus trap, scroll lock, Escape dismiss, `aria-modal="true"`.
- Provide an accessible name (`titleId` → heading id, or `aria-label` on the panel).
- Prefer a description id for destructive confirms.
- Pass `getTrigger` (vanilla controller) when you need reliable return-focus to the opener; React/Vue adapters today sync content via panel ref and do not auto-wire a trigger element.
- Outside click does not close (by design for modal).
- Avoid casually nesting dialogs.

## Styling

Target `[data-state="open"]`, `[role="dialog"]`, `[data-slot="panel"]` (CE) / `[data-slot="root"]` (resolve). Unstyled by default, you own backdrop and panel CSS. Portal root uses Sometic portal attributes from the overlay helpers.

## Edge cases

- **Closed React/Vue**, component returns `null`; chrome deactivates via controller dispose/`setOpen(false)`.
- **Escape while controlled**, always listen to `onOpenChange` or open will snap back.
- **Missing content element**, overlay activate no-ops until `getContent()` returns a node (layout effect after mount covers the open path).
- **SSR**, create controllers and register CE only in the browser.
- **Popover/Tooltip React/Vue**, still resolve-only shells; full positioning/dismiss lives on DOM controllers / CEs. Dialog is the overlay adapter that wires the controller.

## Performance notes

One overlay controller per Dialog instance (trap + dismiss + scroll lock only while open). Resolve stays pure for attributes. Prefer disposing on unmount (adapters do this) so traps and locks never leak across routes.

## When to use / When not

**Use** for blocking confirms, modal forms, and any flow that needs trap + scroll lock + Escape.

**Do not use** for non-modal anchored content ([Popover](/components/popover)), hover hints ([Tooltip](/components/tooltip)), or transient status ([Toast](/components/toast) / [Alert](/components/alert)).

## FAQ

**Do React/Vue Dialogs trap focus?** Yes. Both call `createDialogController`, which uses modal `createOverlayController` (focus trap, scroll lock, Escape).

**Outside click to close?** No on dialog (modal). Popovers dismiss on outside press.

**How do I label the dialog?** Pass `titleId` / `descriptionId` matching heading/description element ids, or set `aria-label`.

**Portal?** Overlay ensures a portal root (`portalId` optional on the controller).

**Why return `null` when closed?** Avoids leaving an inert dialog in the tree; open remounts the panel and reactivates chrome.

**Menu / Drawer?** See [Menu](/components/menu) and [Drawer](/components/drawer).

**SSR?** Controllers and CE registration must run in the browser.

**Return focus?** Provide `getTrigger` when using the DOM controller; compose the same if you need custom React trigger wiring.

## Related links

- [Popover](/components/popover)
- [Tooltip](/components/tooltip)
- [Alert](/components/alert)
- [Toast](/components/toast)
- [Accessibility](/guide/accessibility)
- [Styling slots](/concepts/styling-slots)
- [Beta maturity](/releases/beta)
