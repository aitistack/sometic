# Button group

Layout and semantics wrapper (`role="group"`) for related buttons that share orientation and optional disabled state attributes. Children remain ordinary buttons; the group does not invent item APIs or exclusivity.

<PreviewButtonGroup />

## Usage

::: code-group

```tsx [React]
import { Button, ButtonGroup } from "@sometic/react/button";

export function Example() {
    return (
        <ButtonGroup aria-label="Export" orientation="horizontal">
            <Button type="button">CSV</Button>
            <Button type="button">JSON</Button>
        </ButtonGroup>
    );
}
```

```vue [Vue]
<script setup>
import { Button, ButtonGroup } from "@sometic/vue/button";
</script>

<template>
    <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
    </ButtonGroup>
</template>
```

```js [Vanilla]
import { resolveButtonGroup } from "@sometic/dom/button-group";

const root = document.querySelector("[data-button-group]");
const view = resolveButtonGroup({});
for (const [key, value] of Object.entries(view.attributes)) {
    root.setAttribute(key, value);
}
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerButtonElements } from "@sometic/elements/button";
    registerButtonElements();
</script>

<sometic-button-group orientation="horizontal" aria-label="Export">
    <sometic-button type="button">CSV</sometic-button>
    <sometic-button type="button">JSON</sometic-button>
</sometic-button-group>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.iife.js"></script>

<sometic-button-group orientation="horizontal" aria-label="Export">
    <sometic-button type="button">CSV</sometic-button>
    <sometic-button type="button">JSON</sometic-button>
</sometic-button-group>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.5/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-button-group orientation="horizontal" aria-label="Export">
    <sometic-button type="button">CSV</sometic-button>
    <sometic-button type="button">JSON</sometic-button>
</sometic-button-group>
```

:::

## Vue

```vue
<script setup>
import { Button, ButtonGroup } from "@sometic/vue/button";
</script>

<template>
    <ButtonGroup aria-label="Export" orientation="horizontal">
        <Button type="button">CSV</Button>
        <Button type="button">JSON</Button>
    </ButtonGroup>
</template>
```

## How it works

1. **Engine (`resolveButtonGroup`)**: sets `role="group"`, `data-slot="root"`, `data-orientation`, optional `data-disabled`, plus styleable root maps.
2. **Adapters**: React/Vue render a host `div` with resolved class/style/attributes and your button children.
3. **Custom element**: `sometic-button-group` observes `orientation`, `disabled`.

No press gating or focus management lives on the group; children keep Button / Toggle / Async behavior.

## Anatomy

| Part | `data-slot` | Role                        |
| ---- | ----------- | --------------------------- |
| Root | `root`      | Group host (`role="group"`) |

Children are your buttons. The group does not invent button items or slots per child.

## Props / attributes

### React `ButtonGroupProps`

From `ResolveButtonGroupOptions` plus `children`, `className`, `style`.

| Prop                                                                                   | Type                         | Default        | Description                                                             |
| -------------------------------------------------------------------------------------- | ---------------------------- | -------------- | ----------------------------------------------------------------------- |
| `orientation`                                                                          | `"horizontal" \| "vertical"` | `"horizontal"` | Reflected as `data-orientation`                                         |
| `disabled`                                                                             | `boolean`                    | `false`        | Group disabled attr (style/ARIA cue; still disable each child for real) |
| `unstyled` / `classes` / `styles` / `cssVariables` / `defaults` / `variants` / `merge` | styling                      |                | Styleable (`root`)                                                      |
| `children`                                                                             | `ReactNode`                  |                | Buttons                                                                 |
| `className` / `style`                                                                  |                              |                | Host extras                                                             |
| `aria-label` / `aria-labelledby`                                                       | string                       |                | **Provide a group name**                                                |

### Vue

Props: `orientation`, `disabled`. Default slot for children. Pass `aria-label` via fallthrough attrs.

### Custom element (`sometic-button-group`)

Observed: `orientation`, `disabled`.

## Events / callbacks

None at the group level. Listen on child buttons (`click`, `onPressedChange`, async completion, …).

## Controlled vs uncontrolled

N/A for the group. Child Toggle / Async buttons keep their own state contracts.

## Form participation

The group is not a form control. Child `type="submit"` / `"reset"` buttons still participate like native buttons.

## Accessibility

| Concern       | Guidance                                                               |
| ------------- | ---------------------------------------------------------------------- |
| Name          | Always name the group (`aria-label` or `aria-labelledby`)              |
| Role          | `role="group"`, not radiogroup / toolbar unless you add those yourself |
| Keyboard      | Tab / Shift+Tab move between focusable children; Space/Enter activate  |
| Disabled      | Disable each child when the group is logically disabled                |
| Toggle groups | Exclusivity is app-owned; this is not a radiogroup                     |

## Styling

Target:

- `[data-slot="root"]`
- `[data-orientation="horizontal"|"vertical"]`
- `[data-disabled]`

```tsx
<ButtonGroup unstyled classes={{ root: "btn-group" }} orientation="vertical" aria-label="Views">
    …
</ButtonGroup>
```

## Edge cases

- **Empty group**: still expose a name if rendered for AT consistency.
- **Nested groups**: avoid unless structure truly needs it; names can collide for users.
- **`disabled` alone**: does not automatically disable descendant presses; set `disabled` on each child.
- **SSR**: resolve is pure; register CE in the browser.
- **Mixed children**: Button + ToggleButton is fine for layout; do not assume toolbar semantics.

## Performance notes

Pure resolve wrapper; negligible cost. Prefer `@sometic/react/button` subpath imports so unused async/toggle code tree-shakes.

## When to use / When not

**Use** to group related actions visually and for assistive technology.

**Do not use** as:

- A select / radio substitute
- A [Menu](/components/menu)
- A toolbar pattern unless you add the correct roles and keyboard model yourself

## FAQ

**Does `disabled` disable children automatically?** Resolve sets group attrs. Disable each `Button` / child for real interaction locking.

**Horizontal vs vertical?** `orientation` only affects `data-orientation` for CSS and AT context.

**Is this a toggle group?** No. Use multiple [Toggle button](/components/toggle-button)s with your own exclusivity logic.

**Why `role="group"`?** Native grouping for related controls without claiming radiogroup or toolbar semantics.

**Can submit buttons live inside?** Yes. Form participation is per child button.

**CE tag?** `sometic-button-group`.

**Need arrow-key roving tabindex?** Not built in. Implement yourself or wait for deferred toolbar patterns.

**Refs?** Host is a `div`; child buttons still forward refs on React Button adapters.

**Bundle tip?** Import from `@sometic/react/button` (or Vue / elements matching subpaths).

## Related links

- [Button](/components/button)
- [Toggle button](/components/toggle-button)
- [Icon button](/components/icon-button)
- [Async button](/components/async-button)
- [Styling slots](/concepts/styling-slots)
- [State attributes](/concepts/state-attributes)
