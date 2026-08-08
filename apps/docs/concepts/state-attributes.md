# State attributes

**State attributes** are stable `data-*` attributes that reflect component state for CSS and tests. Prefer them over poking into private class names or internal DOM structure.

## Overview

`resolveStateAttributes` from `@sometic/styling/state` maps a typed style state object to attribute records. Engines (button, input, selection, overlays) call this during resolve so adapters and custom elements expose the same hooks.

Canonical keys:

| State field    | Attribute            |
| -------------- | -------------------- |
| `disabled`     | `data-disabled`      |
| `loading`      | `data-loading`       |
| `invalid`      | `data-invalid`       |
| `readonly`     | `data-readonly`      |
| `focused`      | `data-focused`       |
| `focusVisible` | `data-focus-visible` |
| `filled`       | `data-filled`        |
| `empty`        | `data-empty`         |
| `checked`      | `data-checked`       |
| `selected`     | `data-selected`      |
| `expanded`     | `data-expanded`      |
| `orientation`  | `data-orientation`   |
| `size`         | `data-size`          |
| `variant`      | `data-variant`       |

Boolean attributes are emitted only when true (default value `"true"`, or `""` if you configure empty-string presence). String fields emit when non-empty. `checked: "indeterminate"` maps to `data-checked="indeterminate"`.

## Example: resolve and apply

```ts
import { resolveStateAttributes } from "@sometic/styling/state";

const attrs = resolveStateAttributes({
    disabled: true,
    invalid: true,
    size: "md",
    variant: "outline",
});

// {
//   "data-disabled": "true",
//   "data-invalid": "true",
//   "data-size": "md",
//   "data-variant": "outline",
// }
```

Adapters spread these onto the root (or host) element alongside `data-slot="root"`.

## CSS patterns

```css
[data-disabled="true"] {
    opacity: 0.6;
    pointer-events: none;
}

[data-invalid="true"] {
    outline: 2px solid var(--color-danger, crimson);
}

[data-loading="true"] [data-slot="loader"] {
    display: inline-block;
}

[data-filled="true"] [data-slot="label"] {
    transform: translateY(-0.75rem) scale(0.85);
}
```

Combine with slots:

```css
[data-slot="root"][data-variant="ghost"] {
    background: transparent;
}
```

## Relationship to ARIA and native attributes

State attributes are **styling and test hooks**. Accessibility still relies on native and ARIA properties:

| Concern              | Prefer                                                      |
| -------------------- | ----------------------------------------------------------- |
| Disabled interaction | native `disabled` / `aria-disabled` as the engine specifies |
| Invalid fields       | `aria-invalid`, linked error text                           |
| Busy buttons         | `aria-busy` when loading                                    |
| Expanded disclosure  | `aria-expanded` on the correct control                      |

Do not replace ARIA with `data-*` alone. Engines typically set both where relevant (for example loading buttons set `aria-busy` and `data-loading`).

## Size and variant

`data-size` and `data-variant` are opaque strings. Sometic does not prescribe a closed enum at the styling layer. Your design system defines meaning (`sm` / `md` / `lg`, `solid` / `outline` / `ghost`). Pass the same strings through component props; resolvers reflect them for CSS.

## Testing

Query by role first, then assert state attributes when useful:

```ts
expect(button).toHaveAttribute("data-loading", "true");
expect(input).toHaveAttribute("data-invalid", "true");
```

Avoid selectors that depend on generated utility class order.

## When not to invent private attributes

Stick to the published map for shared components. New public state keys should be documented so every adapter stays consistent. Avoid encoding transient animation-only flags as public API unless your app needs them.

## FAQ

**Why `data-*` instead of only classes?** Classes collide with consumer naming and merge strategies. Attributes stay stable across unstyled and themed modes.

**Are false booleans present as `data-x="false"`?** No. Absent means false for boolean keys.

**Do custom elements mirror the same attributes?** Yes for Wave A elements that share engines. Observed attributes and resolved state stay aligned where documented on the component page.

**Is `data-expanded` a Menu API?** No. Expansion is a general state hook used by overlays and disclosure patterns. For menus and tabs, see [Menu](/components/menu) and [Tabs](/components/tabs).

## Related links

- [Styling slots](/concepts/styling-slots)
- [Design tokens](/concepts/design-tokens)
- [Button](/components/button)
- [Input](/components/input)
- [Primitives: styling](/primitives/styling)
- [Theming](/theming/)
