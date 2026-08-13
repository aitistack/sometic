# Number input

Numeric field that models value as `number | null` (empty → `null`), with optional min/max clamping. React exposes `minNumber` / `maxNumber`; the custom element uses `min` / `max` attributes wired through `createNumberInputController`.

<PreviewNumber />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { NumberInput } from "@sometic/react/input";

export function Example() {
    const [value, setValue] = useState(null);
    return <NumberInput value={value} onValueChange={setValue} minNumber={0} maxNumber={100} />;
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { NumberInput } from "@sometic/vue/input";

const value = ref(null);
</script>

<template>
    <NumberInput v-model="value" />
</template>
```

```js [Vanilla]
import { createNumberInputController, resolveNumberInput } from "@sometic/dom/input-number";

const input = document.querySelector("input");
const controller = createNumberInputController({
    defaultValue: null,
    onValueChange(next) {
        const view = resolveNumberInput({ value: next });
        input.value = view.value;
    },
});

input.addEventListener("input", () => {
    controller.setFromString(input.value);
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<sometic-number-input min="0" max="100"></sometic-number-input>
```

```html [CDN]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-number-input min="0" max="100"></sometic-number-input>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { NumberInput } from "@sometic/vue/input";

const value = ref(null);
</script>

<template>
    <NumberInput v-model="value" />
</template>
```

## How it works

1. **Engine (`@sometic/dom/input-number`)**: `resolveNumberInput` maps `number | null` to a string for `type: "number"` (`inputMode` defaults to `"decimal"`). `createNumberInputController` parses strings, ignores `NaN` partials, clamps with optional `min` / `max`, and treats empty as `null`.
2. **Adapters**: React `NumberInputProps` uses `value` / `defaultValue` / `onValueChange` as `number | null`, plus `minNumber` / `maxNumber` clamp helpers on change. Vue `v-model` is `number | null` (no clamp props on the Vue surface; forward native attrs if needed).
3. **Custom element**: `sometic-number-input` observes `value`, `min`, `max`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`, rebuilds the controller when bounds/value change, and dispatches `value-change` with `{ value: number | null }`.

## Anatomy

Native number input with input state attrs (`data-empty` when null/empty, plus disabled/readonly/invalid/filled).

## Props / attributes

### React `NumberInputProps`

`Omit<InputProps, "type" | "value" | "defaultValue" | "onValueChange">` plus:

| Prop                                | Type                              | Default | Description                 |
| ----------------------------------- | --------------------------------- | ------- | --------------------------- |
| `value`                             | `number \| null`                  | ,       | Controlled                  |
| `defaultValue`                      | `number \| null`                  | ,       | Uncontrolled initial        |
| `onValueChange`                     | `(value: number \| null) => void` | ,       | Change                      |
| `minNumber`                         | `number`                          | ,       | Clamp lower bound on change |
| `maxNumber`                         | `number`                          | ,       | Clamp upper bound on change |
| `disabled` / `readonly` / `invalid` | `boolean`                         | ,       | State + ARIA                |
| `name` / `placeholder`              | `string`                          | ,       | Form / hint                 |
| styling props                       | from Input                        | ,       | `unstyled`, `classes`, …    |
| Native attrs                        | remaining input HTML attrs        | ,       | Forwarded; `ref` supported  |

### Vue

`modelValue: number | null`, `disabled`, `readonly`. Emits `update:modelValue`. Native `min` / `max` / `step` can be passed via attrs; Vue does not re-clamp in the adapter the way React `minNumber` / `maxNumber` do.

### Custom element (`sometic-number-input`)

Observed: `value`, `min`, `max`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`. Event: `value-change` → `{ value: number | null }`. Controller clamps using attribute `min` / `max`.

## Events / callbacks

| Surface        | Event               | Payload          |
| -------------- | ------------------- | ---------------- |
| React          | `onValueChange`     | `number \| null` |
| Vue            | `update:modelValue` | `number \| null` |
| Custom element | `value-change`      | `{ value }`      |

Ignored while `disabled` or `readonly` on adapter paths. Empty string ⇒ `null`. Non-numeric partials that parse to `NaN` are ignored on React (no emit).

## Controlled vs uncontrolled

Same domain pattern: controlled `value` + handler, or `defaultValue`. Empty field is `null`, never `NaN`. `0` is a real value.

## Form participation

Use `name` when posting natively; prefer reading Sometic `number | null` in [Form](/components/form) handlers so empty stays distinct from zero. Pair with validators for required / range rules beyond clamp.

## Accessibility

- Label via [Field](/components/field).
- Keyboard: native number field (Tab, typing, browser steppers where shown).
- `invalid` for out-of-range after validation; clamps do not replace error messaging.
- Spinbutton chrome depends on the browser’s `type="number"` UI.

## Styling

Standard input state attrs:

```tsx
<NumberInput value={qty} onValueChange={setQty} unstyled classes={{ root: "qty" }} minNumber={1} />
```

## Edge cases

- **Empty vs zero**, `null` means empty; `0` means zero.
- **Partial invalid input**, React skips `NaN`; CE controller ignores `NaN` on `setFromString`.
- **Clamp vs validate**, `minNumber` / `maxNumber` (React) and CE `min` / `max` coerce into range; still surface errors when business rules need messaging.
- **Locale decimals**, this is not CurrencyInput; grouping/currency symbols belong there.
- **SSR**, resolve is pure; register CE in the browser.

## Performance notes

Parse on change only; no `Intl` currency formatting cost. Prefer NumberInput over CurrencyInput when you only need unitless quantities.

## When to use / When not

**Use** for unitless numbers, quantities, ages, counts, and simple numeric settings.

**Do not use** for:

- Money amounts, [Currency input](/components/currency-input).
- Free text, [Input](/components/input).
- Fixed pattern strings, [Masked input](/components/masked-input).

## FAQ

**Why `null`?** Distinguishes empty from `0`.

**`min` / `max` attrs vs `minNumber` / `maxNumber`?** CE uses `min` / `max` attributes on the controller. React exposes `minNumber` / `maxNumber` clamp helpers in addition to any forwarded string constraint attrs.

**Does Vue clamp?** Not via dedicated props; pass native attrs or clamp in your `v-model` handler.

**`NaN` in callbacks?** Avoided; API uses `null` for empty and skips invalid parses on React.

**Step?** Forward native `step` via remaining input attrs when supported.

**Form binding?** Use `useFormField` / Form values typed as `number | null`.

**Does React forward refs?** Yes, to the underlying `<input type="number">`.

**`inputMode`?** Defaults to `"decimal"` from resolve; override via Input attrs when needed.

**Light DOM or shadow?** Light DOM default; `shadow` on the CE for isolation.

**Bundle tip?** Import from `@sometic/react/input` or `@sometic/dom/input-number`.

## Related links

- [Currency input](/components/currency-input)
- [Input](/components/input)
- [Field](/components/field)
- [Form](/components/form)
- [Styling slots](/concepts/styling-slots)
