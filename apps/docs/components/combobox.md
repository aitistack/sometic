# Combobox

Combobox root with `role="combobox"`, `aria-expanded`, and `aria-haspopup="listbox"`. Pair with listbox/option resolve helpers (or your own list UI) for option picking.

<PreviewCombobox />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Combobox } from "@sometic/react/selection";

export function Example() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    return (
        <Combobox open={open} onOpenChange={setOpen} value={value} onValueChange={setValue}>
            {value ?? "Pick a framework"}
        </Combobox>
    );
}
```

```vue [Vue]
<!-- Vue adapter not shipped for this surface yet. Use React or @sometic/dom (Vanilla). -->
```

```js [Vanilla]
import {
    createComboboxController,
    resolveCombobox,
    resolveComboboxList,
    resolveComboboxOption,
} from "@sometic/dom/combobox";

const root = document.querySelector("#combobox");
const list = document.querySelector("#combobox-list");

const controller = createComboboxController({
    defaultOpen: false,
    defaultValue: null,
    onOpenChange: (open) => {
        const view = resolveCombobox({ open });
        for (const [key, value] of Object.entries(view.attributes)) {
            root.setAttribute(key, value);
        }
        list.hidden = !open;
    },
    onValueChange: (value) => {
        root.dataset.value = value ?? "";
        root.textContent = value ?? "Pick a framework";
    },
});

root.addEventListener("click", () => {
    controller.setOpen(!controller.open.get());
});

const listView = resolveComboboxList({ open: true });
for (const [key, value] of Object.entries(listView.attributes)) {
    list.setAttribute(key, value);
}

for (const option of list.querySelectorAll("[data-option]")) {
    const view = resolveComboboxOption({
        value: option.dataset.option,
        selected: false,
    });
    for (const [key, value] of Object.entries(view.attributes)) {
        option.setAttribute(key, value);
    }
    option.addEventListener("click", () => {
        controller.setValue(option.dataset.option);
        controller.setOpen(false);
    });
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

Custom element **not shipped** for Combobox (`sometic-select` exists for native select, not combobox). Vanilla uses `@sometic/dom/combobox`. React + DOM are primary; Vue has no Combobox component (Checkbox/Switch/Radio/Select only).

## How it works

1. **Resolve**: `resolveCombobox`, `resolveComboboxList`, `resolveComboboxOption`.
2. **Controller (`createComboboxController`)**: controllable `value`, `open`, and `inputValue` for filter UIs.
3. **React root**: manages open/value props and emits combobox attributes; compose the list yourself or via DOM helpers. Click on the root toggles open when not disabled.

## Anatomy

| Part   | Role / notes                        |
| ------ | ----------------------------------- |
| Root   | `role="combobox"`, `aria-expanded`  |
| List   | `role="listbox"` (compose yourself) |
| Option | `role="option"`, `aria-selected`    |

## Props / attributes

### React `ComboboxProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the root (including your `onClick`, which runs before the built-in open toggle).

| Prop            | Type                              | Default | Description           |
| --------------- | --------------------------------- | ------- | --------------------- |
| `open`          | `boolean`                         | —       | Controlled open       |
| `defaultOpen`   | `boolean`                         | `false` | Uncontrolled open     |
| `onOpenChange`  | `(open: boolean) => void`         | —       | Open changes          |
| `value`         | `string \| null`                  | —       | Controlled value      |
| `defaultValue`  | `string \| null`                  | `null`  | Uncontrolled value    |
| `onValueChange` | `(value: string \| null) => void` | —       | Value changes         |
| `disabled`      | `boolean`                         | —       | Disables interaction  |
| `children`      | `ReactNode`                       | —       | Trigger / label UI    |
| Native attrs    | remaining div HTML attrs          | —       | Forwarded to the root |

React also reflects `data-value` from the current value when set.

### Vue

No Vue `Combobox` component. Use React or `@sometic/dom/combobox`.

### Custom element

**CE not shipped.** Use Vanilla DOM controller or React. For a native `<select>`, see [Select](/components/select) (`sometic-select`).

## Events / callbacks

| Surface        | Event           | Payload          |
| -------------- | --------------- | ---------------- |
| React          | `onOpenChange`  | `boolean`        |
| React          | `onValueChange` | `string \| null` |
| Vue            | —               | —                |
| Custom element | —               | —                |
| DOM controller | `onOpenChange`  | `boolean`        |
| DOM controller | `onValueChange` | `string \| null` |

## Controlled vs uncontrolled

Open and value are independently controllable. You may control one and leave the other uncontrolled.

## Accessibility

- Root uses combobox + expanded state.
- List should use `role="listbox"`; options `role="option"` with `aria-selected`.
- For typeahead, drive `inputValue` from `createComboboxController` in vanilla/DOM compositions.

## Styling

Target `[role="combobox"]`, `[aria-expanded]`, `[role="listbox"]`, `[role="option"]`, `[data-value]`.

## When to use / When not

**Use** for searchable or custom option picking beyond native `<select>`.

**Do not use** when a native [Select](/components/select) is enough.

## FAQ

**Full listbox UI in React?** The React export is the combobox root. Compose list/options with DOM resolve helpers or your own markup.

**Is there an `sometic-combobox`?** No. CE not shipped.

**Vue adapter?** Not shipped. React + DOM primary.

**Does React forward native attrs?** Yes, onto the root div.

**Click toggles open?** Yes, unless `disabled`.

## Related links

- [Select](/components/select)
- [Menu](/components/menu)
- [Controlled state](/concepts/controlled-state)
- [Styling slots](/concepts/styling-slots)
