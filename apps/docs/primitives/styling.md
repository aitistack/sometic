# Styling

`@sometic/styling` resolves classes, inline styles, CSS variables, slots, and stable `data-*` state attributes without depending on Tailwind, Bootstrap, or a CSS-in-JS runtime.

## Overview

| Module                | Import                                         | Purpose                                  |
| --------------------- | ---------------------------------------------- | ---------------------------------------- |
| Class resolver        | `@sometic/styling` or `@sometic/styling/classes` | Flatten / merge class values             |
| Style / CSS variables | `@sometic/styling` or `@sometic/styling/styles`  | Merge style objects and `--*` vars       |
| Styleable compose     | `@sometic/styling` → `resolveStyleable`         | Layered class + style composition        |
| Slots                 | `@sometic/styling/slots`                        | Named part contracts and attributes      |
| State attributes      | `@sometic/styling/state`                        | Stable `data-*` for disabled, invalid, … |
| Polymorphic `as`      | `@sometic/styling/polymorphic`                  | Element swapping without framework Slot  |

### When to use

Building headless or lightly styled components that must work with the consumer’s CSS system (utility classes, CSS Modules, tokens, plain CSS).

### When not to use

- Theme tokens, theme store, system preference, CSS variable **generation from a theme** → [`@sometic/theme`](/theming/)
- Framework-specific `asChild` / Slot composition → framework adapters
- Runtime Tailwind or Bootstrap plugins inside Sometic packages: never; pass class names only

## Installation

::: code-group

```bash [npm]
npm install @sometic/styling
```

```bash [pnpm]
pnpm add @sometic/styling
```

```bash [yarn]
yarn add @sometic/styling
```

```bash [bun]
bun add @sometic/styling
```

:::

## Usage

### Resolve styleable layers

```ts
import { resolveStyleable } from "@sometic/styling";

const { className, style } = resolveStyleable({
    defaults: { className: "sometic-btn" },
    variants: { className: "sometic-btn--md" },
    state: { className: "is-disabled" },
    user: { className: "my-btn" },
    cssVariables: { "sometic-btn-pad": "0.75rem" },
});
```

### Classes and Tailwind merge (optional)

```ts
import { createClassResolver, resolveClasses } from "@sometic/styling/classes";
import { twMerge } from "tailwind-merge";

resolveClasses("a", ["b", false && "c"], { d: true });

const cx = createClassResolver({
    merge: (tokens) => twMerge(tokens.join(" ")),
});
cx("p-2", "p-4"); // consumer merger wins conflicts
```

### Slots and state attributes

```ts
import { defineSlots, createSlotAttributes } from "@sometic/styling/slots";
import { resolveStateAttributes } from "@sometic/styling/state";

const slots = defineSlots(["root", "label", "control"] as const);
const attrs = createSlotAttributes("control");

const stateAttrs = resolveStateAttributes({
    disabled: true,
    invalid: false,
    required: true,
});
// data-disabled="true", data-required="true", …
```

### Polymorphic element

```ts
import { resolvePolymorphicAs } from "@sometic/styling/polymorphic";

const tag = resolvePolymorphicAs({ as: "a" }); // "a"
```

## Key APIs

| Export                                                   | Role                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `resolveClasses` / `createClassResolver`                 | Flatten class values; optional merger                                  |
| `resolveStyles` / `resolveCssVariables`                  | Merge styles; normalize `--*` keys                                     |
| `resolveStyleable`                                       | Layered composition returning `{ className, style }`                   |
| `STYLE_OVERRIDE_PRIORITY`                                | Documented layer order                                                 |
| `StyleableProps<S>`                                      | Shared prop contract (`unstyled`, `classes`, `styles`, `cssVariables`) |
| `defineSlots` / `createSlotAttributes` / `pickSlotValue` | Slot contracts                                                         |
| `resolveStateAttributes` / `STATE_ATTRIBUTE_KEYS`        | Stable state `data-*`                                                  |
| `resolvePolymorphicAs`                                   | Resolve `as` element type                                              |

### Override priority

`resolveStyleable` applies layers in this order (later style keys win; class tokens append left → right):

1. Behavior-required
2. Defaults (skipped when `unstyled`)
3. Variants / size (skipped when `unstyled`)
4. State-derived
5. Consumer `classes` / `styles`
6. Consumer `cssVariables`

## How it works

Pure functions. No `window`, `document`, or CSSOM access at import time. Components stay unstyled by default; you pass class names or CSS variables from any styling system.

`unstyled` skips **defaults** and **variants** only. Behavior-required, state, user, and `cssVariables` still apply so accessibility hooks and consumer overrides remain.

## Edge cases

| Edge                        | Behavior                                                                         |
| --------------------------- | -------------------------------------------------------------------------------- |
| `null` style key in a layer | Deletes that key from the merged style object                                    |
| Boolean state attrs         | Default value is `"true"`; pass `{ booleanValue: "" }` for empty-string presence |
| Conflicting utility classes | Only resolved if you supply a `merge` function (for example `twMerge`)           |
| `asChild`                   | Not in this package; adapters own framework Slot composition                     |

## FAQ

### Does this install Tailwind or Bootstrap?

No. Those stay consumer dependencies. Pass class names, or use `createClassResolver({ merge })` with your own merger.

### What does `unstyled` do?

Skips defaults and variants inside `resolveStyleable`. Behavior, state, user, and `cssVariables` still apply.

### Why are state classes applied when `unstyled`?

So you can still style `[data-disabled]` / state hooks without shipping library visual defaults.

### Where do design tokens live?

[`@sometic/theme`](/theming/). This package only merges consumer-provided CSS variables into `style`.

### Is `asChild` supported here?

No. Use `resolvePolymorphicAs` for element swapping; adapters own framework-specific composition.

### Bundle size?

Root entry targets ≤2KB gzip. Prefer subpath imports (`/classes`, `/styles`, `/slots`, `/state`, `/polymorphic`) when you need only one surface.

## Related

- [Styling slots concept](/concepts/styling-slots)
- [State attributes concept](/concepts/state-attributes)
- [Theming](/theming/)
- [Guide: styling](/guide/styling)
- [DOM engines](/primitives/dom)
- [Components](/components/)
- [Package index](/api/packages)
