# Styling, FAQ

## Tailwind or Bootstrap as dependencies?

No. Pass class names; optionally supply `merge` for conflict resolution.

## What does `unstyled` skip?

Defaults and variants only. Behavior, state, user overrides, and CSS variables still apply.

## Where are design tokens?

`@sometic/theme` (Phase 5). This package only merges consumer CSS variables.

## `asChild`?

Not in foundation. Use `resolvePolymorphicAs`; adapters own composition.

## Import-time browser access?

None, pure functions.
