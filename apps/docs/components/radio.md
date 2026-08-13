# Radio

Native radio input resolved through the shared styling contract. Group value is owned by `createRadioGroupController` in the DOM engine; React / Vue / CE expose radio **items** that you wire with a shared `name` and parent-controlled `checked` (or native HTML grouping). There is **no** React/Vue `RadioGroup` component in this beta.

<PreviewRadio />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Radio } from "@sometic/react/selection";

export function Example() {
    const [value, setValue] = useState("pro");
    return (
        <div role="radiogroup" aria-label="Plan">
            <Radio
                name="plan"
                value="free"
                checked={value === "free"}
                onValueChange={setValue}
                aria-label="Free"
            />
            <Radio
                name="plan"
                value="pro"
                checked={value === "pro"}
                onValueChange={setValue}
                aria-label="Pro"
            />
        </div>
    );
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { Radio } from "@sometic/vue/selection";

const value = ref("pro");
</script>

<template>
    <div role="radiogroup" aria-label="Plan">
        <Radio
            name="plan"
            value="free"
            :checked="value === 'free'"
            aria-label="Free"
            @value-change="value = $event"
        />
        <Radio
            name="plan"
            value="pro"
            :checked="value === 'pro'"
            aria-label="Pro"
            @value-change="value = $event"
        />
    </div>
</template>
```

```js [Vanilla]
import { createRadioGroupController } from "@sometic/dom/radio";

const group = createRadioGroupController({
    name: "plan",
    defaultValue: "pro",
    onValueChange(next) {
        console.log(next);
    },
});

for (const input of document.querySelectorAll('input[type="radio"][name="plan"]')) {
    const apply = () => {
        const view = group.resolveItem(input.value);
        input.checked = view.checked;
        for (const [key, attr] of Object.entries(view.attributes)) {
            input.setAttribute(key, attr);
        }
    };
    apply();
    input.addEventListener("change", () => {
        group.setValue(input.value);
        apply();
    });
}
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerSelectionElements } from "@sometic/elements/selection";
    registerSelectionElements();
</script>

<div role="radiogroup" aria-label="Plan">
    <sometic-radio name="plan" value="free" aria-label="Free"></sometic-radio>
    <sometic-radio name="plan" value="pro" checked aria-label="Pro"></sometic-radio>
</div>
```

```html [CDN]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<div role="radiogroup" aria-label="Plan">
    <sometic-radio name="plan" value="free" aria-label="Free"></sometic-radio>
    <sometic-radio name="plan" value="pro" checked aria-label="Pro"></sometic-radio>
</div>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { Radio } from "@sometic/vue/selection";

const value = ref("pro");
</script>

<template>
    <div role="radiogroup" aria-label="Plan">
        <Radio
            name="plan"
            value="free"
            :checked="value === 'free'"
            aria-label="Free"
            @value-change="value = $event"
        />
        <Radio
            name="plan"
            value="pro"
            :checked="value === 'pro'"
            aria-label="Pro"
            @value-change="value = $event"
        />
    </div>
