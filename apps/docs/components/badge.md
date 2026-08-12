# Badge

Inline tone badge with `data-tone`. Pure resolve; no interaction state.

<PreviewBadge />

## Usage

::: code-group

```tsx [JS]
import { Badge } from "@sometic/react/structure";

export function Example() {
    return (
        <>
            <Badge>Neutral</Badge>
            <Badge tone="success">Ready</Badge>
            <Badge tone="danger">Failed</Badge>
        </>
    );
}
```

```tsx [TS]
import { Badge } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return (
        <>
            <Badge>Neutral</Badge>
            <Badge tone="success">Ready</Badge>
            <Badge tone="danger">Failed</Badge>
        </>
    );
}
```

```html [Vanilla]
<script type="module">
    import "@sometic/elements/structure";
</script>

<sometic-badge>Neutral</sometic-badge>
<sometic-badge tone="success">Ready</sometic-badge>
<sometic-badge tone="danger">Failed</sometic-badge>
```

:::

## How it works

`resolveBadge` is pure. React renders a `<span>`; `sometic-badge` reflects `tone` onto `data-tone`.

## Anatomy

| Part | Element / attrs              |
| ---- | ---------------------------- |
| Root | `<span>` / host, `data-tone` |

## Props / attributes

### React `BadgeProps`

Extends `HTMLAttributes<HTMLSpanElement>`. Remaining native span attrs are forwarded to the root.

| Prop         | Type                                                        | Default     | Description           |
| ------------ | ----------------------------------------------------------- | ----------- | --------------------- |
| `tone`       | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"neutral"` | Visual tone token     |
| `children`   | `ReactNode`                                                 | —           | Label                 |
| Native attrs | remaining span HTML attrs                                   | —           | Forwarded to `<span>` |

### Vue

`Badge` from `@sometic/vue/structure`. Prop: `tone`. Default slot is the label.

### Custom element (`sometic-badge`)

Observed attributes: `tone`. Children are the label text. Default tone when omitted: `"neutral"`.

## Events / callbacks

None beyond native/forwarded HTML handlers.

## Accessibility

- Badges are visual. Do not rely on color alone for meaning.
- Keep text short and explicit (`Failed`, not only red styling).

## Styling

Target `[data-tone]`. Unstyled by default.

## When to use / When not

**Use** for compact status chips and labels.

**Do not use** for page-level alerts ([Alert](/components/alert)).

## FAQ

**Tone values?** `neutral`, `info`, `success`, `warning`, `danger`.

**Vue component?** Yes. `@sometic/vue/structure`.

**Does React forward native attrs?** Yes, onto the `<span>`.

**Interactive?** No — pure presentational resolve.

## Related links

- [Alert](/components/alert)
- [Styling slots](/concepts/styling-slots)
- [State attributes](/concepts/state-attributes)
