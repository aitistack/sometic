# Spinner

Polite loading status indicator (`role="status"`, `aria-live="polite"`). Unstyled; you own the visual spin.

<PreviewSpinner />

## Usage

::: code-group

```tsx [JS]
import { Spinner } from "@sometic/react/structure";

export function Example() {
    return <Spinner label="Loading results" />;
}
```

```tsx [TS]
import { Spinner } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return <Spinner label="Loading results" />;
}
```

```html [Vanilla]
<script type="module">
    import "@sometic/elements/structure";
</script>

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

No Vue `Spinner` component. `@sometic/vue/structure` re-exports `resolveSpinner`. Prefer React, CE, or resolve.

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

**Vue component?** Not shipped. React + Elements primary.

**Does React forward native attrs?** Yes, onto the root div.

**Visual spin included?** No — behavior/ARIA only; style the spin yourself.

## Related links

- [Progress](/components/progress)
- [Skeleton](/components/skeleton)
- [Styling slots](/concepts/styling-slots)
