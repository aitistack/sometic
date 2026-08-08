# Accessibility Standard

## Commitment

Accessible behavior is part of the product, not an optional theme. Components and engines must preserve or improve native semantics.

## Baseline Expectations

- Prefer native elements (`button`, `a`, `input`, etc.) over role recreations
- Provide accessible names (visible label, `aria-label`, or labelled-by patterns)
- Keyboard operability for all interactive behavior
- Visible focus; support focus-visible patterns
- Disabled, read-only, and required semantics aligned with native attributes
- Error and status announcements via appropriate live regions where needed
- Honor `prefers-reduced-motion` and high-contrast where we ship visuals
- RTL-aware navigation for directional interactions
- Dialogs: focus trap, restore focus, Escape dismissal (composable with dismissable layer)

## Engine Ownership

`@sometic/accessibility` provides reusable primitives:

Focus manager · keyboard manager · dismissable layer · portal manager · scroll lock · ARIA announcer · observer wrappers

Components compose these engines; adapters must not reimplement conflicting focus/keyboard logic.

## Testing Requirements

For interactive modules targeting Level 2+:

- Automated axe (or equivalent) on representative trees
- Keyboard path tests (tab, arrows, Home/End, Escape, Enter/Space as applicable)
- Focus management tests (initial, contain, restore, roving tabindex)
- Documented screen-reader relationships in consumer docs
- Reduced-motion coverage when animation exists

## Documentation Requirements

Consumer docs for each interactive component include an accessibility section: roles, keyboard map, labeling guidance, known limitations.

## Honesty

Automated tests reduce regressions; they do not equal full WCAG certification. Manual verification remains part of stable (Level 3) releases for flagship components.

## Related

- `testing-strategy.md`
- ADR-0004 (Light/Shadow DOM implications for a11y and styling)
- Phase 6 exit criteria
