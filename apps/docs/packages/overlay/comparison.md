# Overlay comparison

## Why Sometic overlay

- Shared DOM controllers (`createOverlayController`, dialog/popover/tooltip specialists) reused by Elements and, for Dialog, React/Vue.
- Native-leaning roles (`dialog`, `tooltip`, status/alert) with explicit modal vs non-modal dismiss policy.
- Unstyled panels, bring your CSS / tokens.
- Toast queue separated from positioning overlays (no fake “toast dialog”).

## Why not Radix / Headless UI alone

Those stacks are framework-specific. Sometic keeps behavior in `@sometic/dom` so Vanilla, Elements, React, and Vue share one model.

## Why not only native `<dialog>`

Native dialog is excellent but inconsistent to style and compose across frameworks; Sometic adds controllable state, portal/scroll-lock/focus helpers, and adapter parity. You can still learn from native semantics.

## Why not Floating UI as a hard dependency

First-party `@sometic/positioning` covers beta needs; Floating UI remains a future optional adapter.

## When not to use

- If you need a full Menu/Combobox system now, wait for later phases; do not stretch Popover into a menu kit.
- If you only need a static inline banner, use Alert, not Dialog.
