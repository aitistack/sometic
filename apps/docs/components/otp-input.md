# OTP input

Fixed-length one-time code input that keeps digits only. Defaults to `length={6}`, `inputMode="numeric"`, and `autocomplete="one-time-code"`. Adapters use a **single** native input; multi-box UIs compose on top of `createOtpInputController` (`setCharAt`, `applyPaste`, `clear`).

<PreviewOtp />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { OtpInput } from "@sometic/react/input";

export function Example() {
    const [code, setCode] = useState("");
    return (
        <OtpInput
            length={6}
            value={code}
            onValueChange={(next) => {
                setCode(next);
                if (next.length === 6) {
                    // submit / verify
                }
            }}
        />
    );
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { OtpInput } from "@sometic/vue/input";

const code = ref("");
</script>

<template>
    <OtpInput v-model="code" :length="6" />
</template>
```

```js [Vanilla]
import { createOtpInputController, resolveOtpInput } from "@sometic/dom/input-otp";

const input = document.querySelector("input");
const controller = createOtpInputController({
    length: 6,
    defaultValue: "",
    onValueChange(next) {
        const view = resolveOtpInput({ value: next, length: 6 });
        input.value = view.value;
        if (next.length === 6) {
            console.log("complete", next);
        }
    },
});

input.addEventListener("input", () => {
    controller.applyPaste(input.value);
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<sometic-otp-input length="6"></sometic-otp-input>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.iife.js"></script>

<sometic-otp-input length="6"></sometic-otp-input>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-otp-input length="6"></sometic-otp-input>
```

:::

## Vue

```vue
<script setup>
import { ref, watch } from "vue";
import { OtpInput } from "@sometic/vue/input";

const code = ref("");
watch(code, (next) => {
    if (next.length === 6) {
        // submit / verify
    }
});
</script>

<template>
    <OtpInput v-model="code" :length="6" />
</template>
```

> There is **no** separate `onComplete` prop on React/Vue. Detect completion when `value.length === length` inside `onValueChange` / a `watch`.

## How it works

1. **Engine (`@sometic/dom/input-otp`)**: `resolveOtpInput` slices to `length` (default 6), forces `type: "text"`, defaults `inputMode` to `"numeric"` and `autocomplete` to `"one-time-code"`. `createOtpInputController` sanitizes with `/\D/g`, supports `setCharAt`, `applyPaste`, and `clear` for multi-box compositions.
2. **Adapters**: React/Vue keep one string value, strip non-digits, and enforce `maxLength` / `maxlength`. Vue `length` defaults to 6.
3. **Custom element**: `sometic-otp-input` observes `value`, `length`, `disabled`, `readonly`, `shadow`, and dispatches `value-change` with `{ value }` (digits only).

## Anatomy

Same interactive model as a single [Input](/components/input); value is one string of length ≤ `length`. Multi-box layouts are your composition using the DOM controller helpers, not separate shipped box components.

## Props / attributes

### React `OtpInputProps`

`Omit<InputProps, "type" | "value" | "defaultValue">` plus:

| Prop                                | Type                       | Default                        | Description                |
| ----------------------------------- | -------------------------- | ------------------------------ | -------------------------- |
| `length`                            | `number`                   | `6`                            | Max digits                 |
| `value`                             | `string`                   | ,                              | Controlled digits string   |
| `defaultValue`                      | `string`                   | ,                              | Uncontrolled initial       |
| `onValueChange`                     | `(value: string) => void`  | ,                              | Digits only                |
| `disabled` / `readonly` / `invalid` | `boolean`                  | ,                              | State + ARIA               |
| `name`                              | `string`                   | ,                              | Form association           |
| `autocomplete`                      | `string`                   | engine default `one-time-code` | Override if needed         |
| styling props                       | from Input                 | ,                              | `unstyled`, `classes`, …   |
| Native attrs                        | remaining input HTML attrs | ,                              | Forwarded; `ref` supported |

### Vue

`modelValue`, `length` (default `6`), `disabled`, `readonly`. Emits `update:modelValue`.

### Custom element (`sometic-otp-input`)

Observed: `value`, `length`, `disabled`, `readonly`, `shadow`. Event: `value-change` → `{ value: string }`.

## Events / callbacks

| Surface        | Event               | Payload         |
| -------------- | ------------------- | --------------- |
| React          | `onValueChange`     | digits `string` |
| Vue            | `update:modelValue` | digits `string` |
| Custom element | `value-change`      | `{ value }`     |

Completion is app-defined (`value.length === length`). Changes ignored while `disabled` or `readonly`.

## Controlled vs uncontrolled

Same as Input value contract: controlled `value` + handler, or `defaultValue`. Prefer controlled when you verify on completion.

## Form participation

Single `name`d input posts the code string. Keep `autocomplete="one-time-code"` for SMS autofill. Prefer Form field values for verification requests instead of scraping the DOM after submit.

## Accessibility

- One field is the recommended default for AT and OS OTP autofill.
- Multi-box UIs must keep a cohesive accessible name (one legend/label for the group) and manage focus movement yourself when composing with `setCharAt`.
- Announce verification failures via Field / [Alert](/components/alert) live regions.
- Keyboard: native text editing; non-digits never stick in the value.

## Styling

Input state attrs. Multi-box layouts style your own cells; the shipped adapter is one control:

```tsx
<OtpInput length={6} value={code} onValueChange={setCode} unstyled classes={{ root: "otp" }} />
```

## Edge cases

- **Non-digits stripped** on every change.
- **Paste longer than `length`**, truncated by sanitize (`slice(0, length)`).
- **Length changes**, prefer a fixed length for a given flow; changing mid-entry truncates via resolve/slice.
- **Alphabet codes**, current engine focuses on digits; validate upstream if you need alphanumeric OTPs.
- **SSR**, engine is pure; register CE in the browser.

## Performance notes

Single string state is cheap. Multi-box UIs should share **one** `createOtpInputController` instead of N independent strings.

## When to use / When not

**Use** for MFA, email, and SMS one-time codes.

**Do not use** for:

- Long-lived passwords, [Password input](/components/password-input).
- Free text, [Input](/components/input).
- Masked phone patterns, [Masked input](/components/masked-input).

## FAQ

**One box or many?** The shipped adapters are one input holding one string. Multi-box is composition on `createOtpInputController`.

**Is there `onComplete`?** No. Derive completion from `onValueChange` when `value.length === length`.

**Alphabet codes?** Digits only today. Filter/validate upstream if you need letters.

**Default length?** `6` in resolve and Vue/React defaults.

**Autocomplete?** Defaults to `one-time-code`. Keep it for SMS autofill unless your platform requires a different token.

**Does React forward refs?** Yes, to the underlying `<input>`.

**Vue `v-model` type?** `string` (digits).

**Can length be 4 or 8?** Yes; pass `length`.

**Light DOM or shadow?** Light DOM default; `shadow` on the CE for isolation.

**Bundle tip?** Import from `@sometic/react/input` or `@sometic/dom/input-otp`.

## Related links

- [Input](/components/input)
- [Password input](/components/password-input)
- [Field](/components/field)
- [Form](/components/form)
- [Alert](/components/alert)
- [Styling slots](/concepts/styling-slots)
