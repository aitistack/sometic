# Styling, Overview

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

Building headless or lightly styled components that must work with the consumer’s CSS system.

## When not to use

- Theme tokens / theme store → Phase 5 `@sometic/theme`
- Framework `asChild` → adapters
- Shipping Tailwind/Bootstrap as library runtime deps, never

## Override priority

1. Behavior-required → 2. Defaults → 3. Variants → 4. State → 5. Consumer classes/styles → 6. `cssVariables`  
   Defaults and variants are skipped when `unstyled` is true.
