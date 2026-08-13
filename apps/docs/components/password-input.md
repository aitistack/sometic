# Password input

Password field with controllable value and show/hide reveal state. Reveal flips the native `type` between `password` and `text`. Adapters render a reveal toggle button with `aria-pressed` and “Show password” / “Hide password” labels. Defaults favor `autocomplete="current-password"` when unset.

<PreviewPassword />

## Usage

::: code-group

```tsx [React]
import { useState } from "react";
import { PasswordInput } from "@sometic/react/input";

export function Example() {
    const [value, setValue] = useState("");
    const [revealed, setRevealed] = useState(false);
    return (
        <PasswordInput
            value={value}
            onValueChange={setValue}
            revealed={revealed}
            onRevealedChange={setRevealed}
            autocomplete="current-password"
        />
    );
}
```

```vue [Vue]
<script setup>
import { ref } from "vue";
import { PasswordInput } from "@sometic/vue/input";

const value = ref("");
const revealed = ref(false);
</script>

<template>
    <PasswordInput v-model="value" v-model:revealed="revealed" autocomplete="current-password" />
</template>
```

```js [Vanilla]
import { createPasswordInputController } from "@sometic/dom/input-password";

const input = document.querySelector("input");
const controller = createPasswordInputController({
    defaultValue: "",
    defaultRevealed: false,
    onValueChange(next) {
        console.log(next);
    },
});

const apply = () => {
    const view = controller.resolve();
    input.type = view.nativeAttributes.type;
    input.value = view.value;
};
apply();

input.addEventListener("input", () => {
    controller.value.set(input.value);
});
document.querySelector("[data-reveal]").addEventListener("click", () => {
    controller.toggleRevealed();
    apply();
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerInputElements } from "@sometic/elements/input";
    registerInputElements();
</script>

<sometic-password-input autocomplete="current-password"></sometic-password-input>
```

```html [CDN]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-password-input autocomplete="current-password"></sometic-password-input>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { PasswordInput } from "@sometic/vue/input";

const value = ref("");
const revealed = ref(false);
</script>

<template>
    <PasswordInput v-model="value" v-model:revealed="revealed" autocomplete="current-password" />
</template>
```

## How it works

