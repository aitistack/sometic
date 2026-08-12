# Skeleton

Decorative loading placeholder. Marked `aria-hidden="true"` so assistive tech skips it while real content loads.

<PreviewSkeleton />

## Usage

::: code-group

```tsx [JS]
import { Skeleton } from "@sometic/react/structure";

export function Example() {
    return (
        <>
            <Skeleton />
            <Skeleton animated={false} />
        </>
    );
}
```

```tsx [TS]
import { Skeleton } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return (
        <>
            <Skeleton />
            <Skeleton animated={false} />
        </>
    );
}
```

```html [Vanilla]
<script type="module">
    import "@sometic/elements/structure";
</script>

<sometic-skeleton></sometic-skeleton>
```

:::

## How it works

`resolveSkeleton` is pure. Animated by default (`data-animated` present). React accepts `animated={false}` to drop that attribute. The custom element currently calls `resolveSkeleton()` with defaults (animated) and does **not** observe an `animated` attribute.

## Anatomy

| Part | Attrs                                          |
| ---- | ---------------------------------------------- |
| Root | `aria-hidden="true"`, optional `data-animated` |

## Props / attributes

### React `SkeletonProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the root.

| Prop         | Type                     | Default | Description                    |
| ------------ | ------------------------ | ------- | ------------------------------ |
| `animated`   | `boolean`                | `true`  | Adds `data-animated` when true |
| Native attrs | remaining div HTML attrs | —       | Forwarded to the root          |

### Vue

`Skeleton` from `@sometic/vue/structure`. Prop: `animated`.

### Custom element (`sometic-skeleton`)

No observed attributes today. Connect renders the default animated skeleton. For `animated={false}`, use React, Vue, or `resolveSkeleton({ animated: false })` in Vanilla JS.

## Events / callbacks

None beyond native/forwarded HTML handlers.

## Accessibility

- Always `aria-hidden`. Pair with a live status or Progress/Spinner for announcements.
- Replace skeletons with real content as soon as data arrives.

## Styling

Target `[data-slot="root"][aria-hidden="true"]`, `[data-animated]`.

## When to use / When not

**Use** for layout placeholders while content loads.

**Do not use** as the sole status announcement — pair with [Spinner](/components/spinner) or [Progress](/components/progress).

## FAQ

**Why aria-hidden?** Skeletons are decorative; announce status separately.

**CE `animated` attr?** Not observed. Use React or resolve for non-animated.

**Vue component?** Yes. `@sometic/vue/structure`.

**Does React forward native attrs?** Yes, onto the root div.

## Related links

- [Spinner](/components/spinner)
- [Progress](/components/progress)
- [Styling slots](/concepts/styling-slots)
