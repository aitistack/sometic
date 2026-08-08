# Toggle button

Button that toggles a pressed state with `aria-pressed` and `data-pressed`, supporting controlled and uncontrolled usage. Shares Button slots, loading/disabled press gating, and form association props.

<PreviewToggleButton />

## Usage

::: code-group

```tsx [JS]
import { useState } from "react";
import { ToggleButton } from "@sometic/react/button";

export function Example() {
    const [pressed, setPressed] = useState(false);
    return (
        <ToggleButton pressed={pressed} onPressedChange={setPressed}>
            Bold
        </ToggleButton>
    );
}
```

```tsx [TS]
import { useState } from "react";
import { ToggleButton } from "@sometic/react/button";

export function Example(): JSX.Element {
    const [pressed, setPressed] = useState(false);
    return (
        <ToggleButton pressed={pressed} onPressedChange={setPressed}>
            Bold
        </ToggleButton>
    );
}
```

```html [Vanilla]
<script type="module">
    import { registerButtonElements } from "@sometic/elements/button";
    registerButtonElements();
</script>

<sometic-toggle-button>Bold</sometic-toggle-button>
```

:::

## Vue

```vue
<script setup>
import { ref } from "vue";
import { ToggleButton } from "@sometic/vue/button";

const pressed = ref(false);
</script>

<template>
    <ToggleButton v-model:pressed="pressed">Bold</ToggleButton>
</template>
```

## How it works

1. **Engine**: `createToggleButtonController` / `resolveToggleButton` extend button resolve with controllable `pressed` → `aria-pressed` + `data-pressed`.
2. **Adapters**: React/Vue toggle on click (when not disabled/loading) via `handleButtonPress`, then call `onPressedChange` / emit `update:pressed`.
3. **Custom element**: `sometic-toggle-button` observes `pressed`, `disabled`, `shadow`.

## Anatomy

Same button slots (`root`, `prefix`, `content`, `suffix`, `loader`) plus pressed state attrs on root.

| Part    | `data-slot` | Role                            |
| ------- | ----------- | ------------------------------- |
| Root    | `root`      | Native `<button>`               |
| Prefix  | `prefix`    | Leading adornment               |
| Content | `content`   | Label / children                |
| Suffix  | `suffix`    | Trailing adornment              |
| Loader  | `loader`    | Present while `loading` is true |

## Props / attributes

### React `ToggleButtonProps`

`Omit<ButtonProps, "aria-pressed">` plus:

| Prop              | Type                         | Default | Description          |
| ----------------- | ---------------------------- | ------- | -------------------- |
| `pressed`         | `boolean`                    |         | Controlled pressed   |
| `defaultPressed`  | `boolean`                    | `false` | Uncontrolled initial |
| `onPressedChange` | `(pressed: boolean) => void` |         | Change callback      |

All other Button props apply (`type`, `disabled`, `loading`, `name`, `value`, `form`, size/variant, styling, slots, native attrs).

### Vue

Props: `pressed`, `defaultPressed`, `disabled` (and related button props). Emits: `update:pressed`, `click`.

### Custom element (`sometic-toggle-button`)

Observed: `pressed`, `disabled`, `shadow`.

## Events / callbacks

| Surface        | Event                                       |
| -------------- | ------------------------------------------- |
| React          | `onPressedChange(boolean)` (+ native click) |
| Vue            | `update:pressed`, `click`                   |
| Custom element | pressed attribute reflection + click        |

Presses are ignored while disabled or loading (same gate as Button).

## Controlled vs uncontrolled

Pass `pressed` for controlled; omit and use `defaultPressed` for uncontrolled. Controlled without `onPressedChange` will not flip UI.

## Form participation

Still a `<button>`. Use `type` / `name` / `value` / `form` like Button. Pressed state is ARIA/UI chrome, not a separate form field unless you sync it yourself (prefer Checkbox/Switch for boolean form fields).

## Accessibility

| Concern        | Guidance                                                               |
| -------------- | ---------------------------------------------------------------------- |
| Pressed        | `aria-pressed` reflects state; `data-pressed` for CSS                  |
| Keyboard       | Space / Enter activate like a native button                            |
| Name           | Visible text or `aria-label` (required for icon-only toggles)          |
| Not a checkbox | Use [Checkbox](/components/checkbox) / [Switch](/components/switch)    |
| Groups         | Layout via [Button group](/components/button-group); exclusivity yours |

## Styling

`[data-pressed]`, plus Button state attrs (`data-disabled`, `data-loading`, size/variant). Slot selectors match Button.

```tsx
<ToggleButton
    unstyled
    classes={{ root: "toggle", content: "toggle__label" }}
    pressed={pressed}
    onPressedChange={setPressed}
>
    Bold
</ToggleButton>
```

## Edge cases

- **Disabled / loading**: ignore toggles; loading still sets `aria-busy` / native disabled.
- **Controlled without handler**: expected no flip.
- **SSR**: resolve is pure; register CE in the browser.
- **Exclusive toolbars**: not built-in; manage one pressed among siblings yourself.
- **Multi-instance**: no module singletons.

## Performance notes

Controller is optional for vanilla; React uses local state + resolve (cheap). Prefer button subpath imports for tree-shaking.

## When to use / When not

**Use** for toolbar pressed chrome (bold/italic, view modes).

**Do not use** for:

- Form booleans (Checkbox / Switch)
- Abortable async work ([Async button](/components/async-button))
- Navigation (use a link)

## FAQ

**Pressed vs checked?** Pressed is button chrome; checked is form input semantics.

**Can it sit in a ButtonGroup?** Yes for layout; exclusivity is your responsibility.

**Loading + pressed?** Loading disables interaction; pressed attrs can still display.

**CE event?** Prefer attribute / `pressed` property sync; listen for clicks if needed.

**Icon-only toggle?** Provide a non-empty `aria-label`.

**Vue `v-model`?** `v-model:pressed`.

**Does React forward refs?** Yes, to the underlying `<button>`.

**Submit type?** Supported like Button; pressed is not submitted as a form field by itself.

**Bundle tip?** Import `@sometic/react/button` (or Vue / elements matching subpaths).

## Related links

- [Button](/components/button)
- [Icon button](/components/icon-button)
- [Button group](/components/button-group)
- [Checkbox](/components/checkbox)
- [Switch](/components/switch)
- [Async button](/components/async-button)
