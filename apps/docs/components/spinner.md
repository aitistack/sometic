# Spinner

Polite loading status indicator (`role="status"`, `aria-live="polite"`). Unstyled; you own the visual spin.

<PreviewSpinner />

## Usage

::: code-group

```tsx [React]
import { Spinner } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return <Spinner label="Loading results" />;
}
```

```vue [Vue]
<script setup>
import { Spinner } from "@sometic/vue/structure";
</script>

<template>
    <Spinner label="Loading results" />
</template>
```

```js [Vanilla]
import { resolveSpinner } from "@sometic/dom/spinner";

const el = document.querySelector("[data-spinner]");
const view = resolveSpinner({ label: "Loading results" });
for (const [key, attr] of Object.entries(view.attributes)) {
    el.setAttribute(key, attr);
}
```

```html [Custom Elements (Web Components)]
<script type="module">
    import "@sometic/elements/structure";
</script>

<sometic-spinner label="Loading results"></sometic-spinner>
```

```html [CDN]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.iife.js"></script>
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-spinner label="Loading results"></sometic-spinner>
```

:::

## How it works

`resolveSpinner` is pure. React and `sometic-spinner` apply `role="status"`, `aria-live="polite"`, and `aria-label`.

## Anatomy

| Part | Role / attrs                                        |
| ---- | --------------------------------------------------- |
| Root | `role="status"`, `aria-live="polite"`, `aria-label` |

## Props / attributes

### React `SpinnerProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the root.

| Prop         | Type                     | Default     | Description           |
| ------------ | ------------------------ | ----------- | --------------------- |
| `label`      | `string`                 | `"Loading"` | → `aria-label`        |
| Native attrs | remaining div HTML attrs | —           | Forwarded to the root |

### Vue

`Spinner` from `@sometic/vue/structure`. Prop: `label` (maps to `aria-label`).

### Custom element (`sometic-spinner`)

Observed attributes: `label`. Default label when omitted matches the engine (`"Loading"`).

## Events / callbacks

None beyond native/forwarded HTML handlers.

## Accessibility

- Keep `aria-live="polite"` unless you intentionally need assertive announcements elsewhere.
- Prefer Progress for determinate percentages.

## Styling

Target `[role="status"][data-slot="root"]`. Add your own CSS animation.

## When to use / When not

**Use** for brief busy states.

**Do not use** as the only indication of a multi-step upload ([Progress](/components/progress)).

## FAQ

**Default label?** `"Loading"`.

**Vue component?** Yes. `@sometic/vue/structure`.

**Does React forward native attrs?** Yes, onto the root div.

**Visual spin included?** No — behavior/ARIA only; style the spin yourself.

## Related links

- [Progress](/components/progress)
- [Skeleton](/components/skeleton)
- [Styling slots](/concepts/styling-slots)