1. **Engine (`@sometic/dom/input-password`)**: `resolvePasswordInput` sets `type` to `"text"` when `revealed`, otherwise `"password"`, and defaults `autocomplete` to `"current-password"`. `createPasswordInputController` owns independent controllable `value` and `revealed` state plus `toggleRevealed`.
2. **Adapters**: React supports uncontrolled/controlled value and reveal (`revealed` / `defaultRevealed` / `onRevealedChange`) and renders a wrapper `div.sometic-password` with a `type="button"` toggle (`data-reveal`, `aria-pressed`). Vue uses `modelValue` + `revealed` with `update:modelValue` / `update:revealed` (`v-model` and `v-model:revealed`).
3. **Custom element**: `sometic-password-input` observes `value`, `revealed`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`; toggles the `revealed` attribute on click; dispatches `value-change` and `revealed-change`; refocuses the input after toggle.

## Anatomy

| Part          | Role                                                |
| ------------- | --------------------------------------------------- |
| Wrapper       | `div.sometic-password` (`data-revealed` when shown) |
| Native input  | Password or text depending on reveal                |
| Reveal button | `data-reveal`, `aria-pressed`, Show/Hide label      |

State attributes follow [Input](/components/input) on the resolved field.

## Props / attributes

### React `PasswordInputProps`

`Omit<InputProps, "type">` plus:

| Prop                                | Type                          | Default                           | Description                   |
| ----------------------------------- | ----------------------------- | --------------------------------- | ----------------------------- |
| `revealed`                          | `boolean`                     | ,                                 | Controlled reveal             |
| `defaultRevealed`                   | `boolean`                     | `false`                           | Uncontrolled reveal seed      |
| `onRevealedChange`                  | `(revealed: boolean) => void` | ,                                 | Reveal callback               |
| `value`                             | `string`                      | ,                                 | Controlled password string    |
| `defaultValue`                      | `string`                      | ,                                 | Uncontrolled initial          |
| `onValueChange`                     | `(value: string) => void`     | ,                                 | Value callback                |
| `autocomplete`                      | `string`                      | engine default `current-password` | Override for signup/login     |
| `disabled` / `readonly` / `invalid` | `boolean`                     | ,                                 | State + ARIA                  |
| styling props                       | from Input                    | ,                                 | `unstyled`, `classes`, …      |
| Native attrs                        | remaining input HTML attrs    | ,                                 | Forwarded; `ref` on the input |

### Vue

`modelValue`, `revealed` (default `false`), `disabled`, `readonly`, `invalid`. Emits `update:modelValue`, `update:revealed`.

### Custom element (`sometic-password-input`)

Observed: `value`, `revealed`, `disabled`, `readonly`, `invalid`, `placeholder`, `shadow`. Events: `value-change` → `{ value }`, `revealed-change` → `{ revealed }`.

## Events / callbacks

| Surface        | Value event         | Reveal event       |
| -------------- | ------------------- | ------------------ |
| React          | `onValueChange`     | `onRevealedChange` |
| Vue            | `update:modelValue` | `update:revealed`  |
| Custom element | `value-change`      | `revealed-change`  |

Value changes ignored while `disabled` or `readonly`. Reveal toggle is disabled when `disabled`.

## Controlled vs uncontrolled

Value and reveal are **independently** controllable:

- Controlled value: `value` + `onValueChange`
- Uncontrolled value: `defaultValue`
- Controlled reveal: `revealed` + `onRevealedChange` (Vue: `v-model:revealed`)
- Uncontrolled reveal: `defaultRevealed` / omit `revealed` (React); Vue `revealed` prop defaults false and is parent-driven via `v-model:revealed`

## Form participation

Native password input with `name`; password managers and autofill keep working. Prefer PasswordInput over `Input type="password"` when you need reveal UX. Set `autocomplete="new-password"` for signup and `"current-password"` for login explicitly when both appear on one page.

## Accessibility

- Reveal toggle always has an accessible name (“Show password” / “Hide password”) and `aria-pressed`.
- Keyboard: Tab to input, Tab to toggle, Enter/Space activates the button; typing stays native.
- Associate label via [Field](/components/field).
- Do not disable paste unless a documented security policy requires it.
- Revealed `true` shows plaintext; avoid accidental screen-share leakage in sensitive flows.

## Styling

Same input state attrs; style the reveal control via `[data-reveal]` / `.sometic-password` / `[data-revealed]`:

```tsx
<PasswordInput unstyled classes={{ root: "pw" }} autocomplete="new-password" />
```

## Edge cases

- **Revealed plaintext**, treat as sensitive UI state, not just a cosmetic toggle.
- **Empty controlled value**, `value=""` is valid.
- **SSR**, resolve is pure; register CE in the browser.
- **Autocomplete defaults**, engine defaults to `current-password`; override for account creation.
- **Hiding the toggle**, use base Input `type="password"` if you do not want reveal UX, or carefully style the button while keeping an accessible reveal path when offered.

## Performance notes

Thin layer over input resolve plus one button listener. Negligible extra cost versus base Input.

## When to use / When not

**Use** for login/signup password fields that need show/hide.

**Do not use** for:

- One-time codes, [OTP input](/components/otp-input).
- Generic text, [Input](/components/input).
- PINs that should stay permanently masked without reveal (use Input `type="password"` or OTP depending on length/autofill needs).

## FAQ

**Default autocomplete?** Engine defaults to `current-password`. Pass `new-password` for signup.

**Why not base Input?** Reveal state, toggle a11y, and password autocomplete defaults.

**Controlled reveal?** React: `revealed` + `onRevealedChange`. Vue: `v-model:revealed`. CE: `revealed` attribute + `revealed-change`.

**Does the toggle submit forms?** No. It is `type="button"`.

**Ref forwarding?** React `ref` targets the `<input>`, not the wrapper.

**Can I hide the toggle?** Prefer Input `type="password"` if you do not want reveal. If you keep PasswordInput, do not remove accessible naming from a visible toggle.

**Form + PasswordInput?** Yes; bind value through Form / `useFormField`.

**Disabled reveal?** When `disabled` is set, the toggle is disabled too.

**Light DOM or shadow?** Light DOM default; `shadow` on the CE for isolation.

**Bundle tip?** Import from `@sometic/react/input` or `@sometic/dom/input-password`.

## Related links

- [Input](/components/input)
- [OTP input](/components/otp-input)
- [Field](/components/field)
- [Form](/components/form)
- [Styling slots](/concepts/styling-slots)
