# Button — Overview

The button family shares one behavior model via `@sometic/dom`, with thin adapters for Vanilla, React, Vue, and Web Components.

## Components

| Component    | Engine                         | Notes                                       |
| ------------ | ------------------------------ | ------------------------------------------- |
| Button       | `resolveButton` / `bindButton` | Native `type`, form attrs, loading/disabled |
| IconButton   | `resolveIconButton`            | Requires `aria-label`                       |
| ToggleButton | `resolveToggleButton`          | `aria-pressed` + controllable pressed       |
| AsyncButton  | `createAsyncButtonController`  | Core async-op; loading while pending        |
| ButtonGroup  | `resolveButtonGroup`           | `role=group`, orientation                   |

## Adapters

| Package  | Import                    |
| -------- | ------------------------- |
| Vanilla  | `@sometic/dom/button`      |
| React    | `@sometic/react/button`    |
| Vue      | `@sometic/vue/button`      |
| Elements | `@sometic/elements/button` |

## Slots

`root` · `prefix` · `content` · `suffix` · `loader`

## When not to use

Custom non-button controls that need dialog/menu behavior — later overlay phases. Prefer native `<button>` semantics always.
