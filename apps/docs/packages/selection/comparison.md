# Selection comparison

## Why Sometic selection

- One resolve/controller model across Checkbox, Switch, Radio, and Select.
- Native inputs first, autofill, FormData, keyboard, and platform select UI stay intact.
- Framework adapters stay thin; Elements keep light DOM for form friendliness.
- Honest scope: native Select now; Combobox/Menu later.

## Why not only native inputs

Shared controllable state, consistent `data-*` styling hooks, indeterminate/ARIA wiring, and cross-framework APIs without rewriting each app.

## Why not Radix Checkbox / Select alone

Radix is React-centric. Sometic engines are framework-free with React/Vue/Elements adapters.

## Why not a custom listbox for every select

Native `<select>` is the right default for accessibility and mobile UX. Custom listboxes belong in a future Combobox, not a CSS restyle of Select.

## When not to use

- Searchable option picking → [Combobox](/components/combobox). Full autocomplete polish remains deferred.
- Toolbar pressed state → Toggle button.
- Mutual exclusivity with few visible options → Radio; many options → Select.
