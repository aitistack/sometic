# Input FAQ

## Why isn’t this `@sometic/input`?

Behavior engines live in `@sometic/dom` (same as Button). Import `@sometic/dom/input` or framework adapters like `@sometic/react/input`.

## Controlled vs uncontrolled?

Use `value` + `onValueChange` (controlled) or `defaultValue` (uncontrolled). Changing `defaultValue` after mount does not re-seed controlled state.

## Do native `input` events still fire?

Yes. High-level `onValueChange` / `value-change` are additions, not replacements.

## Why is Field separate from Form?

Field wires ids/labels/errors. Form registration, validation, and submit live in Phase 9 (`@sometic/forms`).

## Why date adapters?

Date libraries stay optional. Use `@sometic/date-native` by default, or dayjs/date-fns adapters.

## OTP: one box or many?

Engine stores one string. Multi-box UIs can call `setCharAt` / `applyPaste`. Prefer `autocomplete="one-time-code"`.

## Mask vs validation?

Masks format input. Validation belongs in Phase 9.

## SSR?

No browser globals at import time in engines. Bind/adapters need DOM when mounting.

## Bundle size?

Import subpaths. Base `@sometic/dom/input` targets ≤ 3 KB gzip.
