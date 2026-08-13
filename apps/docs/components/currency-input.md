# Currency input

Locale-aware currency text field over a numeric `number | null` value. Display uses `Intl.NumberFormat` (`style: "currency"`); parsing extracts digits into a fixed fraction scale. Empty display maps to `null` (distinct from `0`).

<PreviewCurrency />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { CurrencyInput } from "@sometic/react/input";

export function Example() {
    const [amount, setAmount] = useState(null);
    return (
        <CurrencyInput
            currency="USD"
            locale="en-US"
            fractionDigits={2}
            value={amount}
            onValueChange={setAmount}
        />
    );
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { CurrencyInput } from "@sometic/vue/input";

const amount = ref(null);
</script>

<template>
    <CurrencyInput v-model="amount" currency="USD" locale="en-US" :fraction-digits="2" />
</template>
```

```js [Vanilla]
import { createCurrencyInputController } from "@sometic/dom/input-currency";

const input = document.querySelector("input");
const controller = createCurrencyInputController({
    locale: "en-US",
    currency: "USD",
    fractionDigits: 2,
    defaultValue: null,
    onValueChange(next) {
        console.log(next);
    },
});

const apply = () => {
    const view = controller.resolve();
    input.value = view.value;
};
apply();

input.addEventListener("input", () => {
    controller.setFromDisplay(input.value);
    apply();
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<sometic-currency-input currency="USD" locale="en-US" fraction-digits="2"></sometic-currency-input>
```

```html [CDN]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.iife.js"></script>
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-currency-input currency="USD" locale="en-US" fraction-digits="2"></sometic-currency-input>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { CurrencyInput } from "@sometic/vue/input";

const amount = ref(null);
</script>

<template>
    <CurrencyInput v-model="amount" currency="USD" locale="en-US" :fraction-digits="2" />
</template>
```

## How it works

1. **Engine (`@sometic/dom/input-currency`)**: `createCurrencyInputController` builds an `Intl.NumberFormat`, stores controllable `number | null`, formats via `getDisplayValue` / `resolve` (`type: "text"`, `inputMode: "decimal"`), and parses with `setFromDisplay` (digit walk + fractionDigits scale; supports leading `-` / parentheses negatives).
2. **Adapters**: React props `locale`, `currency`, `fractionDigits`, plus numeric value API. Vue defaults `locale="en-US"`, `currency="USD"`, `fractionDigits=2`, and `v-model` as `number | null`.
3. **Custom element**: `sometic-currency-input` observes `value`, `currency`, `locale`, `fraction-digits`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`. Updates on `change` / `blur`, dispatches `value-change` with `{ value: number | null }`.

Not a `type="number"` control; locale symbols and separators need text parsing.

## Anatomy

| Part         | Role                                                |
| ------------ | --------------------------------------------------- |
| Native input | Localized currency **display**; app owns **number** |

State attributes follow [Input](/components/input): `data-disabled`, `data-readonly`, `data-invalid`, `data-filled`, `data-empty`, optional size/variant.

## Props / attributes

### React `CurrencyInputProps`

`Omit<InputProps, "type" | "value" | "defaultValue" | "onValueChange">` plus:

| Prop                                | Type                              | Default (engine) | Description                |
| ----------------------------------- | --------------------------------- | ---------------- | -------------------------- |
| `locale`                            | `string`                          | `"en-US"`        | BCP 47 locale              |
| `currency`                          | `string`                          | `"USD"`          | ISO 4217 currency code     |
| `fractionDigits`                    | `number`                          | `2`              | Min/max fraction digits    |
| `value`                             | `number \| null`                  | ,                | Controlled amount          |
| `defaultValue`                      | `number \| null`                  | ,                | Uncontrolled initial       |
| `onValueChange`                     | `(value: number \| null) => void` | ,                | Change                     |
| `disabled` / `readonly` / `invalid` | `boolean`                         | ,                | State + ARIA               |
| `name` / `placeholder`              | `string`                          | ,                | Form / hint                |
| styling props                       | from Input                        | ,                | `unstyled`, `classes`, …   |
| Native attrs                        | remaining input HTML attrs        | ,                | Forwarded; `ref` supported |

### Vue

`modelValue: number | null`, `locale` (default `en-US`), `currency` (default `USD`), `fractionDigits` (default `2`), `disabled`, `readonly`. Emits `update:modelValue`.

### Custom element (`sometic-currency-input`)

Observed: `value`, `currency`, `locale`, `fraction-digits`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`. Event: `value-change` → `{ value: number | null }`.

## Events / callbacks

| Surface        | Event               | Payload          |
| -------------- | ------------------- | ---------------- |
| React          | `onValueChange`     | `number \| null` |
| Vue            | `update:modelValue` | `number \| null` |
| Custom element | `value-change`      | `{ value }`      |

Ignored while `disabled` or `readonly` on adapter paths. Empty digit sequence ⇒ `null`.

## Controlled vs uncontrolled

- **Controlled:** `value` + `onValueChange` (`null` for empty).
- **Uncontrolled:** `defaultValue` / omit `value`.
- Vue: `v-model` as `number | null`.
- `0` is a real amount; empty field is `null`.

## Form participation

Submit the numeric value from Form / app state, not the pretty display string. Native `name` alone may post localized text depending on wiring; prefer Sometic field values inside [Form](/components/form).

## Accessibility

- Label the currency explicitly (“Amount (USD)”) via [Field](/components/field).
- Keyboard: native text editing; `inputMode="decimal"` hints mobile keyboards.
- On parse/validation failure set `invalid` + error text; do not rely on formatting alone.
- Prefer `lang` on a parent when locale differs from the page language.

## Styling

Input state attrs. Tabular numbers help when formats change length:

```tsx
<CurrencyInput currency="EUR" locale="de-DE" unstyled classes={{ root: "money-field" }} />
```

## Edge cases

- **Partial typing**, digit parsing may yield intermediate amounts; empty digits ⇒ `null`.
- **Negatives**, leading `-` or `(…)` forms are supported by the parser.
- **Currency / locale change**, rebuilds formatter; remount or carefully reset value if mid-edit.
- **fractionDigits**, controls both format precision and parse scale.
- **SSR / Intl**, `Intl.NumberFormat` must exist in the runtime; resolve/controllers do not touch `window` at import time. Register CE in the browser.
- **Not NumberInput**, unitless quantities belong on [Number input](/components/number-input).

## Performance notes

`Intl.NumberFormat` is constructed per controller (locale/currency/fractionDigits). Avoid recreating controllers every keystroke in custom DOM wiring; React/Vue adapters create per render with current props, so keep props stable when possible.

## When to use / When not

**Use** for money amounts with locale currency display.

**Do not use** for:

- Unitless numbers, [Number input](/components/number-input).
- Fixed digit masks (phone/ZIP), [Masked input](/components/masked-input).
- Cryptocurrency tickers without ISO currency support in `Intl` (validate your runtime).

## FAQ

**Why not `type="number"`?** Currency symbols and grouping separators need text formatting/parsing via `Intl`.

**What does `fractionDigits` do?** Sets `minimumFractionDigits` / `maximumFractionDigits` on the formatter and the parse scale for digit groups.

**`null` vs `0`?** Empty field is `null`. Zero is a valid amount.

**Which locales work?** Any locale/currency pair supported by the runtime `Intl.NumberFormat`.

**What should I submit to the server?** The number from `onValueChange` / Form state, not the display string.

**Vue prop name for fractions?** `fractionDigits` (template: `fraction-digits`).

**CE attribute?** `fraction-digits`.

**Does React forward refs?** Yes, to the underlying `<input>`.

**Can I force a currency symbol position?** Formatting follows `Intl` for the given locale/currency; override visually only with care (keep the numeric value authoritative).

**Bundle tip?** Import from `@sometic/react/input` or `@sometic/dom/input-currency`.

## Related links

- [Number input](/components/number-input)
- [Input](/components/input)
- [Masked input](/components/masked-input)
- [Form](/components/form)
- [Field](/components/field)
