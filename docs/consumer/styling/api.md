# Styling — API

## `resolveClasses(...inputs)`

Flattens strings, numbers, arrays, and conditional dictionaries into a single class string. Falsy values are skipped.

## `createClassResolver({ merge? })`

Returns a resolver that optionally runs a consumer-provided `merge(tokens)` (for example wrapping `tailwind-merge`). Sometic does not depend on `tailwind-merge`.

## `resolveStyles(...layers)`

Merges style objects. Later layers win. `undefined` skips a key; `null` deletes a previously set key. Numbers are stringified.

## `resolveCssVariables(vars)`

Maps `{ "btn-bg": "navy" }` → `{ "--btn-bg": "navy" }`. Keys that already start with `--` are preserved.

## `resolveStyleable(options)`

Composes class + style layers with deterministic override priority. Options: `unstyled`, `behavior`, `defaults`, `variants`, `state`, `user`, `cssVariables`, `merge`.

Returns `{ className, style }`.

## `StyleableProps<S>`

Shared prop shape for future components: `unstyled`, `classes` (slot map), `styles` (slot map), `cssVariables`.

## Slots (`@sometic/styling/slots`)

- `defineSlots(["root", "content"])` — typed slot catalog helper
- `createSlotAttributes("root")` → `{ "data-slot": "root" }`
- `pickSlotValue(map, slot)` — read one slot from a map

## State (`@sometic/styling/state`)

`resolveStateAttributes(state, { booleanValue? })` emits stable attributes such as `data-disabled`, `data-loading`, `data-invalid`, `data-checked` (`true` | `indeterminate`), `data-size`, `data-variant`, `data-orientation`, and related flags listed in `STATE_ATTRIBUTE_KEYS`. False/undefined flags are omitted.

## Polymorphic (`@sometic/styling/polymorphic`)

`resolvePolymorphicAs(as, defaultAs)` returns a trimmed element name or the default. Framework `asChild` is intentionally not implemented here.
