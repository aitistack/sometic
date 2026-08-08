# Accessibility — FAQ

## Import-time browser access?

No. Document/body/observers are resolved lazily inside factories and `activate`/`ensure`/`announce`.

## Nested dialogs?

Stack dismissable layers (and focus traps) per surface. Only the top dismissable layer handles Escape/outside.

## Does focus trap replace `<dialog>`?

No. Prefer native dialog when it fits. The trap helps custom overlays and consistent cross-framework behavior.

## Scrollbar layout shift?

`lockBodyScroll` adds padding when a scrollbar gap is measurable (`innerWidth - clientWidth`).

## Announcer not heard?

Ensure `announce` runs after user action; keep messages concise; don’t dispose the announcer immediately. Polite vs assertive is selectable per call.

## SSR / Node?

Factories return inert/no-op behavior when `document` is missing. Tests for this package use `happy-dom`.

## Are these WCAG certified?

No. They are building blocks. Automated axe + manual SR checks remain required for Level 2+/3 components (see accessibility standard).
