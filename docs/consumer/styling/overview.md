# Styling — Overview

`@sometic/styling` resolves classes, inline styles, CSS variables, slots, and stable `data-*` state attributes without depending on Tailwind, Bootstrap, or a CSS-in-JS runtime.

## Modules

| Module                | Import                                           |
| --------------------- | ------------------------------------------------ |
| Class resolver        | `@sometic/styling` or `@sometic/styling/classes` |
| Style / CSS variables | `@sometic/styling` or `@sometic/styling/styles`  |
| Styleable compose     | `@sometic/styling` → `resolveStyleable`          |
| Slots                 | `@sometic/styling/slots`                         |
| State attributes      | `@sometic/styling/state`                         |
| Polymorphic `as`      | `@sometic/styling/polymorphic`                   |

## When to use

Building headless or lightly styled components that must work with the consumer’s CSS system (utility classes, CSS Modules, tokens, plain CSS).

## When not to use

- Theme tokens, theme store, system preference, CSS variable **generation from a theme** → Phase 5 `@sometic/theme`
- Framework-specific `asChild` / Slot composition → framework adapters
- Runtime Tailwind/Bootstrap plugins inside Sometic packages — never; pass class names only

## Override priority

`resolveStyleable` applies layers in this order (later style keys win; class tokens append left → right):

1. Behavior-required
2. Defaults (skipped when `unstyled`)
3. Variants / size (skipped when `unstyled`)
4. State-derived
5. Consumer `classes` / `styles`
6. Consumer `cssVariables`

See `STYLE_OVERRIDE_PRIORITY` and [API](./api.md).
