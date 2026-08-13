# Popover

Non-modal anchored overlay with `role="dialog"`, positioning via `@sometic/positioning`, and Escape / outside-press dismiss on the **DOM controller** and `sometic-popover`. React and Vue adapters are resolve-only open shells (unlike [Dialog](/components/dialog), which wires `createDialogController`).

<PreviewPopover />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Popover } from "@sometic/react/overlay";

export function Example() {
    const [open, setOpen] = useState(true);
    return (
        <>
            <button type="button" onClick={() => setOpen((v) => !v)}>
                Toggle
            </button>
            <Popover open={open}>Filter panel</Popover>
        </>
    );
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { Popover } from "@sometic/vue/overlay";

const open = ref(true);
</script>

<template>
    <button type="button" @click="open = !open">Toggle</button>
    <Popover :open="open">Filter panel</Popover>
</template>
```

```js [Vanilla]
import { createPopoverController, resolvePopover } from "@sometic/dom/popover";

const panel = document.querySelector("#popover");
const controller = createPopoverController({
    defaultOpen: true,
    getContent: () => panel,
    onOpenChange(next) {
        const view = resolvePopover({ open: next });
        panel.hidden = !next;
        for (const [key, attr] of Object.entries(view.attributes)) {
            panel.setAttribute(key, attr);
        }
    },
});

document.querySelector("#trigger").addEventListener("click", () => {
    controller.setOpen(!controller.open.get());
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerOverlayElements } from "@sometic/elements/overlay";
    registerOverlayElements();
</script>

<button type="button" id="trigger">Open</button>
<sometic-popover id="panel" placement="bottom-start" open> Filter panel </sometic-popover>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.iife.js"></script>

<button type="button" id="trigger">Open</button>
<sometic-popover id="panel" placement="bottom-start" open> Filter panel </sometic-popover>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.esm.js"
></script>

<button type="button" id="trigger">Open</button>
<sometic-popover id="panel" placement="bottom-start" open> Filter panel </sometic-popover>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { Popover } from "@sometic/vue/overlay";

const open = ref(true);
</script>

<template>
    <button type="button" @click="open = !open">Toggle</button>
    <Popover :open="open">Filter panel</Popover>
</template>
```

> **Beta honesty:** React/Vue `Popover` only calls `resolvePopover` when `open` is true and returns `null` when closed. Positioning, portal, outside dismiss, and Escape live on `createPopoverController` / `sometic-popover`. See [Beta maturity](/releases/beta).

## How it works

1. **Resolve (`resolvePopover`)**: pure view model with `role="dialog"`, `data-slot="root"`, `data-state`, `data-placement`, absolute positioning style hooks, optional `x` / `y`.
2. **Controller (`createPopoverController`)**: non-modal `createOverlayController` (outside press dismisses, Escape dismisses), `computePosition` against `getTrigger` / `getContent`, optional `portalId`.
3. **Adapters**: React/Vue render a `div` with resolve attrs when `open`; **no** controller wiring (contrast Dialog).
4. **Custom element**: `sometic-popover` owns the controller, reflects `open` / `placement` / `shadow`, emits `open-change`.

Behavior engines stay in `@sometic/dom`; frameworks only bind props when using the thin shell.

## Anatomy

| Part    | `data-slot`                     | Role                                    |
| ------- | ------------------------------- | --------------------------------------- |
| Panel   | `root` (resolve) / `panel` (CE) | Floating dialog content                 |
| Trigger | (app-owned)                     | Pass `getTrigger` on the DOM controller |

Resolve attrs when open: `role="dialog"`, `data-state="open"|"closed"`, `data-placement`.

## Props / attributes

### React `PopoverProps`

`HTMLAttributes<HTMLDivElement>` plus:

| Prop             | Type        | Default | Description                      |
| ---------------- | ----------- | ------- | -------------------------------- |
| `open`           | `boolean`   | `false` | When false, React returns `null` |
| `children`       | `ReactNode` |         | Panel content                    |
| Native div attrs |             |         | Forwarded to the panel when open |

Engine / controller also: `placement`, `offset`, `portalId`, `getContent`, `getTrigger`, styling (`unstyled`, `classes`, …).

### Vue

Prop: `open` (boolean). Default slot is panel content. No `update:open` on the thin shell; drive `open` yourself.

### Custom element (`sometic-popover`)

Observed: `open`, `placement`, `shadow`. Event: `open-change` → `{ open: boolean }`.

## Events / callbacks

| Surface         | Event                                                       |
| --------------- | ----------------------------------------------------------- |
| React / Vue     | Drive `open` yourself (no `onOpenChange` on the thin shell) |
| CE / controller | `onOpenChange` / `open-change`                              |

## Controlled vs uncontrolled

Controller supports `open` / `defaultOpen` / `onOpenChange`. React/Vue shells are controlled via `open` only.

## Form participation

N/A as a control. The panel may host form fields; those fields participate normally.

## Accessibility

| Concern       | Behavior                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| Role          | `role="dialog"` (non-modal; not `aria-modal` like Dialog)                 |
| Focus         | Not trapped on controller path; manage focus intentionally                |
| Keyboard      | Escape dismisses on controller / CE                                       |
| Outside press | Dismisses on controller / CE (non-modal)                                  |
| Name          | Provide accessible name for panel content (`aria-label` / labelledby)     |
| Menu pattern  | **Not** a Menu; use [Menu](/components/menu) for menuitem keyboard models |

React/Vue shells do not install dismiss or focus management; wire CE or `createPopoverController` for production a11y behavior.

## Styling

Unstyled panel. Useful selectors:

- `[data-slot="root"]` / CE panel
- `[data-state="open"|"closed"]`
- `[data-placement="…"]`

You own arrow, backdrop, and motion if needed.

## Edge cases

- **React/Vue without controller**: no auto dismiss, no positioning updates; pair with DOM controller or CE for production.
- **Nested popovers**: coordinate dismiss layers carefully (outside press can close multiple).
- **SSR**: resolve is pure; register CE / create controllers only in the browser.
- **Closed shell**: React/Vue return `null`; do not assume the panel stays mounted.
- **Multi-instance**: no module singletons; each controller is independent.
- **Dialog vs Popover**: modal focus trap and no outside dismiss belong on Dialog, not Popover.

## Performance notes

Position updates on open / scroll / resize via the controller; dispose when done. Prefer the CE or controller when you need live placement. Thin React/Vue shells are cheap resolve-only renders.

## When to use / When not

**Use** for non-modal anchored content (filters, compact forms, contextual panels).

**Do not use** for:

- Modal confirms ([Dialog](/components/dialog))
- Short hover/focus hints ([Tooltip](/components/tooltip))
- Application menus ([Menu](/components/menu))

## FAQ

**Why is React thinner than Dialog?** Dialog adapters call `createDialogController`. Popover React/Vue remain resolve-only open shells in this beta ([Beta maturity](/releases/beta)).

**Does outside click dismiss?** Yes on controller / CE (non-modal). Not on the React/Vue shell alone.

**Escape?** Wired on controller / CE. Shell-only: handle yourself.

**Placement values?** Positioning package placements (`top`, `bottom-start`, …). Resolve default is `bottom`.

**Portal?** Controller `portalId` / overlay portal helpers.

**Is this a Menu API?** No. Use [Menu](/components/menu) for menuitem patterns; Popover is a general non-modal overlay shell.

**Can the panel hold form fields?** Yes. The popover itself is not a form control.

**Light DOM or shadow?** CE defaults to light DOM; `shadow` opts into an open shadow root.

**Bundle tip?** Import `@sometic/react/overlay` (or Vue / elements / dom subpaths), not a mega barrel.

## Related links

- [Dialog](/components/dialog)
- [Tooltip](/components/tooltip)
- [Toast](/components/toast)
- [Beta maturity](/releases/beta)
- [Styling slots](/concepts/styling-slots)
