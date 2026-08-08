# Tooltip

Label overlay for a control: `role="tooltip"`, default placement `"top"`, and delayed open/close on the **DOM controller** / `sometic-tooltip` (pointer + focus). React and Vue adapters render a labelled tip when `open` is true without delay timers or positioning controllers (resolve-only shells; see [Beta maturity](/releases/beta)).

<PreviewTooltip />

## Usage

::: code-group

```tsx [JS]
import { useState } from "react";
import { Tooltip } from "@sometic/react/overlay";

export function Example() {
    const [open, setOpen] = useState(false);
    return (
        <Tooltip open={open} label="Save (Ctrl+S)">
            <button
                type="button"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
            >
                Save
            </button>
        </Tooltip>
    );
}
```

```tsx [TS]
import { useState } from "react";
import { Tooltip } from "@sometic/react/overlay";

export function Example(): JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <Tooltip open={open} label="Save (Ctrl+S)">
            <button
                type="button"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
            >
                Save
            </button>
        </Tooltip>
    );
}
```

```html [Vanilla]
<script type="module">
    import { registerOverlayElements } from "@sometic/elements/overlay";
    registerOverlayElements();
</script>

<sometic-tooltip placement="top">
    <button type="button">Save</button>
    <div data-slot="content">Save (Ctrl+S)</div>
</sometic-tooltip>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { Tooltip } from "@sometic/vue/overlay";

const open = ref(false);
</script>

<template>
    <Tooltip :open="open" label="Save (Ctrl+S)">
        <button
            type="button"
            @mouseenter="open = true"
            @mouseleave="open = false"
            @focus="open = true"
            @blur="open = false"
        >
            Save
        </button>
    </Tooltip>
</template>
```

> **Beta honesty:** React/Vue own hover/focus delays and positioning unless you use `createTooltipController` or `sometic-tooltip`. Dialog is the overlay that ships controller-wired React/Vue adapters in this beta.

## How it works

1. **Resolve (`resolveTooltip`)**: `role="tooltip"`, `data-slot="root"`, `data-state`, `data-placement` (default `"top"`), absolute style hooks.
2. **Controller (`createTooltipController`)**: controllable open, `openDelayMs` / `closeDelayMs`, `scheduleOpen` / `scheduleClose`, positioning against trigger/content.
3. **Adapters**: React/Vue wrap children in a relative `span` and render a tip `div` when `open`; **you** drive open state and delays on the shell path.
4. **Custom element**: `sometic-tooltip` observes `open`, `placement`, `shadow` and owns controller behavior.

## Anatomy

| Part    | Role                                                       |
| ------- | ---------------------------------------------------------- |
| Trigger | Default slot / children; must keep its own accessible name |
| Tip     | `label` text in a `role="tooltip"` element when open       |

Resolve attrs on tip: `data-state`, `data-placement`.

## Props / attributes

### React `TooltipProps`

| Prop             | Type        | Default      | Description              |
| ---------------- | ----------- | ------------ | ------------------------ |
| `open`           | `boolean`   | `false`      | Show tip                 |
| `label`          | `string`    | **required** | Tip text                 |
| `children`       | `ReactNode` | **required** | Trigger                  |
| Native div attrs |             |              | Applied to tip when open |

Controller extras when used directly: `placement`, `offset`, `openDelayMs`, `closeDelayMs`, `onOpenChange`.

### Vue

Props: `open`, `label` (required). Default slot is the trigger.

### Custom element (`sometic-tooltip`)

Observed: `open`, `placement`, `shadow`. Prefer CE/controller for delay + position.

## Events / callbacks

| Surface         | Event                        |
| --------------- | ---------------------------- |
| React / Vue     | Control `open` externally    |
| CE / controller | `onOpenChange` / open-change |

## Controlled vs uncontrolled

Controller supports both. React/Vue shells are controlled via `open`.

## Form participation

N/A.

## Accessibility

| Concern          | Guidance                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| Role             | Tip uses `role="tooltip"`                                                |
| Trigger name     | Trigger must have its own accessible name; tip is supplementary          |
| Keyboard / focus | Prefer focus + hover open on CE/controller; Space/Enter activate buttons |
| Essential text   | Do not put required instructions only in a tooltip                       |
| ARIA association | Wire `aria-describedby` to the tip id when you need a stronger link      |
| Escape           | Follows dismissable behavior on controller where wired                   |

## Styling

`[role="tooltip"]`, `[data-state]`, `[data-placement]` on CE/controller resolves. Unstyled by default.

## Edge cases

- **Empty `label`**: invalid usage (`label` is required).
- **Touch devices**: hover delays differ; test CE/controller paths.
- **SSR**: no import-time DOM; create controllers / register CE in the browser.
- **Shell without timers**: rapid hover flicker is your responsibility on React/Vue.
- **Popover content**: interactive panels belong in Popover, not Tooltip.
- **Multi-instance**: independent resolves/controllers; no shared singleton.

## Performance notes

Timers only on the controller path; cancel on dispose. React/Vue shells are trivial conditional renders. Prefer one shared delay policy via CE/controller rather than per-call ad hoc timers.

## When to use / When not

**Use** for short hints on controls (shortcuts, icon meanings).

**Do not use** for:

- Modal content ([Dialog](/components/dialog))
- Rich interactive panels ([Popover](/components/popover))
- [Menus](/components/menu)

## FAQ

**Delays in React/Vue?** Not built-in. Use `createTooltipController` / CE or your own timers.

**Why thinner than Dialog?** Dialog adapters wire `createDialogController`. Tooltip React/Vue stay resolve-only shells in this beta.

**Keyboard?** Prefer focus-driven open via controller/CE so keyboard users see the tip.

**ARIA relationship?** Optional `aria-describedby` pointing at the tip id.

**Placement?** Positioning placements; resolve default is `top`.

**Can tip hold buttons?** No. Keep tips non-interactive; use Popover for interactive content.

**Empty label?** Do not. `label` is required for a meaningful tip.

**Menu?** Not this component. See [Menu](/components/menu).

**Bundle tip?** Import `@sometic/react/overlay` (or Vue / elements / dom subpaths).

## Related links

- [Popover](/components/popover)
- [Dialog](/components/dialog)
- [Beta maturity](/releases/beta)
- [Styling slots](/concepts/styling-slots)
