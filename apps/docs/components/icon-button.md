# Icon button

Icon-only native `<button>` that **requires** a non-empty `aria-label`. Shares Button loading/disabled press gating and styling hooks, without relying on visible text for the accessible name.

<PreviewIconButton />

## Usage

::: code-group

```tsx [JS]
import { IconButton } from "@sometic/react/button";

export function Example() {
    return (
        <IconButton aria-label="Search" onClick={() => {}}>
            <SearchIcon aria-hidden="true" />
        </IconButton>
    );
}
```

```tsx [TS]
import { IconButton } from "@sometic/react/button";

export function Example(): JSX.Element {
    return (
        <IconButton aria-label="Search" onClick={() => {}}>
            <SearchIcon aria-hidden="true" />
        </IconButton>
    );
}
```

```html [Vanilla]
<script type="module">
    import { registerButtonElements } from "@sometic/elements/button";
    registerButtonElements();
</script>

<sometic-icon-button aria-label="Search">
    <!-- icon markup -->
</sometic-icon-button>
```

:::

## Vue

```vue
<script setup>
import { IconButton } from "@sometic/vue/button";
</script>

<template>
    <IconButton aria-label="Search" @click="() => {}">
        <SearchIcon aria-hidden="true" />
    </IconButton>
</template>
```

> Vue declares the required label as the `ariaLabel` prop (mapped to `aria-label` on resolve). React and the custom element use the `aria-label` attribute / prop name.

## How it works

1. **Engine (`@sometic/dom/icon-button`)**: `resolveIconButton` requires `"aria-label": string`, trims it, and **throws** if empty. It then delegates to `resolveButton` and merges the trimmed label into root attributes.
2. **Adapters**: React `IconButton` is `Omit<ButtonProps, "aria-label"> & { "aria-label": string }` and calls `resolveIconButton` each render. Vue `IconButton` takes required `ariaLabel` plus `disabled`, emits gated `click`. Both put the icon in default children / slot.
3. **Custom element**: `sometic-icon-button` (from `@sometic/elements/button`) hosts a light-DOM inner `<button>`, observes `aria-label`, `disabled`, `shadow`, and re-resolves on change. Click uses the same `handleButtonPress` gate as Button.

Behavior stays in the engine; frameworks only bind props, slots, and events.

## Anatomy

Same parts as [Button](/components/button) when you use full Button slots. React/Vue IconButton render a single `<button>` with children as content:

| Part    | Role                                              |
| ------- | ------------------------------------------------- |
| Root    | Native `<button>` with `aria-label`               |
| Content | Icon / decorative children (prefer `aria-hidden`) |

**State attributes on root** (from Button resolve): `data-disabled`, `data-loading`, optional `data-size` / `data-variant`. Loading also sets `aria-busy="true"`.

## Props / attributes

### React `IconButtonProps`

`Omit<ButtonProps, "aria-label"> & { "aria-label": string }`.

| Prop           | Type                              | Default    | Description                         |
| -------------- | --------------------------------- | ---------- | ----------------------------------- |
| `aria-label`   | `string`                          | required   | Accessible name (non-empty)         |
| `type`         | `"button" \| "submit" \| "reset"` | `"button"` | Native button type                  |
| `disabled`     | `boolean`                         | `false`    | Disables interaction                |
| `loading`      | `boolean`                         | `false`    | Busy; forces disabled press         |
| `name`         | `string`                          | ,          | Form association name               |
| `value`        | `string`                          | ,          | Form association value              |
| `form`         | `string`                          | ,          | Associated form id                  |
| `size`         | `string`                          | ,          | `data-size`                         |
| `variant`      | `string`                          | ,          | `data-variant`                      |
| `unstyled`     | `boolean`                         | `false`    | Skip default class/style resolution |
| `classes`      | per-slot map                      | ,          | Slot class names (Button slots)     |
| `styles`       | per-slot map                      | ,          | Slot inline styles                  |
| `cssVariables` | `Record<string, string>`          | ,          | CSS custom properties on root       |
| `children`     | `ReactNode`                       | ,          | Icon / content                      |
| Native attrs   | remaining button HTML attrs       | ,          | Forwarded; `ref` supported          |

### Vue

Required `ariaLabel: string`, optional `disabled`. Default slot is the icon. Emits `click` (ignored while disabled via `handleButtonPress`). The Vue IconButton prop surface is thinner than React (no first-class `loading` / styling props); pass additional native attrs carefully or use React/CE when you need the full Button option set.

### Custom element (`sometic-icon-button`)

Observed attributes: `aria-label`, `disabled`, `shadow`. Children move into the inner button. Light DOM is default; `shadow` opts into an open shadow root.

