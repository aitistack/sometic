# Select

Native `<select>` with controllable value (`string | null`), option list rendering, and the shared Sometic resolve / styling contract. This is a native select, not a listbox or combobox.

<PreviewSelect />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Select } from "@sometic/react/selection";

export function Example() {
    const [value, setValue] = useState("us");
    const options = [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
    ];
    return <Select value={value} onValueChange={setValue} options={options} />;
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { Select } from "@sometic/vue/selection";

const value = ref("us");
const options = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
];
</script>

<template>
    <Select v-model="value" :options="options" />
</template>
```

```js [Vanilla]
import { bindSelect } from "@sometic/dom/select";

const select = document.querySelector("select");
bindSelect(select, () => ({
    options: [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
    ],
    onValueChange(next) {
        console.log(next);
    },
}));
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerSelectionElements } from "@sometic/elements/selection";
    registerSelectionElements();
</script>

<sometic-select>
    <option value="a">Alpha</option>
    <option value="b">Beta</option>
</sometic-select>
```

```html [CDN]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.iife.js"></script>
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-select>
    <option value="a">Alpha</option>
    <option value="b">Beta</option>
</sometic-select>
```

:::

> React `SelectProps` requires an `options: readonly SelectOption[]` array. You may still pass `children` to override the generated `<option>` list (as in the Usage snippet). Prefer `options={…}` for data-driven lists.

## How it works

1. **Engine (`@sometic/dom/select`)**: `resolveSelect` maps value/options/disabled/invalid into attributes and native flags. `createSelectController` holds controllable `string | null` and a frozen options list from create time. `bindSelect` syncs a live `<select>` (empty string → `null`).
2. **Adapters**: React/Vue render `<select>`, resolve each render, map `options` to `<option>` unless `children` override.
3. **Custom element**: `sometic-select` observes `value` / `disabled` / `name` / `shadow`; set `element.options = […]` as a JS property (not an HTML attribute).

## Anatomy

| Part    | `data-slot` | Role                                                                |
| ------- | ----------- | ------------------------------------------------------------------- |
| Root    | `root`      | Native `<select>`                                                   |
| Options | ,           | `<option>` nodes from `options` (or children override in React/Vue) |

State attrs: `data-disabled`, `data-invalid`, optional `data-size` / `data-variant`; optional `aria-invalid`.

## Props / attributes

### React `SelectProps`

Omits native `value` / `defaultValue` / `onChange`; requires `options`.

| Prop                                                                                   | Type                              | Default | Description                                 |
| -------------------------------------------------------------------------------------- | --------------------------------- | ------- | ------------------------------------------- |
| `options`                                                                              | `readonly SelectOption[]`         | ,       | **Required.** `{ value, label, disabled? }` |
| `value`                                                                                | `string \| null`                  | ,       | Controlled value                            |
| `defaultValue`                                                                         | `string \| null`                  | `null`  | Uncontrolled initial                        |
| `onValueChange`                                                                        | `(value: string \| null) => void` | ,       | Change callback                             |
| `disabled`                                                                             | `boolean`                         | `false` | Disables control                            |
| `required`                                                                             | `boolean`                         | `false` | Native required                             |
| `invalid`                                                                              | `boolean`                         | `false` | Invalid + `aria-invalid`                    |
| `name`                                                                                 | `string`                          | ,       | Form name                                   |
| `multiple`                                                                             | `boolean`                         | `false` | Native multiple flag                        |
| `size` / `variant`                                                                     | `string`                          | ,       | Theme attrs                                 |
| `unstyled` / `classes` / `styles` / `cssVariables` / `defaults` / `variants` / `merge` | styling                           | ,       | Styleable (`root`)                          |
| `children`                                                                             | `ReactNode`                       | ,       | Overrides generated options when provided   |
| Native attrs                                                                           | remaining select HTML attrs       | ,       | Forwarded; `ref` supported                  |

`SelectOption`: `{ value: string; label: string; disabled?: boolean }`.

### Custom element (`sometic-select`)

Observed: `value`, `disabled`, `name`, `shadow`. Property: `options`.

### Vue

`modelValue` / `update:modelValue` (`v-model`) and `valueChange`; same resolve options.

## Events / callbacks

| Surface        | Event                              | Payload               |
| -------------- | ---------------------------------- | --------------------- |
| React          | `onValueChange`                    | `string \| null`      |
| Vue            | `update:modelValue`, `valueChange` | `string \| null`      |
| Custom element | `value-change`                     | `{ value: string }`   |
| `bindSelect`   | native `change`                    | empty string → `null` |

## Controlled vs uncontrolled

- **Controlled:** pass `value` (`string | null`) + `onValueChange`.
- **Uncontrolled:** omit `value`, use `defaultValue`.
- Empty selection normalizes to `null` in JS APIs. CE `value-change` still carries a string for the attribute path.

## Form participation

Give it a `name` and place it in a native form, [Form](/components/form), or `sometic-form`. Native serialization uses the selected option value. Controller `multiple` exposes the flag; the controller value type remains `string | null`, prefer app state for true multi-select value arrays.

## Accessibility

- Native `<select>` keyboard and platform UI.
- Provide a visible label (`<label for>` / wrapping label / Field).
- Mark invalid with `invalid` / `aria-invalid` and associate error text via Field / forms a11y helpers.
- Prefer Select for modest option lists; searchable listbox/typeahead is Combobox (not shipped in this beta).

## Styling

Unstyled host/select. Target `[data-slot="root"]`, `[data-disabled]`, `[data-invalid]`. Platform chrome for the dropdown list is OS-native.

## Edge cases

- **Controller options are frozen** at `createSelectController` time, recreate or use adapter `options` props that re-resolve.
- **`multiple` + controller**, flag only; value API is still `string | null`.
- **Children vs options**, children win when provided; keep `options` in sync for resolve metadata.
- **SSR**, resolve pure; register CE in browser.
- **Disabled options**, pass `disabled: true` on `SelectOption`.

## Performance notes

Native select avoids virtualized listbox cost. Resolve is pure. Keep `options` referentially stable when possible to reduce React memo churn. Do not polyfill Combobox behavior on top of this control.

## When to use / When not

**Use** for choosing one value from a fixed option list with native browser UX and form serialization.

**Do not use** for free-text entry ([Input](/components/input)), multi independent booleans (checkboxes), or custom listbox / typeahead ([Combobox](/components/combobox)).

## FAQ

**Why `null` instead of `""`?** Empty option values normalize to `null` in controllers and React/Vue so “no selection” is explicit.

**Can I change options after `createSelectController`?** The controller freezes options from create time. Re-create or pass new `options` to adapters.

**Does `multiple` work with the controller?** Resolve/bind expose the native flag; controller API is single `string | null`.

**Is this a Combobox?** No. Native `<select>` only. See [Combobox](/components/combobox) for listbox-style picking.

**Form integration?** `name` + native form / Sometic Form / `sometic-form`.

**CE options attribute?** There is none, assign the `options` property in JavaScript.

**Children override?** Yes in React/Vue when you pass `children`.

**Invalid styling?** Set `invalid` for `data-invalid` / `aria-invalid`; pair with Field error text.

## Related links

- [Radio](/components/radio)
- [Checkbox](/components/checkbox)
- [Field](/components/field)
- [Form](/components/form)
- [Forms engine](/forms/)
- [Styling slots](/concepts/styling-slots)
- [Beta maturity](/releases/beta)