</template>
```

> **Beta note:** `@sometic/react/selection` and `@sometic/vue/selection` export `Radio` (with Checkbox / Switch / Select). Compose group state yourself, or use `createRadioGroupController` from `@sometic/dom/radio` for vanilla.

## How it works

1. **Engine**: `resolveRadio` requires `value: string` and builds native radio attrs. `createRadioGroupController` holds group `string | null` and `resolveItem`.
2. **Adapters**: React/Vue `Radio` is a single item: required `value`, optional `checked`, `onValueChange(value)` / `valueChange` when selected.
3. **Custom element**: `sometic-radio` observes `checked`, `disabled`, `name`, `value`, `shadow`.

## Anatomy

| Part | `data-slot` | Role                   |
| ---- | ----------- | ---------------------- |
| Root | `root`      | `<input type="radio">` |

State: `data-checked`, `data-disabled`, `data-invalid`, optional size/variant.

## Props / attributes

### React `RadioProps`

| Prop                                | Type                      | Default      | Description                                |
| ----------------------------------- | ------------------------- | ------------ | ------------------------------------------ |
| `value`                             | `string`                  | **required** | Item value                                 |
| `checked`                           | `boolean`                 | `false`      | Selected                                   |
| `onValueChange`                     | `(value: string) => void` |              | Fires with this item's `value` when chosen |
| `disabled` / `required` / `invalid` | `boolean`                 | `false`      | Flags                                      |
| `name`                              | `string`                  |              | Shared group name                          |
| `size` / `variant`                  | `string`                  |              | Theme                                      |
| styling                             | `StyleableProps<"root">`  |              | Unstyled                                   |
| Native attrs                        | remaining input attrs     |              | Forwarded; `ref` OK                        |

### Vue

Props: `value` (required), `checked`, `disabled`, `name`. Emits: `valueChange`.

### DOM group controller

`createRadioGroupController({ value?, defaultValue?, name?, onValueChange? })` → `resolveItem(itemValue)`, `setValue`.

### Custom element (`sometic-radio`)

Observed: `checked`, `disabled`, `name`, `value`, `shadow`.

## Events / callbacks

| Surface          | Event                       | Payload             |
| ---------------- | --------------------------- | ------------------- |
| React            | `onValueChange`             | item `value` string |
| Vue              | `valueChange`               | item `value` string |
| CE               | change-style checked events |                     |
| Group controller | `onValueChange`             | `string \| null`    |

## Controlled vs uncontrolled

Items are typically controlled by parent group state. Native HTML grouping via shared `name` also works uncontrolled without React/Vue state (browser manages exclusivity).

## Form participation

Native radios with shared `name` submit the selected `value`. Works with Form / `sometic-form`.

## Accessibility

| Concern     | Guidance                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| Group name  | Wrap with `role="radiogroup"` + `aria-label` / `aria-labelledby`               |
| Item labels | Visible labels per item or `aria-label`                                        |
| Keyboard    | Native arrow-key group behavior when `name` is shared                          |
| Not listbox | This is radio, not [Combobox](/components/combobox) / [Menu](/components/menu) |
| Required    | Prefer form-level validation that the group has a value                        |

## Styling

`[data-checked]`, `[data-disabled]`, `[data-invalid]`, `[data-slot="root"]`, optional size/variant.

## Edge cases

- **Missing shared `name`**: items will not native-group; manage `checked` yourself.
- **`null` group value**: no item checked (controller path).
- **SSR**: resolve is pure; register CE in the browser.
- **Inventing RadioGroup**: do not assume a React `RadioGroup` export; compose state.
- **Select vs Radio**: Select for longer / compact lists; Radio for visible concurrent options.
- **Multi-instance**: independent items; exclusivity comes from `name` or parent state.

## Performance notes

Per-item resolve is cheap. Prefer one parent state update over remounting the group. Import `@sometic/react/selection` subpaths for tree-shaking.

## When to use / When not

**Use** for mutually exclusive choices in a short list.

**Do not use** for:

- Multi-select ([Checkbox](/components/checkbox))
- Settings switch UX ([Switch](/components/switch))
- Searchable lists ([Combobox](/components/combobox))

## FAQ

**Where is React `RadioGroup`?** Not shipped. Compose with state + `Radio` items or DOM `createRadioGroupController`.

**Why `onValueChange` passes the item value?** So parents can set group state without reading the DOM.

**Required on one item?** Prefer form-level validation that the group has a value.

**Select vs Radio?** Select for longer option lists / compact UI; Radio for visible concurrent options.

**CE grouping?** Shared `name` attribute across `sometic-radio` nodes.

**Does React forward refs?** Yes, to the underlying `<input>`.

**Arrow keys without shared name?** Native grouping needs shared `name`; otherwise manage focus yourself.

**Invalid?** Sets `aria-invalid` / `data-invalid`; pair with Field for messages.

**Bundle tip?** Import `@sometic/react/selection` (or Vue / elements / dom matching subpaths).

## Related links

- [Checkbox](/components/checkbox)
- [Switch](/components/switch)
- [Select](/components/select)
- [Field](/components/field)
- [Form](/components/form)
- [Beta maturity](/releases/beta)
