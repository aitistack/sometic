# Button

Accessible native `<button>` with shared loading/disabled resolution, content slots, and unstyled styling hooks.

<PreviewButton />

## Usage

::: code-group

```tsx [React]
import { Button } from "@sometic/react/button";

export function Example() {
    return <Button onClick={() => {}}>Save</Button>;
}
```

```vue [Vue]
<script setup>
import { Button } from "@sometic/vue/button";
</script>

<template>
    <Button @click="() => {}">Save</Button>
</template>
```

```js [Vanilla]
import { bindButton } from "@sometic/dom/button";

const button = document.querySelector("button");
bindButton(button, {
    onPress() {},
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerButtonElements } from "@sometic/elements/button";
    registerButtonElements();
</script>

<sometic-button>Save</sometic-button>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.iife.js"></script>

<sometic-button>Save</sometic-button>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.1/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-button>Save</sometic-button>
```

:::

## How it works

1. **Engine (`@sometic/dom`)**: `resolveButton(options)` builds a view model: native `type`, `nativeDisabled` (forced when `loading`), `shouldIgnorePress`, root/slot class and style maps, and state attributes (`data-disabled`, `data-loading`, optional `data-size` / `data-variant`). `handleButtonPress` / `bindButton` gate clicks while disabled or loading.
2. **Adapters**: React (`Button` from `@sometic/react/button`) and Vue (`@sometic/vue/button`) call `resolveButton` each render and map slots (`prefix` / `content` / `suffix` / `loader`) onto a real `<button>`.
3. **DOM / custom element**: `sometic-button` (from `@sometic/elements/button`) hosts a light-DOM inner `<button>`, reflects observed attributes, and re-resolves on change. Optional `shadow` opts into an open shadow root.

Behavior stays in the engine; frameworks only bind props and events.

## Anatomy

| Part    | `data-slot` | Role                                               |
| ------- | ----------- | -------------------------------------------------- |
| Root    | `root`      | The `<button>` host                                |
| Prefix  | `prefix`    | Leading adornment (React `prefix` / Vue `#prefix`) |
| Content | `content`   | Label / children                                   |
| Suffix  | `suffix`    | Trailing adornment                                 |
| Loader  | `loader`    | Present while `loading` is true                    |

**State attributes on root** (from resolve): `data-disabled`, `data-loading`, optional `data-size`, `data-variant`. Loading also sets `aria-busy="true"`.

## Props / attributes

### React `ButtonProps`

Extends native `ButtonHTMLAttributes` except `type` / `disabled` / `prefix` are owned by the engine, plus `StyleableProps` for slots `root` \| `prefix` \| `content` \| `suffix` \| `loader`.

| Prop           | Type                              | Default    | Description                                   |
| -------------- | --------------------------------- | ---------- | --------------------------------------------- |
| `type`         | `"button" \| "submit" \| "reset"` | `"button"` | Native button type                            |
| `disabled`     | `boolean`                         | `false`    | Disables interaction                          |
| `loading`      | `boolean`                         | `false`    | Busy state; forces disabled press             |
| `name`         | `string`                          | ,          | Form association name                         |
| `value`        | `string`                          | ,          | Form association value                        |
| `form`         | `string`                          | ,          | Associated form id                            |
| `size`         | `string`                          | ,          | Reflected as `data-size`                      |
| `variant`      | `string`                          | ,          | Reflected as `data-variant`                   |
| `unstyled`     | `boolean`                         | `false`    | Skip default class/style resolution           |
| `classes`      | per-slot `ClassValue` map         | ,          | Slot class names                              |
| `styles`       | per-slot style map                | ,          | Slot inline styles                            |
| `cssVariables` | `Record<string, string>`          | ,          | CSS custom properties on root                 |
| `defaults`     | `{ className?, style? }`          | ,          | Styleable defaults                            |
| `variants`     | `{ className?, style? }`          | ,          | Styleable variants                            |
| `merge`        | `ClassMerger`                     | ,          | Custom class merge                            |
| `prefix`       | `ReactNode`                       | ,          | Leading slot                                  |
| `suffix`       | `ReactNode`                       | ,          | Trailing slot                                 |
| `children`     | `ReactNode`                       | ,          | Content slot                                  |
| Native attrs   | remaining button HTML attrs       | ,          | Forwarded to the `<button>` (`ref` supported) |

