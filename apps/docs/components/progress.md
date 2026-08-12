# Progress

Determinate or indeterminate progressbar. Resolve emits `role="progressbar"`, `aria-valuemin` / `aria-valuemax`, and `aria-valuenow` when determinate.

<PreviewProgress />

## Usage

::: code-group

```tsx [JS]
import { Progress } from "@sometic/react/structure";

export function Example() {
    return (
        <>
            <Progress value={64} max={100} />
            <Progress indeterminate />
        </>
    );
}
```

```tsx [TS]
import { Progress } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return (
        <>
            <Progress value={64} max={100} />
            <Progress indeterminate />
        </>
    );
}
```

```html [Vanilla]
<script type="module">
    import "@sometic/elements/structure";
</script>

<sometic-progress value="64" max="100"></sometic-progress>
<sometic-progress></sometic-progress>
```

:::

Omit `value` on the custom element for indeterminate (engine treats missing value as indeterminate). React can also pass `indeterminate`.

## How it works

`resolveProgress` is pure. Omit `value` (or pass `indeterminate`) for indeterminate state (`data-state="indeterminate"`). React and `sometic-progress` both call resolve; no controller.

## Anatomy

| Part | Role / attrs                             |
| ---- | ---------------------------------------- |
| Root | `role="progressbar"`, `data-slot="root"` |

## Props / attributes

### React `ProgressProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the root.

| Prop            | Type                     | Default | Description                                     |
| --------------- | ------------------------ | ------- | ----------------------------------------------- |
| `value`         | `number`                 | —       | Current value                                   |
| `max`           | `number`                 | `100`   | Maximum                                         |
| `indeterminate` | `boolean`                | derived | Force indeterminate (also when `value` omitted) |
| Native attrs    | remaining div HTML attrs | —       | Forwarded to the root                           |

### Vue

`Progress` from `@sometic/vue/structure`. Props: `value`, `max`, `indeterminate`. Native attrs forward to the root `div`.

### Custom element (`sometic-progress`)

Observed attributes: `value`, `max`. Missing `value` ⇒ indeterminate. There is no `indeterminate` observed attribute — omit `value` instead.

## Events / callbacks

None beyond native HTML attribute handlers you attach (React forwarded events, CE DOM events).

## Accessibility

- Always expose min/max.
- Prefer a visible label nearby for long operations.
- Indeterminate must not invent a fake `aria-valuenow`.

## Styling

Target `[role="progressbar"]`, `[data-state="determinate"|"indeterminate"]`, `[data-value]`.

## When to use / When not

**Use** for determinate upload/download/task progress and indeterminate busy bars.

**Do not use** for brief unlabeled busy chrome only — prefer [Spinner](/components/spinner).

## FAQ

**Default max?** `100`.

**CE indeterminate?** Omit the `value` attribute.

**Vue component?** Yes. `@sometic/vue/structure`.

**Does React forward native attrs?** Yes, onto the root div.

## Related links

- [Spinner](/components/spinner)
- [Skeleton](/components/skeleton)
- [Styling slots](/concepts/styling-slots)
