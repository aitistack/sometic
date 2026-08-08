# Theme — FAQ

## Does theme require React?

No. Controllers are framework-agnostic. Bind with `subscribe` + `applyThemeToElement`.

## SSR-safe?

Yes. No import-time `window`. Without `matchMedia`, color scheme falls back to light/`no-preference` and motion/contrast flags are false.

## How does `mode: "system"` work?

Resolves to light/dark via `prefers-color-scheme`, selecting `lightThemeId` / `darkThemeId`. Changing OS preference rebuilds the snapshot when mode is `system`.

## What does `setMode("dark")` do to `themeId`?

It sets mode to `dark` and moves `themeId` to `darkThemeId` so resolved tokens match.

## Persistence?

Pass `persist: true` with a `@sometic/store/persistent` storage adapter (defaults to memory). Preferences hydrate asynchronously — await `hydrated`.

## Scoped themes?

Call `applyThemeToElement` on a container instead of `document.documentElement`. Variables and `data-*` stay local to that subtree (plus inheritance).

## Why aren’t presets on the root entry?

To keep the theme controller ≤ 3 KB gzip. Import `@sometic/theme/presets` when needed.

## Contrast helpers support only hex?

Phase 5 ships hex parsing. Extend later for `rgb()` / OKLCH if needed — do not pretend wider support yet.

## Reduced motion / high contrast?

Flags accept `true` \| `false` \| `"system"`. Resolved values appear as `data-reduced-motion` / `data-high-contrast` when active.
