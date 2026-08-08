# Masked input

Pattern-masked text input. The field shows a formatted display string; `onValueChange` / `v-model` receive the **raw** alphanumeric characters kept by the mask (`#` digits, `A` letters, `*` alphanumeric; other characters are literals).

<PreviewMasked />

## Usage

::: code-group

```tsx [JS]
import { useState } from "react";
import { MaskedInput } from "@sometic/react/input";

export function Example() {
    const [raw, setRaw] = useState("");
    return (
        <MaskedInput mask="(###) ###-####" value={raw} onValueChange={setRaw} placeholder="Phone" />
    );
}
```

```tsx [TS]
import { useState } from "react";
import { MaskedInput } from "@sometic/react/input";

export function Example(): JSX.Element {
    const [raw, setRaw] = useState("");
    return (
        <MaskedInput mask="(###) ###-####" value={raw} onValueChange={setRaw} placeholder="Phone" />
    );
}
```

```html [Vanilla]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<sometic-masked-input mask="(###) ###-####" placeholder="Phone"></sometic-masked-input>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { MaskedInput } from "@sometic/vue/input";

const raw = ref("");
</script>

<template>
    <MaskedInput v-model="raw" mask="(###) ###-####" placeholder="Phone" />
</template>
```

## How it works

1. **Engine (`@sometic/dom/input-masked`)**: `parseMask` / `formatMasked` map raw characters onto mask tokens. `createMaskedInputController` holds controllable **raw** string state and resolves display via `resolveInput` (`type: "text"`).
2. **Adapters**: React `MaskedInput` requires `mask: string`; controlled value is raw. On change it strips to alphanumeric, then keeps only characters that fit the mask (`formatMasked(...).raw`). Vue mirrors with required `mask` and `v-model` (raw).
3. **Custom element**: `sometic-masked-input` observes `mask`, `value`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`, syncs the display string into a light-DOM `<input>`, and dispatches `value-change` with `{ value }` (raw).

Masking is formatting, not validation or a security boundary.

## Anatomy

| Part         | Role                                       |
| ------------ | ------------------------------------------ |
| Native input | Shows masked **display**; app owns **raw** |

State attributes follow [Input](/components/input): `data-disabled`, `data-readonly`, `data-invalid`, `data-filled`, `data-empty`, optional `data-size` / `data-variant`.

## Props / attributes

### React `MaskedInputProps`

`Omit<InputProps, "type" | "value" | "defaultValue">` plus:

| Prop                   | Type                       | Default  | Description                |
| ---------------------- | -------------------------- | -------- | -------------------------- |
| `mask`                 | `string`                   | required | Pattern tokens             |
| `value`                | `string`                   | ,        | Controlled **raw** value   |
| `defaultValue`         | `string`                   | ,        | Uncontrolled initial raw   |
| `onValueChange`        | `(raw: string) => void`    | ,        | Emits raw characters       |
| `disabled`             | `boolean`                  | `false`  | Disables input             |
| `readonly`             | `boolean`                  | `false`  | Read-only                  |
| `invalid`              | `boolean`                  | `false`  | Invalid + `aria-invalid`   |
| `name` / `placeholder` | `string`                   | ,        | Native association / hint  |
| styling props          | from Input                 | ,        | `unstyled`, `classes`, …   |
| Native attrs           | remaining input HTML attrs | ,        | Forwarded; `ref` supported |

### Vue

Required `mask`, `modelValue` (raw string), `disabled`, `readonly`. Emits `update:modelValue` with raw. Use `v-model`.

### Custom element (`sometic-masked-input`)

Observed: `mask`, `value`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`. Event: `value-change` → `{ value: string }` (raw).

## Events / callbacks

| Surface        | Event               | Payload      |
| -------------- | ------------------- | ------------ |
| React          | `onValueChange`     | raw `string` |
| Vue            | `update:modelValue` | raw `string` |
| Custom element | `value-change`      | `{ value }`  |

Callbacks are ignored while `disabled` or `readonly` on the adapter path. Display string is never the event payload.

## Controlled vs uncontrolled

Same pattern as Input, but the controlled value is **raw**, not display:

- **Controlled:** pass `value` (raw) + `onValueChange`.
- **Uncontrolled:** omit `value`, optional `defaultValue`.
- Vue: `v-model` binds raw.

## Form participation

Native `name` posts whatever is in the DOM input (display). Prefer reading Sometic raw state (or formatting on submit) when validating or storing. Pair with `@sometic/validation` on the raw string inside [Form](/components/form).

## Accessibility

- Label via [Field](/components/field); describe the expected format in description text (“US phone: (555) 123-4567”).
- Masking does not replace validation; set `invalid` + error text when rules fail.
- Keyboard behavior is native text input (Tab, caret, selection).
- Do not use the mask as the only error announcement; use Field / live regions for failures.

## Styling

Same input state attrs. Example:

```tsx
<MaskedInput mask="###-##-####" unstyled classes={{ root: "field-control" }} invalid={hasError} />
```

## Edge cases

- **Incomplete input**, raw may be shorter than the pattern; display stops filling tokens.
- **Paste**, alphanumeric characters are filtered then applied to the mask; excess is dropped by token walk.
- **Mask tokens**, `#` = digit, `A` = letter, `*` = alphanumeric; everything else is a literal.
- **React strip vs CE controller**, React adapters filter to `[a-zA-Z0-9]` before `formatMasked`; prefer the same mask tokens your CE demos use.
- **Not security**, never treat masking as sanitization for secrets.
- **SSR**, format helpers are pure; register the CE only in the browser.

## Performance notes

`formatMasked` runs on each change. Keep masks modest in length. Import `@sometic/react/input` (or Vue/elements/dom masked subpaths) so unused specialized inputs tree-shake.

## When to use / When not

**Use** for fixed patterns such as phone, ZIP, and simple ID formats.

**Do not use** for:

- Money amounts, [Currency input](/components/currency-input).
- Unitless numbers, [Number input](/components/number-input).
- Free text or schema-only validation without display formatting, [Input](/components/input).

## FAQ

**Display vs raw?** The UI shows the masked display; callbacks and controlled `value` use raw kept characters.

**What are the mask tokens?** `#` digit, `A` letter, `*` alphanumeric; other characters are literals (for example `(`, `)`, `-`, spaces).

**Does paste work?** Yes. Pasted text is filtered and walked through the mask; only matching characters are kept.

**Is the mask validation?** No. Pair raw output with `@sometic/validation` or your Form validators.

**Why not CurrencyInput?** Currency needs `Intl` formatting and numeric `number | null` values, not digit literals in a fixed pattern.

**Can I change `mask` at runtime?** Yes on CE (rebuilds controller) and React/Vue (re-format from current raw). Prefer stable masks per field to avoid surprising caret jumps.

**Controlled empty string?** `value=""` is controlled empty raw, not uncontrolled.

**Ref forwarding?** React forwards `ref` to the underlying `<input>`.

**Light DOM or shadow?** Light DOM default; `shadow` on the CE isolates styles.

**Bundle tip?** Import from `@sometic/react/input` or `@sometic/dom/input-masked`, not a mega barrel.

## Related links

- [Input](/components/input)
- [Currency input](/components/currency-input)
- [Field](/components/field)
- [Form](/components/form)
- [Styling slots](/concepts/styling-slots)
