# Field

Accessible field shell that wires label, description, control, and error with generated IDs and shared invalid / disabled / readonly / required state. Presentation and a11y chrome only; value ownership stays on the control or [Form](/components/form).

<PreviewField />

## Usage

::: code-group

```tsx [React]
import { Field } from "@sometic/react/field";
import { Input } from "@sometic/react/input";

export function Example() {
    return (
        <Field label="Email" description="Work address" required>
            <Input type="email" name="email" />
        </Field>
    );
}
```

```vue [Vue]
<script setup>
import { Field } from "@sometic/vue/field";
import { Input } from "@sometic/vue/input";
</script>

<template>
    <Field label="Email" description="Work address" required>
        <Input type="email" name="email" />
    </Field>
</template>
```

```js [Vanilla]
import { createFieldIds, resolveField } from "@sometic/dom/field";
import { bindInput } from "@sometic/dom/input";

const root = document.querySelector("#field");
const ids = createFieldIds("email");
const view = resolveField({
    ids,
    required: true,
    hasDescription: true,
    hasError: false,
});
for (const [key, attr] of Object.entries(view.attributes)) {
    root.setAttribute(key, attr);
}

const input = root.querySelector("input");
bindInput(input, () => ({ type: "email", name: "email" }));
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<!-- Children mount into the control slot; set label/description/error text via the
     element's internal parts or prefer React/Vue Field for full chrome props. -->
<sometic-field required>
    <sometic-input type="email" name="email"></sometic-input>
</sometic-field>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.3/dist/cdn/sometic-elements.iife.js"></script>

<!-- Children mount into the control slot; set label/description/error text via the
     element's internal parts or prefer React/Vue Field for full chrome props. -->
<sometic-field required>
    <sometic-input type="email" name="email"></sometic-input>
</sometic-field>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.3/dist/cdn/sometic-elements.esm.js"
></script>

<!-- Children mount into the control slot; set label/description/error text via the
     element's internal parts or prefer React/Vue Field for full chrome props. -->
<sometic-field required>
    <sometic-input type="email" name="email"></sometic-input>
</sometic-field>
```

:::

## Vue

```vue
<script setup>
import { Field } from "@sometic/vue/field";
import { Input } from "@sometic/vue/input";
</script>

<template>
    <Field label="Email" description="Work address" required>
        <Input type="email" name="email" />
    </Field>
</template>
```

## How it works

1. **Engine (`@sometic/dom/field`)**: `createFieldIds` / `resolveField` produce stable ids and slot attributes for label, description, control, error, and extra.
2. **Adapters**: React/Vue render the shell and pass ids into child controls via cloning or `fieldIds` / control attributes.
3. **Custom element**: `sometic-field` observes `disabled`, `invalid`, `readonly`, `required`, `shadow`.

Field does not validate or own values; pair with Input/Checkbox/Select and the forms engine when you need submit/validation.

## Anatomy

| Part        | `data-slot`   | Role                             |
| ----------- | ------------- | -------------------------------- |
| Root        | `root`        | Field host                       |
| Label       | `label`       | Associated `<label>`             |
| Description | `description` | Helper text                      |
| Control     | `control`     | Slot for the interactive control |
| Error       | `error`       | Error message when invalid       |
| Extra       | `extra`       | Optional trailing chrome         |

`FieldIds`: `{ id, labelId, descriptionId, errorId }`.

State attrs on root: `data-disabled`, `data-invalid`, `data-readonly`, `data-required`, optional size/variant.

## Props / attributes

### React `FieldProps`