## Events / callbacks

| Surface        | Event                                                              |
| -------------- | ------------------------------------------------------------------ |
| React          | Native `onClick` (gated while disabled/loading)                    |
| Vue            | `click`                                                            |
| Custom element | Native `click` on the inner button (gated via `handleButtonPress`) |
| DOM            | `bindButton(..., { onPress })` after resolving an icon button      |

There is no separate `onPress` on React/Vue. Use native click handlers.

## Controlled vs uncontrolled

Icon button has no value state. `disabled` / `loading` are always driven by props (or CE attributes).

## Form participation

Native `<button>`: `type="submit"` / `"reset"`, plus `name`, `value`, and `form`, participate like a stock button. Loading disables press so double-submit is blocked at the control.

## Accessibility

- Always a real `<button>`; keyboard activation (Enter / Space) stays native.
- `aria-label` is mandatory in TypeScript and enforced at runtime by `resolveIconButton` (empty throws).
- Keep the label non-empty and descriptive of the action (“Search”, “Close dialog”), not “icon”.
- Prefer decorative icons with `aria-hidden="true"` (or `role="presentation"`) so the name is not duplicated by graphic text.
- `loading` ⇒ `aria-busy="true"` and `nativeDisabled`.
- Do not rely on `title` alone for the accessible name.
- For visible text labels, prefer [Button](/components/button). For pressed on/off chrome, [Toggle button](/components/toggle-button).

## Styling

Unstyled beyond your `classes` / theme defaults. Useful selectors:

- `[data-disabled]`, `[data-loading]`
- `[data-size="…"]`, `[data-variant="…"]`
- CE host vs inner button depending on Light vs Shadow DOM

```tsx
<IconButton aria-label="Close" unstyled classes={{ root: "icon-btn" }} loading={pending}>
    <CloseIcon aria-hidden="true" />
</IconButton>
```

## Edge cases

- **Empty `aria-label`**, resolve throws; do not cast the type away.
- **CE fallback label**, if the attribute is missing/empty at render, the element may pass a temporary `"button"` placeholder into resolve to avoid throw during mount; always set a real `aria-label` before exposing the control.
- **`disabled` + `loading`**, both force ignored presses; loading alone still disables.
- **Re-entrancy**, rapid clicks while loading are ignored.
- **SSR**: resolve is pure; register `sometic-icon-button` only in the browser.
- **Multi-instance**, no module singletons; each resolve/bind is independent.
- **Children without visuals**, still focusable; the accessible name must come from `aria-label`.

## Performance notes

Thin wrapper over Button resolve: one required attribute check, then the same pure `resolveButton` path. Prefer `@sometic/react/button` (or Vue/elements subpaths) so unused async/toggle code tree-shakes away.

## When to use / When not

**Use** for toolbar, header, and chrome actions that have no visible text label.

**Do not use** for:

- Actions with a visible text label, [Button](/components/button).
- Long-running abortable work, [Async button](/components/async-button).
- Pressed on/off chrome, [Toggle button](/components/toggle-button).
- Navigation that should change the URL, use a link.

## FAQ

**Why is `aria-label` required?** Icon-only controls have no accessible name from visible text. The engine refuses empty labels at resolve time.

**Can I use `aria-labelledby` instead?** You can pass native labelled-by attrs on React, but the prop contract still requires `aria-label`. Prefer Button with visible text when a visible name exists.

**Vue uses `ariaLabel`?** Yes. The Vue prop is `ariaLabel`; resolve still receives `"aria-label"`.

**Does `loading` disable the button?** On React, yes (same as Button: `nativeDisabled`, `aria-busy`, ignored presses). Vue IconButton currently exposes `disabled` rather than a dedicated `loading` prop.

**Can I use `type="submit"`?** Yes on React via Button props. Pair with `name` / `value` / `form` as needed.

**Does React forward refs?** Yes, to the underlying `<button>`.

**Light DOM or shadow?** Light DOM is the default so page CSS reaches the control. Add `shadow` on the CE for isolation.

**Bundle tip?** Import from `@sometic/react/button` (or matching Vue/elements subpath), not a mega barrel.

**Is there a visual theme baked in?** No. Pair with `@sometic/theme` or your CSS via `classes`, `styles`, and `cssVariables`.

**How do I ignore clicks while loading without checking myself?** Use the component; it calls `handleButtonPress` for you.

## Related links

- [Button](/components/button)
- [Button group](/components/button-group)
- [Toggle button](/components/toggle-button)
- [Async button](/components/async-button)
- [Styling slots](/concepts/styling-slots)
- [State attributes](/concepts/state-attributes)
