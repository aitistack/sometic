# Date input

Native `type="date"` field backed by a pluggable `DateAdapter` so serialize/deserialize stay library-agnostic. App state is `Date | null` (empty ⇒ `null`).

<PreviewDate />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { DateInput } from "@sometic/react/input";
import { createNativeDateAdapter } from "@sometic/date-native";

const adapter = createNativeDateAdapter();

export function Example() {
    const [value, setValue] = useState(null);
    return <DateInput adapter={adapter} value={value} onValueChange={setValue} />;
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { DateInput } from "@sometic/vue/input";
import { createNativeDateAdapter } from "@sometic/date-native";

const adapter = createNativeDateAdapter();
const value = ref(null);
</script>

<template>
    <DateInput v-model="value" :adapter="adapter" />
</template>
```

```js [Vanilla]
import { createDateInputController, resolveDateInput } from "@sometic/dom/input-date";
import { createNativeDateAdapter } from "@sometic/date-native";

const adapter = createNativeDateAdapter();
const input = document.querySelector("input");
const controller = createDateInputController({
    adapter,
    defaultValue: null,
    onValueChange(next) {
        const view = resolveDateInput({ adapter, value: next });
        input.value = view.value;
    },
});

input.addEventListener("input", () => {
    controller.setFromNativeValue(input.value);
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<!-- Defaults to createNativeDateAdapter(); override via element.adapter -->
<sometic-date-input></sometic-date-input>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.6/dist/cdn/sometic-elements.iife.js"></script>

<!-- Defaults to createNativeDateAdapter(); override via element.adapter -->
<sometic-date-input></sometic-date-input>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.6/dist/cdn/sometic-elements.esm.js"
></script>

<!-- Defaults to createNativeDateAdapter(); override via element.adapter -->
<sometic-date-input></sometic-date-input>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { DateInput } from "@sometic/vue/input";
import { createNativeDateAdapter } from "@sometic/date-native";

const adapter = createNativeDateAdapter();
const value = ref(null);
</script>

<template>
    <DateInput v-model="value" :adapter="adapter" />
</template>
```

> React and Vue **require** `adapter: DateAdapter` (for example `createNativeDateAdapter()` from `@sometic/date-native`). The custom element defaults to a native adapter internally and exposes an `adapter` property setter for swaps.

## How it works

1. **Engine (`@sometic/dom/input-date`)**: `resolveDateInput` serializes a valid `Date` through the adapter into the native input string (`type: "date"`). `createDateInputController` owns controllable `Date | null` and `setFromNativeValue` (empty ⇒ `null`; invalid deserialize ⇒ `null`).
2. **Adapters**: React/Vue require `adapter`; value APIs use `Date | null`. On change they deserialize with the adapter and emit only when `parsed.valid` (else `null`).
3. **Custom element**: `sometic-date-input` observes `value`, `disabled`, `readonly`, `invalid`, `shadow`, defaults `#adapter` to `createNativeDateAdapter()`, rebuilds the controller when `value` or `adapter` changes, and dispatches `value-change` with `{ value: Date | null }`.

Date libraries stay optional peers; the core never imports dayjs/date-fns.

## Anatomy

| Part         | Role                                         |
| ------------ | -------------------------------------------- |
| Native input | Browser date control; domain value is `Date` |

State attributes follow [Input](/components/input). Invalid dates from the adapter become empty display / `null` value.

## Props / attributes

### React `DateInputProps`

`Omit<InputProps, "type" | "value" | "defaultValue" | "onValueChange">` plus:

| Prop                                | Type                            | Default  | Description                |
| ----------------------------------- | ------------------------------- | -------- | -------------------------- |
| `adapter`                           | `DateAdapter`                   | required | Serialize/deserialize      |
| `value`                             | `Date \| null`                  | ,        | Controlled                 |
| `defaultValue`                      | `Date \| null`                  | ,        | Uncontrolled initial       |
| `onValueChange`                     | `(value: Date \| null) => void` | ,        | Change                     |
| `disabled` / `readonly` / `invalid` | `boolean`                       | ,        | State + ARIA               |
| `name`                              | `string`                        | ,        | Form association           |
| styling props                       | from Input                      | ,        | `unstyled`, `classes`, …   |
| Native attrs                        | remaining input HTML attrs      | ,        | Forwarded; `ref` supported |

### Vue

Required `adapter`, `modelValue: Date | null`, `disabled`, `readonly`. Emits `update:modelValue`.

### Custom element (`sometic-date-input`)

Observed: `value`, `disabled`, `readonly`, `invalid`, `shadow`. Property: `adapter` getter/setter. Event: `value-change` → `{ value: Date | null }`.

## Events / callbacks

| Surface        | Event               | Payload        |
| -------------- | ------------------- | -------------- |
| React          | `onValueChange`     | `Date \| null` |
| Vue            | `update:modelValue` | `Date \| null` |
| Custom element | `value-change`      | `{ value }`    |

Ignored while `disabled` or `readonly`. Empty native string ⇒ `null`. Invalid adapter deserialize ⇒ `null`.

## Controlled vs uncontrolled

Same as other domain inputs: controlled `value` + handler, or `defaultValue` / CE attribute. Empty always means `null`, never a sentinel `Invalid Date` in the public callback path.

## Form participation

Serialize with your adapter on submit (ISO date string, etc.). Native `yyyy-mm-dd` may appear in FormData depending on wiring; prefer Sometic `Date | null` values inside [Form](/components/form). Constraint attrs (`min` / `max` strings) can still be forwarded where Input allows; validate with Form validators for cross-field rules.

## Accessibility

- Label clearly via [Field](/components/field).
- Keyboard and picker UI vary by browser/OS; provide short helper text when users may lack a graphical picker.
- Set `invalid` + error text for out-of-range or required empty values.
- This is a native date field, not a custom calendar grid (no arrow-key grid contract beyond the browser control).

## Styling

Native picker chrome is limited. Style the input host via state attrs / `classes`. Shadow DOM on the CE isolates host styles only; the OS picker UI stays platform-owned.

## Edge cases

- **Invalid strings** ⇒ `null` when `adapter.deserialize` reports invalid.
- **Timezone / calendar date vs instant**, adapters document semantics; read `@sometic/date-core` / native adapter docs before assuming UTC midnight.
- **Adapter swap mid-life**, CE rebuilds controller; React/Vue should keep a stable adapter instance per field when possible.
- **SSR**, adapters must not touch browser globals at import time; register CE in the browser.
- **No DatePicker popover** in this beta surface; do not invent overlay APIs here.

## Performance notes

Adapters are optional peer packages so date-fns/dayjs are not forced into every bundle. Prefer one adapter instance shared across fields that share the same library.

## When to use / When not

**Use** when you need `Date | null` values with a swappable serialize strategy on a native date control.

**Do not use** for:

- Free-text date entry without a native control (compose Input + validation).
- Full calendar popovers / ranges (not shipped in this beta).
- Date-time with time-of-day unless your adapter and `type` mapping explicitly support it (this resolve uses `type: "date"`).

## FAQ

**Why adapters?** Date libraries stay optional. The engine only depends on the `DateAdapter` contract from `@sometic/date-core`.

**Which adapter by default?** `@sometic/date-native` for the CE. React/Vue require an explicit `adapter` prop.

**Is there a DatePicker UI?** Not in this beta. Use DateInput for native date fields.

**Empty value?** Always `null` in callbacks when cleared or invalid.

**How do min/max work?** Forward constraint attrs / validate in Form. Do not assume every adapter interprets min/max the same way.

**Can I set `element.adapter` on the CE?** Yes; the setter rebuilds the controller.

**Does React forward refs?** Yes, to the underlying `<input type="date">`.

**Vue `v-model` type?** `Date | null`.

**SSR safe?** Resolvers are import-safe; register custom elements only in the browser.

**Bundle tip?** Import `@sometic/react/input` plus only the date adapter package you need.

## Related links

- [Input](/components/input)
- [Field](/components/field)
- [Form](/components/form)
- [Beta maturity](/releases/beta)
- [Styling slots](/concepts/styling-slots)
