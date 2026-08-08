# Styling slots

**Slots** name the internal parts of a component (root, label, control, loader, and so on). You style those parts through `classes`, `styles`, and `cssVariables` without forking source or depending on a CSS framework runtime.

## Overview

`@sometic/styling` resolves class names, inline styles, CSS variables, slot markers, and state attributes. Cores do not depend on Tailwind, Bootstrap, or CSS-in-JS libraries. You pass strings (or maps of strings); you own the CSS toolchain.

Common Styleable props on adapters:

| Prop                    | Role                                                          |
| ----------------------- | ------------------------------------------------------------- |
| `unstyled`              | Skip default / variant class layers                           |
| `classes`               | Per-slot class values                                         |
| `styles`                | Per-slot inline styles                                        |
| `cssVariables`          | Custom properties on the root                                 |
| `defaults` / `variants` | Optional default and variant layers                           |
| `merge`                 | Optional class merger (for example Tailwind conflict helpers) |

## Slot markers

Slots are identified with `data-slot`:

```ts
import { createSlotAttributes, defineSlots } from "@sometic/styling/slots";

const BUTTON_SLOTS = defineSlots(["root", "prefix", "content", "suffix", "loader"] as const);

createSlotAttributes("content");
// { "data-slot": "content" }
```

Consumer CSS can target parts without brittle DOM depth:

```css
[data-slot="root"] {
    display: inline-flex;
    gap: 0.5rem;
}

[data-slot="loader"] {
    inline-size: 1rem;
    block-size: 1rem;
}
```

## Example: button slots (React)

```tsx
import { Button } from "@sometic/react/button";

export function SaveButton(): JSX.Element {
    return (
        <Button
            classes={{
                root: "btn btn-primary",
                content: "btn__label",
                loader: "btn__spinner",
            }}
            styles={{
                root: { minInlineSize: "8rem" },
            }}
            cssVariables={{
                "--btn-radius": "0.5rem",
            }}
            loading={false}
        >
            Save
        </Button>
    );
}
```

Anatomy for Button (representative):

| Part    | `data-slot` |
| ------- | ----------- |
| Root    | `root`      |
| Prefix  | `prefix`    |
| Content | `content`   |
| Suffix  | `suffix`    |
| Loader  | `loader`    |

Field and input families expose additional slots such as `label`, `control`, and `nativeInput`. See each component page for the authoritative map.

## Override priority

Resolution order is deterministic (later layers win in the documented algorithm):

1. Behavior-required styles (rare, justified a11y helpers)
2. Default theme / token-derived values when present
3. Component variant and size defaults
4. State-driven classes/styles
5. Consumer `classes` / `styles`
6. Consumer `cssVariables`

**`unstyled: true`:** skips defaults and variants only. Behavior, state attributes, user overrides, and CSS variables still apply.

## Working with Tailwind or Bootstrap

Pass utility or Bootstrap class names through `classes`. Sometic never imports those frameworks.

```tsx
<Button
    classes={{ root: "px-3 py-2 rounded-md bg-slate-900 text-white" }}
    merge={yourTailwindMerge}
/>
```

Provide `merge` only when you need conflict resolution. There is no hard dependency on `tailwind-merge`.

See also [Theming](/theming/) for token and CSS-variable workflows (`plain-css`, `tailwind`, `bootstrap` guides).

## Polymorphic `as`

Foundation exposes `resolvePolymorphicAs` for cross-framework “render as” contracts. Framework-specific composition helpers (for example React `asChild` patterns) live in adapters when supported, not in styling core.

## When to use slots vs global CSS

**Use slot maps** when one instance needs different part styling, or when you compose design-system recipes in JS.

**Use attribute selectors** (`[data-slot]`, `[data-disabled]`) when you prefer stylesheet ownership and low JS surface.

Both can coexist. Prefer stable public hooks over reaching into private DOM structure.

## FAQ

**Do I need `@sometic/theme` to use slots?** No. Slots and class resolvers stand alone. Theme adds tokens and CSS variable generation.

**Where do design tokens live?** `@sometic/theme`. Styling only merges consumer CSS variables you pass in. See [Design tokens](/concepts/design-tokens).

**Can I style only with CSS?** Yes. Target `data-slot` and [state attributes](/concepts/state-attributes).

**Why not ship a single CSS framework?** Product boundary: one behavior model, your styling system. See [Architecture](/concepts/architecture).

## Related links

- [State attributes](/concepts/state-attributes)
- [Design tokens](/concepts/design-tokens)
- [Theming](/theming/)
- [Button](/components/button)
- [Field](/components/field)
- [Primitives: styling](/primitives/styling)
