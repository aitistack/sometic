# Input API

## `@sometic/dom/input`

- `resolveInput(options)` → view model (slots, native attrs, state)
- `createInputController({ value?, defaultValue, onValueChange? })`
- `bindInput(element, getOptions)` → `Disposable`
- `resolveSearchInput` / `resolveEmailInput`

## Specialized subpaths

| Subpath          | Highlights                                           |
| ---------------- | ---------------------------------------------------- |
| `input-password` | `revealed` controllable; type text/password          |
| `input-otp`      | length, paste sanitize, `autocomplete=one-time-code` |
| `input-number`   | `number \| null`, optional min/max clamp             |
| `input-file`     | `File[]`, clear, multiple/accept                     |
| `input-masked`   | mask `#` digit / `A` letter / `*` alnum              |
| `input-currency` | `Intl.NumberFormat`, numeric value                   |
| `input-date`     | requires `DateAdapter`; native `type=date` bridge    |

## Field

`@sometic/dom/field`, `createFieldIds`, `resolveField` for label/description/error wiring.

## Adapters

- React: `@sometic/react/input`, `@sometic/react/field`
- Vue: `@sometic/vue/input`, `@sometic/vue/field`
- Elements: `@sometic/elements/input` → `sometic-field`, `sometic-input`, `sometic-password-input`, `sometic-otp-input`
