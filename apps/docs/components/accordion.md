# Accordion

Expandable sections with single or multiple open values. `Accordion` owns selection; `AccordionItem` toggles and resolves `data-state="open"|"closed"`.

<PreviewAccordion />

## Usage

::: code-group

```tsx [JS]
import { Accordion, AccordionItem } from "@sometic/react/structure";

export function Example() {
    return (
        <Accordion type="single" defaultValue="a11y">
            <AccordionItem value="a11y" title="Accessibility">
                Accessibility lives in core engines.
            </AccordionItem>
            <AccordionItem value="style" title="Styling">
                Bring your own design tokens.
            </AccordionItem>
        </Accordion>
    );
}
```

```tsx [TS]
import { Accordion, AccordionItem } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return (
        <Accordion type="single" defaultValue="a11y">
            <AccordionItem value="a11y" title="Accessibility">
                Accessibility lives in core engines.
            </AccordionItem>
            <AccordionItem value="style" title="Styling">
                Bring your own design tokens.
            </AccordionItem>
        </Accordion>
    );
}
```

```js [Vanilla]
import {
    createAccordionController,
    resolveAccordion,
    resolveAccordionItem,
} from "@sometic/dom/accordion";

const root = document.querySelector("#accordion");
const rootView = resolveAccordion({ type: "single" });
for (const [key, value] of Object.entries(rootView.attributes)) {
    root.setAttribute(key, value);
}

const controller = createAccordionController({
    type: "single",
    defaultValue: "a11y",
    onValueChange: (value) => {
        for (const item of root.querySelectorAll("[data-item]")) {
            const open = value === item.dataset.item;
            const view = resolveAccordionItem({
                value: item.dataset.item,
                open,
                disabled: item.hasAttribute("disabled"),
            });
            for (const [key, attr] of Object.entries(view.attributes)) {
                item.setAttribute(key, attr);
            }
            const content = item.querySelector("[data-slot='content']");
            if (content) {
                content.hidden = !open;
            }
        }
    },
});

for (const trigger of root.querySelectorAll("[data-slot='trigger']")) {
    trigger.addEventListener("click", () => {
        const item = trigger.closest("[data-item]");
        if (item && !item.hasAttribute("disabled")) {
            controller.toggle(item.dataset.item);
        }
    });
}
```

:::

> Custom element not shipped in this beta; use the DOM controller.

Custom element **not shipped** for Accordion. Vanilla uses `@sometic/dom/accordion`. React and Vue ship `Accordion` / `AccordionItem` from `@sometic/*/structure`.

## How it works

1. **Resolve**: `resolveAccordion` / `resolveAccordionItem`.
2. **Controller (`createAccordionController`)**: `type: "single" | "multiple"`, controllable value.
3. **React**: context + toggle. Prefer `title` for a header button; `children` then render only while open.

## Anatomy

| Part          | Role / slot                        |
| ------------- | ---------------------------------- |
| Accordion     | Root container                     |
| AccordionItem | Item with `data-state`             |
| Trigger       | `data-slot="trigger"` (when title) |
| Content       | `data-slot="content"` while open   |

## Props / attributes

### React `AccordionProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the root.

| Prop            | Type                                  | Default     | Description          |
| --------------- | ------------------------------------- | ----------- | -------------------- |
| `type`          | `"single" \| "multiple"`              | `"single"`  | One vs many open     |
| `value`         | `string \| string[]`                  | —           | Controlled value     |
| `defaultValue`  | `string \| string[]`                  | `""` / `[]` | Uncontrolled initial |
| `onValueChange` | `(value: string \| string[]) => void` | —           | Changes              |
| `children`      | `ReactNode`                           | —           | Accordion items      |
| Native attrs    | remaining div HTML attrs              | —           | Forwarded to root    |

### React `AccordionItemProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the item root.

| Prop         | Type                     | Default | Description                                                |
| ------------ | ------------------------ | ------- | ---------------------------------------------------------- |
| `value`      | `string`                 | —       | Item id (required)                                         |
| `title`      | `ReactNode`              | —       | Header button; when set, `children` render only while open |
| `disabled`   | `boolean`                | —       | Blocks toggle                                              |
| `children`   | `ReactNode`              | —       | Body (or full content when `title` omitted)                |
| Native attrs | remaining div HTML attrs | —       | Forwarded to the item root                                 |

When `title` is omitted, clicking the item root toggles (plus any `onClick` you pass).

### Vue

`Accordion` and `AccordionItem` from `@sometic/vue/structure`. Props: `type`, `value`, `defaultValue`, `collapsible`, `lazyMount`, `forceMount` on the root; `value`, `disabled`, `title` on items. Emits `update:value` and `valueChange`.

```vue
<script setup lang="ts">
import { Accordion, AccordionItem } from "@sometic/vue/structure";
</script>

<template>
    <Accordion type="single" default-value="a">
        <AccordionItem value="a" title="Accessibility">
            Focus, dismiss, and ARIA live in the core engines.
        </AccordionItem>
        <AccordionItem value="b" title="Styling">
            Unstyled by default. Own tokens and layout.
        </AccordionItem>
    </Accordion>
</template>
```

### Custom element

**CE not shipped.** Use Vanilla DOM controller, React, or Vue.

## Events / callbacks

| Surface        | Event                          | Payload              |
| -------------- | ------------------------------ | -------------------- |
| React          | `onValueChange`                | `string \| string[]` |
| Vue            | `valueChange` / `update:value` | `string \| string[]` |
| Custom element | —                              | —                    |
| DOM controller | `onValueChange`                | `string \| string[]` |

## Controlled vs uncontrolled

Pass `value` + `onValueChange` for controlled. Omit `value` and use `defaultValue` (`""` for single, `[]` for multiple when omitted).

## Accessibility

- Reflect open state with `data-state`.
- Prefer a button header pattern (`title`) for keyboard activation.
- When `title` is set, the trigger uses `aria-expanded`.

## Styling

Target `[data-state="open"|"closed"]`, `[data-slot="trigger"|"content"]`.

## When to use / When not

**Use** for FAQs and progressive disclosure.

**Do not use** when only one panel should ever exist as tabs ([Tabs](/components/tabs)).

**Vs Radix / React Aria.** Same portable story as Tabs: shared `@sometic/dom` controller plus unstyled adapters. Prefer Radix/React Aria when you are React-only and already invested.

## FAQ

**Must AccordionItem live under Accordion?** Yes. Context is required.

**Single vs multiple?** `type="single"` stores a string; `type="multiple"` stores `string[]`.

**Lazy mount?** Adapters default to `lazyMount` (inactive panels are not mounted). Pass `forceMount` to keep DOM for CSS transitions or SSR hydration needs.

**Is there an `sometic-accordion`?** No. CE not shipped.

**Vue components?** Yes. `@sometic/vue/structure`.

**Does React forward native attrs?** Yes, onto Accordion and AccordionItem roots.

## Related links

- [Tabs](/components/tabs)
- [Controlled state](/concepts/controlled-state)
- [Styling slots](/concepts/styling-slots)
