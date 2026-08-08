# Accessibility — Comparison

## vs reimplementing focus/dismiss per component

Central engines prevent conflicting Tab/Escape behavior across Dialog/Menu/Popover.

## vs React Aria / Radix primitives alone

Those are excellent in React. `@sometic/accessibility` stays **framework-neutral** so Vue/Vanilla/Web Components share one focus/dismiss model; React adapters can wrap these later.

## vs only using native `<dialog>` / `popover`

Prefer natives when sufficient. Engines cover custom surfaces, nested stacks, live announcements, and scroll locking consistently.

## When not to choose this package alone

If you need a complete Dialog component with styling — wait for overlay phases. If you only need class resolution — use `@sometic/styling`.
