# Selection FAQ

## Checkbox vs Switch vs Toggle button?

- **Checkbox**, form boolean / multi-select; supports indeterminate.
- **Switch**, settings-like on/off with `role="switch"`, still a checkbox under the hood for FormData.
- **Toggle button**, pressed button chrome (`aria-pressed`), not a form input.

## Is Select a Combobox?

No. Select is a native `<select>`. For listbox-style picking see [Combobox](/components/combobox).

## Is there a React `RadioGroup`?

Not in `@sometic/react/selection`. Compose `Radio` items with shared `name` + parent state, or use `createRadioGroupController` from `@sometic/dom/radio`.

## Why `string | null` on Select?

Empty selection is explicit `null` in JS APIs (empty string from the DOM normalizes to `null` on bind).

## Does indeterminate submit?

No. It is visual/ARIA only; FormData follows checked/unchecked.

## Light DOM default?

Yes for custom elements so forms and page CSS work. Pass `shadow` when you need isolation.

## Controlled pitfalls?

If you pass `checked` / `value` without updating from the change callback, the UI will not move, expected controlled behavior.
