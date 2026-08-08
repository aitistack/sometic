# Button — API

## Engine (`@sometic/dom`)

- `resolveButton(options)` → view model (className, style, attributes, slots)
- `handleButtonPress(view, event, onPress?)`
- `bindButton(element, getOptions)` — Vanilla binder
- `resolveIconButton`, `resolveToggleButton`, `createToggleButtonController`
- `createAsyncButtonController({ action, ... })`
- `resolveButtonGroup({ orientation?, disabled? })`

## React (`@sometic/react/button`)

`Button`, `IconButton`, `ToggleButton`, `AsyncButton`, `ButtonGroup`

## Vue (`@sometic/vue/button`)

`Button`, `IconButton`, `ToggleButton`, `ButtonGroup` (`v-model:pressed` on toggle)

## Elements (`@sometic/elements/button`)

`sometic-button`, `sometic-icon-button`, `sometic-toggle-button`, `sometic-button-group` (Light DOM)