### Custom element (`sometic-button`)

Observed attributes: `type`, `disabled`, `loading`, `size`, `variant`, `shadow`. Children become the content slot. Light DOM is default.

### Vue

Same engine options as React; use `#prefix` / `#suffix` slots instead of props. Emits native `click` (ignored while disabled/loading via the same press gate).

## Events / callbacks

| Surface        | Event                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| React          | Native `onClick` (ignored while disabled/loading via `handleButtonPress`) |
| Vue            | `click`                                                                   |
| Custom element | Native `click` on the inner button                                        |
| DOM            | `bindButton(..., { onPress })`                                            |

There is no separate `onPress` on React/Vue. Use native click handlers.

## Controlled vs uncontrolled

Button has no value state. `disabled` / `loading` are always driven by props (or CE attributes). Toggle / async variants own pressed/pending state. See [Toggle button](/components/toggle-button) and [Async button](/components/async-button).

## Form participation

Native `<button>`: `type="submit"` / `"reset"`, plus `name`, `value`, and `form`, participate in HTML form submit exactly like a stock button. Loading disables press so double-submit is blocked at the control.

## Accessibility

- Always a real `<button>`, keyboard activation and form semantics stay native.
- `loading` ⇒ `aria-busy="true"` and `nativeDisabled`.
- Prefer visible text in the content slot; icon-only actions need [Icon button](/components/icon-button) (`aria-label` required).
- Do not replace with a `div` + `role="button"` unless you reimplement the full keyboard contract yourself.

## Styling

Unstyled beyond your `classes` / theme defaults. Useful selectors:

- `[data-slot="root"|"prefix"|"content"|"suffix"|"loader"]`
- `[data-disabled]`, `[data-loading]`
- `[data-size="…"]`, `[data-variant="…"]`

```tsx
<Button unstyled classes={{ root: "btn", content: "btn__label", loader: "btn__spinner" }} loading>
    Saving
</Button>
```

## Edge cases

- **`disabled` + `loading`**, both force ignored presses; loading alone still disables.
- **Re-entrancy**, rapid clicks while loading are ignored; AsyncButton also aborts prior work.
- **SSR**: `resolveButton` is pure; register `sometic-button` only in the browser.
- **Multi-instance**, no module singletons; each resolve/bind is independent.
- **Empty children**, still a focusable button; ensure an accessible name (text or `aria-label`).

## Performance notes

Resolve is a pure function (no observers). Adapters re-resolve on prop change only. Prefer `@sometic/react/button` (or Vue/elements subpaths) over barrel imports so unused icon/toggle/async code tree-shakes away. Binding one listener in `bindButton` avoids duplicating press-gate logic in app code.

## When to use / When not

**Use** for primary actions, form submit/reset, and any control that must behave like a native button across frameworks.

**Do not use** for:

- Navigation that should change the URL, use a link.
- Icon-only chrome, [Icon button](/components/icon-button).
- Long-running abortable work, [Async button](/components/async-button).
- Pressed on/off chrome, [Toggle button](/components/toggle-button).

## FAQ

**Does `loading` disable the button?** Yes. Loading implies disabled press handling and sets `nativeDisabled`.

**Can I use `type="submit"` inside a form?** Yes. Native `type`, `name`, `value`, and `form` pass through.

**Why slots instead of wrapping children myself?** Shared engines and custom elements need stable `data-slot` parts so CSS and loaders stay consistent across adapters.

**Is there a visual theme baked in?** No. Pair with `@sometic/theme` or your CSS via `classes`, `styles`, and `cssVariables`.

**Light DOM or shadow?** Light DOM is the default so page CSS reaches the control. Add `shadow` on the CE for isolation.

**Does React forward refs?** Yes, to the underlying `<button>`.

**How do I ignore clicks while loading without checking myself?** Use the component/`bindButton`; they call `handleButtonPress` for you.

**Bundle tip?** Import from `@sometic/react/button` (or matching subpath), not a mega barrel.

## Related links

- [Icon button](/components/icon-button)
- [Button group](/components/button-group)
- [Toggle button](/components/toggle-button)
- [Async button](/components/async-button)
- [Styling slots](/concepts/styling-slots)
- [State attributes](/concepts/state-attributes)
