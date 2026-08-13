# Switch

On/off control with `role="switch"` for assistive technology, backed by a native checkbox so it still participates in HTML form submission. Same controllable checked contract as Checkbox, without indeterminate.

<PreviewSwitch />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Switch } from "@sometic/react/selection";

export function Example() {
    const [checked, setChecked] = useState(true);
    return (
        <Switch
            checked={checked}
            onCheckedChange={setChecked}
            name="notifications"
            value="on"
            aria-label="Email notifications"
        />
    );
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { Switch } from "@sometic/vue/selection";

const checked = ref(true);
</script>

<template>
    <Switch
        v-model:checked="checked"
        name="notifications"
        value="on"
        aria-label="Email notifications"
    />
</template>
```

```js [Vanilla]
import { createSwitchController, resolveSwitch } from "@sometic/dom/switch";

const input = document.querySelector("#notifications");
const controller = createSwitchController({
    defaultChecked: true,
    onCheckedChange(next) {
        const view = resolveSwitch({
            checked: next,
            name: "notifications",
            value: "on",
        });
        input.checked = view.checked;
        for (const [key, attr] of Object.entries(view.attributes)) {
            input.setAttribute(key, attr);
        }
    },
});

input.addEventListener("change", () => {
    controller.setChecked(input.checked);
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerSelectionElements } from "@sometic/elements/selection";
    registerSelectionElements();
</script>

<sometic-switch
    checked
    name="notifications"
    value="on"
    aria-label="Email notifications"
></sometic-switch>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.iife.js"></script>

<sometic-switch
    checked
    name="notifications"
    value="on"
    aria-label="Email notifications"
></sometic-switch>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-switch
    checked
    name="notifications"
    value="on"
    aria-label="Email notifications"
></sometic-switch>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { Switch } from "@sometic/vue/selection";

const checked = ref(true);
</script>

<template>
    <Switch
        v-model:checked="checked"
        name="notifications"
        value="on"
        aria-label="Email notifications"
    />
</template>
```

## How it works

1. **Engine (`@sometic/dom/switch`)**: `resolveSwitch` / `createSwitchController` mirror checkbox controllable state but set `role="switch"` and `aria-checked` (`true` / `false` only).
2. **Adapters**: React/Vue render `<input type="checkbox">` with switch attributes and bridge controlled/uncontrolled checked.
3. **Custom element**: `sometic-switch` observes `checked`, `disabled`, `name`, `value`, `shadow` and emits `checked-change`.

## Anatomy

| Part | `data-slot` | Role                                   |
| ---- | ----------- | -------------------------------------- |
| Root | `root`      | Native checkbox input with switch ARIA |

**State / ARIA from resolve:** `data-checked`, `data-disabled`, `data-invalid`, optional `data-size` / `data-variant`, `role="switch"`, `aria-checked`, `aria-invalid` when invalid.

## Props / attributes

### React `SwitchProps`

Same shape as Checkbox minus `indeterminate`:

| Prop                                | Type                         | Default | Description          |
| ----------------------------------- | ---------------------------- | ------- | -------------------- |
| `checked`                           | `boolean`                    |         | Controlled           |
| `defaultChecked`                    | `boolean`                    | `false` | Uncontrolled initial |
| `onCheckedChange`                   | `(checked: boolean) => void` |         | Change               |
| `disabled` / `required` / `invalid` | `boolean`                    | `false` | Flags                |
| `name` / `value`                    | `string`                     |         | Form association     |
| `size` / `variant`                  | `string`                     |         | Theme attrs          |
| styling                             | `StyleableProps<"root">`     |         | Unstyled contract    |
| Native attrs                        | remaining input attrs        |         | Forwarded; `ref` OK  |

### Vue

`v-model:checked` → `checked` / `update:checked`; also emits `checkedChange`.

### Custom element (`sometic-switch`)

Observed: `checked`, `disabled`, `name`, `value`, `shadow`.

## Events / callbacks

| Surface        | Event                              | Payload                |
| -------------- | ---------------------------------- | ---------------------- |
| React          | `onCheckedChange`                  | `boolean`              |
| Vue            | `update:checked` / `checkedChange` | `boolean`              |
| Custom element | `checked-change`                   | `{ checked: boolean }` |

## Controlled vs uncontrolled

Same as Checkbox: pass `checked` (+ handler) for controlled; omit and use `defaultChecked` for uncontrolled.

## Form participation

Posts like a checkbox when checked (`name` / `value`). Prefer Switch for settings UX; Checkbox for forms and multi-select lists. Works with native forms, [Form](/components/form), and `sometic-form`.

## Accessibility

| Concern       | Guidance                                                          |
| ------------- | ----------------------------------------------------------------- |
| Role          | `role="switch"` + `aria-checked`                                  |
| Keyboard      | Native Space toggles the underlying checkbox                      |
| Label         | Visible label or `aria-label`; do not remove the native input     |
| Invalid       | `aria-invalid` / `data-invalid` when `invalid`                    |
| Indeterminate | Not supported; use [Checkbox](/components/checkbox) for tri-state |

## Styling

Unstyled by default. Target:

- `[role="switch"]`
- `[data-checked]`, `[data-disabled]`, `[data-invalid]`
- `[data-slot="root"]`
- optional `[data-size]` / `[data-variant]`

Light DOM is the CE default; `shadow` opts into isolation.

## Edge cases

- **Dual semantics** (checkbox + switch role): intentional for form serialization + AT.
- **Controlled without handler**: UI will not flip when clicked.
- **SSR**: resolve is pure; register CE in the browser.
- **Multi-instance**: no shared singleton state.
- **Required**: native required on the input; validate group/settings with forms meta when needed.

## Performance notes

Identical cost profile to Checkbox resolve. Prefer `@sometic/react/selection` subpath over inventing parallel switch widgets.

## When to use / When not

**Use** for instant settings (notifications on/off, feature toggles that feel like switches).

**Do not use** for:

- Multi-select lists ([Checkbox](/components/checkbox))
- Mutually exclusive choices ([Radio](/components/radio))
- Toolbar pressed chrome ([Toggle button](/components/toggle-button))

## FAQ

**Why a checkbox under the hood?** Form serialization and keyboard without a custom widget.

**Indeterminate?** Not supported. Use Checkbox.

**Switch vs ToggleButton?** Switch is a form-like input; ToggleButton is a pressed `<button>`.

**Invalid?** Sets `aria-invalid` / `data-invalid`; pair with Field for visible error text.

**CE `shadow`?** Optional isolation via `shadow`.

**Does React forward refs?** Yes, to the underlying `<input>`.

**`v-model` in Vue?** Use `v-model:checked`.

**Bundle tip?** Import from `@sometic/react/selection` (or Vue / elements / dom matching subpaths).

## Related links

- [Checkbox](/components/checkbox)
- [Toggle button](/components/toggle-button)
- [Radio](/components/radio)
- [Field](/components/field)
- [Form](/components/form)
- [Styling slots](/concepts/styling-slots)
