# Input

Controllable native text-like `<input>` with shared invalid/disabled/readonly state attributes and styling slots.

<PreviewInput />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { Input } from "@sometic/react/input";

export function Example() {
    const [value, setValue] = useState("");
    return <Input value={value} onValueChange={setValue} placeholder="Name" />;
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { Input } from "@sometic/vue/input";

const value = ref("");
</script>

<template>
    <Input v-model="value" placeholder="Name" />
</template>
```

```js [Vanilla]
import { bindInput } from "@sometic/dom/input";

const input = document.querySelector("input");
bindInput(input, () => ({
    value: input.value,
    onValueChange(next) {
        console.log(next);
    },
}));
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<sometic-input placeholder="Name"></sometic-input>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.iife.js"></script>

<sometic-input placeholder="Name"></sometic-input>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-input placeholder="Name"></sometic-input>
```

:::

## How it works

1. **Engine (`@sometic/dom/input`)**: `resolveInput` produces class/style maps, `attributes` / `nativeAttributes`, and filled/empty flags. `createInputController` wraps controllable `value` state; `bindInput` syncs a live `<input>` and emits `onValueChange` (ignored while disabled/readonly).
2. **Adapters**: React/Vue render a native `<input>`, merge resolved attributes, and bridge controlled/uncontrolled value (`value` + `onValueChange`, or Vue `v-model`).
3. **Custom element**: `sometic-input` observes attributes, hosts a light-DOM input, and dispatches `value-change` with `{ value }`.

Specialized engines (password, OTP, number, file, mask, currency, date) compose the same resolve contract with domain controllers.

## Anatomy

Engine slots (`data-slot`):

`root` · `field` · `label` · `control` · `nativeInput` · `prefix` · `suffix` · `clear` · `loader`

React/Vue/CE adapters render the native `<input>` as the interactive control (root class + `nativeAttributes`). Compose [Field](/components/field) for label/description/error chrome.

**State attributes:** `data-disabled`, `data-readonly`, `data-invalid`, `data-filled`, `data-empty`, optional `data-size` / `data-variant`. Invalid ⇒ `aria-invalid="true"`; required ⇒ `aria-required="true"` when set via resolve.

## Props / attributes

### React `InputProps`

Omits native `value` / `defaultValue` / `onChange` / `size` in favor of Sometic value + string `size`. Extends `ResolveInputOptions` and remaining `InputHTMLAttributes`.

| Prop                                                                                   | Type                                                                                                                                                           | Default  | Description                             |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- |
| `type`                                                                                 | `"text" \| "search" \| "email" \| "password" \| "number" \| "tel" \| "url" \| "date" \| "datetime-local" \| "time" \| "month" \| "week" \| "file" \| "hidden"` | `"text"` | Native input type                       |
| `value`                                                                                | `string`                                                                                                                                                       | ,        | Controlled value                        |
| `defaultValue`                                                                         | `string`                                                                                                                                                       | ,        | Uncontrolled initial                    |
| `onValueChange`                                                                        | `(value: string) => void`                                                                                                                                      | ,        | High-level change                       |
| `disabled`                                                                             | `boolean`                                                                                                                                                      | `false`  | Disables input                          |
| `readonly`                                                                             | `boolean`                                                                                                                                                      | `false`  | Read-only                               |
| `required`                                                                             | `boolean`                                                                                                                                                      | `false`  | Required + ARIA                         |
| `invalid`                                                                              | `boolean`                                                                                                                                                      | `false`  | Invalid styling + `aria-invalid`        |
| `name`                                                                                 | `string`                                                                                                                                                       | ,        | Form name                               |
| `placeholder`                                                                          | `string`                                                                                                                                                       | ,        | Placeholder                             |
| `autocomplete`                                                                         | `string`                                                                                                                                                       | ,        | Autocomplete token                      |
| `inputMode`                                                                            | `string`                                                                                                                                                       | ,        | Virtual keyboard hint                   |
| `min` / `max` / `step`                                                                 | `string`                                                                                                                                                       | ,        | Constraint attrs                        |
| `multiple`                                                                             | `boolean`                                                                                                                                                      | ,        | Multi (file)                            |
| `accept`                                                                               | `string`                                                                                                                                                       | ,        | File accept                             |
| `fieldIds`                                                                             | `FieldIds`                                                                                                                                                     | ,        | Sets `id` + labelledby wiring           |
| `describedBy`                                                                          | `string`                                                                                                                                                       | ,        | `aria-describedby`                      |
| `size`                                                                                 | `string`                                                                                                                                                       | ,        | Theme size (`data-size`), not HTML size |
| `variant`                                                                              | `string`                                                                                                                                                       | ,        | `data-variant`                          |
| `unstyled` / `classes` / `styles` / `cssVariables` / `defaults` / `variants` / `merge` | styling                                                                                                                                                        | ,        | Shared styleable contract               |
| Native attrs                                                                           | remaining input HTML attrs                                                                                                                                     | ,        | Forwarded; `ref` supported              |

### Custom element (`sometic-input`)

Observed: `type`, `value`, `disabled`, `readonly`, `required`, `invalid`, `name`, `placeholder`, `shadow`.

### Vue

`modelValue` / `update:modelValue` (`v-model`) plus the same resolve options.

## Events / callbacks

| Surface        | Event               | Payload             |
| -------------- | ------------------- | ------------------- |
| React          | `onValueChange`     | `string`            |
| Vue            | `update:modelValue` | `string`            |
| Custom element | `value-change`      | `{ value: string }` |
| `bindInput`    | native `input`      | string value        |

Native `onChange` / `onInput` may still fire on React when you pass them through remaining HTML attrs; prefer `onValueChange` for Sometic-controlled state. Changes are ignored while `disabled` or `readonly` on the bind/controller path.

## Controlled vs uncontrolled

- **Controlled:** pass `value` (including `""`) and handle `onValueChange`.
- **Uncontrolled:** omit `value`, optionally set `defaultValue`. Changing `defaultValue` after mount does not re-seed.
- Vue: `v-model` is the controlled bridge.

## Form participation

Native `name` + value serialize into `FormData` / URL-encoded submit. Place inside a native `<form>`, [Form](/components/form), or `sometic-form`. Prefer Sometic validators over relying solely on browser constraint validation when using the forms engine (`noValidate`).

## Accessibility

- Associate a visible label via [Field](/components/field) or `fieldIds` / `htmlFor`.
- `invalid` sets `aria-invalid="true"`; `required` sets `aria-required="true"`.
- Use `describedBy` (or Field description/error ids) for helper and error text.
- Prefer specialized password/OTP/date components when those semantics matter.

## Styling

State attributes listed above. Map `classes` by input slots or pass `className` on React root (merged into root classes). CSS variables via `cssVariables`.

## Edge cases

- **Empty controlled string**: `value=""` is controlled empty, not uncontrolled.
- **`type="file"`**, prefer [File input](/components/file-input) for `File[]` value.
- **Disabled/readonly**, high-level value callbacks do not fire from bind.
- **SSR**, resolvers are import-safe; register custom elements in the browser only.
- **Dispose**, dispose controllers / unbind when tearing down long-lived vanilla trees.

## Performance notes

`resolveInput` is pure and cheap. Controllers hold one controllable string. Specialized inputs (mask/currency/date) add parsing cost only in those modules, import them via subpaths so the base input stays small (budget target ≤ 3 KB gzip for base DOM input).

## When to use / When not

**Use** for standard single-line text, email, search, url, and as the base for custom compositions.

**Do not use** for:

- Passwords with reveal, [Password input](/components/password-input)
- One-time codes, [OTP input](/components/otp-input)
- Numeric / file / date domain values, specialized inputs
- Multiline text, native `<textarea>`

## FAQ

**Controlled empty string vs uncontrolled?** Pass `value` (including `""`) for controlled. Use `defaultValue` when you omit `value`.

**Why both `type="password"` and PasswordInput?** PasswordInput adds reveal state and defaults `autocomplete` to `current-password`.

**SSR safe?** Resolvers do not touch browser globals at import time. Register custom elements only in the browser.

**Why isn’t this `@sometic/input`?** Engines live under `@sometic/dom` (and adapters). Import `@sometic/dom/input` or `@sometic/react/input`.

**Do native input events still fire?** Yes. High-level value events are additions, not replacements.

**How do Field ids connect?** Pass `fieldIds` from `createFieldIds` / Field so `id` and labelledby/describedby stay aligned.

**Can I use HTML `size`?** The Sometic `size` prop is a theme token (`data-size`). Use a native attribute only via carefully forwarded attrs if you truly need the HTML size attribute.

**File / number as strings?** Base Input keeps string values. Use FileInput / NumberInput for domain types.

## Related links

- [Field](/components/field)
- [Password input](/components/password-input)
- [Number input](/components/number-input)
- [Form](/components/form)
- [Forms](/forms/)
- [Styling slots](/concepts/styling-slots)
