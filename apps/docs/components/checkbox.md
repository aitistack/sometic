# Checkbox

Native checkbox with controllable checked state, optional indeterminate (ARIA mixed), and the shared Sometic styling / state-attribute contract across React, Vue, custom elements, and the DOM engine.

<PreviewCheckbox />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Checkbox } from "@sometic/react/selection";

export function Example() {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onCheckedChange={setChecked} />;
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { Checkbox } from "@sometic/vue/selection";

const checked = ref(false);
</script>

<template>
    <Checkbox v-model:checked="checked" />
</template>
```

```js [Vanilla]
import { bindCheckbox } from "@sometic/dom/checkbox";

const input = document.querySelector('input[type="checkbox"]');
bindCheckbox(input, () => ({
    onCheckedChange(next) {
        console.log(next);
    },
}));
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerSelectionElements } from "@sometic/elements/selection";
    registerSelectionElements();
</script>

<sometic-checkbox></sometic-checkbox>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.iife.js"></script>

<sometic-checkbox></sometic-checkbox>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-checkbox></sometic-checkbox>
```

:::

## How it works

1. **Engine (`@sometic/dom/checkbox`)**: `resolveCheckbox` builds attributes (`aria-checked`, `data-checked`, `data-indeterminate`, …) and native flags. `createCheckboxController` owns controllable `checked` plus mutable `indeterminate`; `toggle` / `setChecked` clear indeterminate. `bindCheckbox` syncs a live input and calls `onCheckedChange`.
2. **Adapters**: React/Vue render `<input type="checkbox">`, resolve each render, and bridge controlled/uncontrolled checked state.
3. **Custom element**: `sometic-checkbox` observes attributes, hosts a light-DOM checkbox, and emits `checked-change`.

## Anatomy

| Part | `data-slot` | Role                                                              |
| ---- | ----------- | ----------------------------------------------------------------- |
| Root | `root`      | Native `<input type="checkbox">` (or CE host attrs + inner input) |

**State / ARIA from resolve:**

- `data-checked`: `"true"` \| `"indeterminate"` (when mixed)
- `data-indeterminate`, `data-disabled`, `data-invalid`
- optional `data-size` / `data-variant`
- `aria-checked`: `"true"` \| `"false"` \| `"mixed"`
- `aria-invalid` when `invalid`

## Props / attributes

### React `CheckboxProps`

Omits native `type` / `checked` / `defaultChecked` / `onChange`; extends `ResolveCheckboxOptions` and remaining input HTML attributes.

| Prop                                                                                   | Type                         | Default | Description                      |
| -------------------------------------------------------------------------------------- | ---------------------------- | ------- | -------------------------------- |
| `checked`                                                                              | `boolean`                    | ,       | Controlled checked               |
| `defaultChecked`                                                                       | `boolean`                    | `false` | Uncontrolled initial             |
| `onCheckedChange`                                                                      | `(checked: boolean) => void` | ,       | Change callback                  |
| `indeterminate`                                                                        | `boolean`                    | `false` | Visual / ARIA mixed              |
| `disabled`                                                                             | `boolean`                    | `false` | Disables interaction             |
| `required`                                                                             | `boolean`                    | `false` | Native required                  |
| `invalid`                                                                              | `boolean`                    | `false` | Invalid + `aria-invalid`         |
| `name`                                                                                 | `string`                     | ,       | Form name                        |
| `value`                                                                                | `string`                     | ,       | Form value when checked          |
| `size` / `variant`                                                                     | `string`                     | ,       | Theme state attrs                |
| `unstyled` / `classes` / `styles` / `cssVariables` / `defaults` / `variants` / `merge` | styling                      | ,       | Styleable contract (`root` slot) |
| Native attrs                                                                           | remaining input attrs        | ,       | Forwarded; `ref` supported       |

### Custom element (`sometic-checkbox`)

Observed: `checked`, `indeterminate`, `disabled`, `name`, `value`, `shadow`.

### Vue

`v-model:checked` → `checked` / `update:checked`; also emits `checkedChange`.

## Events / callbacks

| Surface        | Event                             | Payload                |
| -------------- | --------------------------------- | ---------------------- |
| React          | `onCheckedChange`                 | `boolean`              |
| Vue            | `update:checked`, `checkedChange` | `boolean`              |
| Custom element | `checked-change`                  | `{ checked: boolean }` |
| `bindCheckbox` | native `change`                   | `element.checked`      |

## Controlled vs uncontrolled

- **Controlled:** pass `checked` (+ `onCheckedChange`).
- **Uncontrolled:** omit `checked`, use `defaultChecked`.
- `indeterminate` is always a prop/attribute overlay; toggling checked on controller/CE clears it.

## Form participation

Native checkbox: when checked, `name`/`value` appear in form submit. Indeterminate is **not** a third submit state, posting follows checked/unchecked only. Works inside native forms, [Form](/components/form), and `sometic-form`.

## Accessibility

- Prefer a visible `<label>` or `aria-label`.
- Indeterminate ⇒ `aria-checked="mixed"` and `data-checked="indeterminate"`.
- Keep keyboard activation on the native input; do not replace with a div role.
- React resolves ARIA/`data-*` from the `indeterminate` prop; set the DOM `indeterminate` property yourself if you need the browser’s native paint beyond attributes.

## Styling

Unstyled by default. Target:

- `[data-checked="true"]`, `[data-checked="indeterminate"]`
- `[data-indeterminate="true"]`
- `[data-disabled]`, `[data-invalid]`
- `[data-slot="root"]`

Light DOM is the CE default. `shadow` opts into an open shadow root.

## Edge cases

- **Indeterminate + submit**, visual only; FormData still uses checked.
- **User toggle clears indeterminate**, on controller and CE paths.
- **Controlled without handler**: UI will not update when clicked (expected controlled contract).
- **SSR**, resolve is pure; register CE in the browser.
- **Multi-instance**, no shared singleton state.

## Performance notes

Resolve is pure; adapters avoid controllers unless you opt into `createCheckboxController` for vanilla orchestration. Thin adapters keep React/Vue bundles small, import `@sometic/react/selection` rather than inventing parallel checkbox logic.

## When to use / When not

**Use** for independent on/off choices, multi-select boolean lists, and tri-state “select all” via `indeterminate`.

**Do not use** for mutually exclusive options ([Radio](/components/radio)), instant settings switch UX ([Switch](/components/switch)), or toolbar pressed state ([Toggle button](/components/toggle-button)).

## FAQ

**Does indeterminate count as checked for submit?** No. Visual/ARIA only.

**Does user toggle clear indeterminate?** Yes on controller and custom-element paths.

**Controlled vs uncontrolled?** Pass `checked` for controlled; omit and use `defaultChecked` for uncontrolled.

**Why not a pure ARIA checkbox?** Native HTML keeps form serialization and platform semantics intact.

**React and the DOM `indeterminate` property?** Resolve sets ARIA/`data-*`; set `element.indeterminate` yourself if you need native paint.

**Switch vs Checkbox?** Same input type under the hood for Switch, but Switch resolve uses `role="switch"` semantics, pick the control that matches UX expectations.

**Invalid without forms?** `invalid` still sets attributes for styling/ARIA; pair with Field or forms meta for messages.

**CE `shadow`?** Isolates styles; form participation still uses the inner input in light or shadow mount root.

## Related links

- [Switch](/components/switch)
- [Radio](/components/radio)
- [Select](/components/select)
- [Form](/components/form)
- [Forms engine](/forms/)
- [Styling slots](/concepts/styling-slots)
