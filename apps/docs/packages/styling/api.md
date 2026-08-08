# Styling, API

## Core

- `resolveClasses(...inputs)`, flatten class values
- `createClassResolver({ merge? })`, optional consumer merger
- `resolveStyles(...layers)`, merge style objects (`null` deletes a key)
- `resolveCssVariables(vars)`, normalize to `--*` keys
- `resolveStyleable(options)`, layered class + style composition
- `STYLE_OVERRIDE_PRIORITY`, documented layer order
- `StyleableProps<S>`, shared prop contract for components

## Subpaths

- `@sometic/styling/slots`, `defineSlots`, `createSlotAttributes`, `pickSlotValue`
- `@sometic/styling/state`, `resolveStateAttributes`, `STATE_ATTRIBUTE_KEYS`
- `@sometic/styling/polymorphic`, `resolvePolymorphicAs`
- `@sometic/styling/classes` / `@sometic/styling/styles`, tree-shake friendly entrypoints
