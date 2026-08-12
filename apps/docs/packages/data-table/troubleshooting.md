# Data table troubleshooting

## Table stays empty in server mode

Confirm `fetchRows` resolves `{ rows, total }` and that `load()` ran (React calls it when `fetchRows` is set; Vanilla must call `table.load()`). Check `getState().error` and abort: a newer request cancels the previous one.

## Sort clicks do nothing

Column needs `sortable: true`. Controlled `sorting` without `onSortingChange` will snap back. Verify `toggleSort` / header button wiring.

## Page select-all skips rows

Those rows are disabled via `isRowDisabled`, or you are in `allFiltered` mode with exclusions. Inspect `getPageSelectionState()` and `getSelectedIds()`.

## URL sync fights the controller

Decode once on boot into `defaultSorting` / `defaultFilters`, then write on `on*Change`. Do not set controlled props from the URL on every history tick without also updating local state.

## Keyboard focus feels stuck

Ensure cells have the resolve `tabindex` pattern and that focus moves via `getDataTableKeyboardAction`. Do not put `tabindex="0"` on every cell.

## Bundle / tree-shaking

Import from `@sometic/data-table` and `@sometic/dom/data-table` subpaths. Avoid pulling unused URL or virtual helpers if you do not need them.

## Still stuck?

See [FAQ](./faq), [component docs](/components/data-table), and the vanilla playground `#data-table` section.