| Prop                                             | Type               | Default   | Description          |
| ------------------------------------------------ | ------------------ | --------- | -------------------- |
| `label`                                          | `ReactNode`        |           | Label content        |
| `description`                                    | `ReactNode`        |           | Helper text          |
| `error`                                          | `ReactNode`        |           | Error content        |
| `children`                                       | `ReactNode`        |           | Control(s)           |
| `ids`                                            | `FieldIds`         | generated | Override ids         |
| `disabled` / `invalid` / `readonly` / `required` | `boolean`          | `false`   | State                |
| `hasDescription` / `hasError`                    | `boolean`          | derived   | Force slot presence  |
| `size` / `variant`                               | `string`           |           | Theme                |
| styling                                          | slots listed above |           | Styleable            |
| Native div attrs                                 |                    |           | Host attrs; `ref` OK |

### Vue

Props: `label`, `description`, `error`, state flags, `ids`, `unstyled`, `classes`. Slots: `label`, `description`, `error`, default (control).

### Custom element (`sometic-field`)

Observed: `disabled`, `invalid`, `readonly`, `required`, `shadow`. Structure children with `data-slot` parts.

## Events / callbacks

None. Field is structural. Child controls emit value events.

## Controlled vs uncontrolled

N/A for Field itself. Pass `invalid` / `error` from form meta or local validation state.

## Form participation

Field does not submit values. Compose with Input / Checkbox / Select / Switch + [Form](/components/form) or `sometic-form`.

## Accessibility

| Concern       | Guidance                                                       |
| ------------- | -------------------------------------------------------------- |
| Label pairing | Label `for` / control `id` via `FieldIds`                      |
| Descriptions  | Description and error ids feed `aria-describedby` when wired   |
| Errors        | Keep visible error text in the `error` slot when `invalid`     |
| Keyboard      | Tab moves to the control; Field itself is not a focus stop     |
| Missing label | Provide `aria-label` on the control if you omit the label slot |

## Styling

Per-slot `classes` / `styles`; state attrs on root. Unstyled by default.

```tsx
<Field
    unstyled
    classes={{ root: "field", label: "field__label", error: "field__error" }}
    label="Email"
    invalid
    error="Required"
>
    <Input type="email" />
</Field>
```

## Edge cases

- **Missing label**: provide `aria-label` on the control.
- **SSR**: `createFieldIds` is pure (optional prefix); register CE in the browser.
- **Multiple controls**: one Field per control is the usual pattern.
- **Recreating `ids` every render**: if you pass `ids` explicitly, memoize or lift them.
- **Invalid without error text**: state attrs still set; prefer visible error content for AT.
- **Multi-instance**: generated ids are unique per `createFieldIds` call.

## Performance notes

Id generation is cheap; resolve is pure. Avoid recreating explicit `ids` objects every render. Import `@sometic/react/field` rather than barrel mega-imports.

## When to use / When not

**Use** whenever a control needs shared label / description / error chrome across frameworks.

**Do not use** as:

- A form engine (that is `@sometic/forms`)
- A replacement for a lone native `<label>` when you need no description/error slots

## FAQ

**How do I pass ids into Input?** Use Field children wiring or pass `fieldIds` from `createFieldIds` / Field `ids`.

**Why separate from Form?** Field is presentation/a11y chrome; Form owns values and validation.

**Can I omit description?** Yes. Slots render when content / `hasDescription` says so.

**CE structure?** `sometic-field` moves light-DOM children into the control slot; label/description/error are internal parts. Prefer React/Vue Field when you need label props out of the box.

**Invalid without error text?** Still sets state attrs; prefer visible error content for AT.

**Does React forward refs?** Yes, to the field root `div`.

**Required flag vs HTML required?** Field sets `data-required` / label cues; still set `required` on the control or validate via forms.

**Readonly + disabled?** Both are independent state attrs; disable interaction on the control as needed.

**Bundle tip?** Import `@sometic/react/field` and the matching input subpath.

## Related links

- [Input](/components/input)
- [Form](/components/form)
- [Forms](/forms/)
- [Checkbox](/components/checkbox)
- [Switch](/components/switch)
- [Styling slots](/concepts/styling-slots)
- [State attributes](/concepts/state-attributes)
