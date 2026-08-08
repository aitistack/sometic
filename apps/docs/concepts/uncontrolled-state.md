# Uncontrolled state

**Uncontrolled state** means the component or controller owns the value after mount. You may seed it with a default; you do not pass a live `value` prop (or equivalent) on every render.

## Overview

Omit the controlled value key and supply a default instead:

| Surface             | Seed prop        | Read later via                     |
| ------------------- | ---------------- | ---------------------------------- |
| Input / select text | `defaultValue`   | change handlers, form APIs, refs   |
| Checkbox / switch   | `defaultChecked` | `onCheckedChange`, form values     |
| Dialog / overlays   | `defaultOpen`    | `onOpenChange`, controller getters |

Uncontrolled mode is ideal for progressive enhancement, native form posts, and low-ceremony fields.

## How it works under the hood

`createControllableState` keeps an internal `uncontrolledValue` initialized from `defaultValue` when `value` is absent:

```ts
import { createControllableState } from "@sometic/core";

const state = createControllableState({
    defaultValue: "Ada",
    onChange: (next) => {
        console.log("changed", next);
    },
});

state.get(); // "Ada"
state.set("Grace"); // updates internal value and notifies
state.reset(); // back to defaultValue
```

**Important:** changing `defaultValue` after mount does not re-seed uncontrolled state. Treat defaults as initial configuration, not a live binding.

## Examples

### React uncontrolled input

```tsx
import { Input } from "@sometic/react/input";

export function NameField(): JSX.Element {
    return (
        <Input
            name="fullName"
            defaultValue=""
            onValueChange={(next) => {
                // optional side effect; parent does not own value
            }}
        />
    );
}
```

### Custom element

```html
<sometic-input name="fullName" value=""></sometic-input>
```

Custom elements often use attributes for the initial value and keep subsequent edits on the element. Prefer reading through the element API or a surrounding form controller rather than scraping opaque internals.

### Uncontrolled dialog

```tsx
import { Dialog } from "@sometic/react/dialog";

export function SoftModal(): JSX.Element {
    return (
        <Dialog
            defaultOpen={false}
            onOpenChange={(open) => {
                // analytics, focus return helpers, etc.
            }}
        >
            {/* content */}
        </Dialog>
    );
}
```

Escape still notifies `onOpenChange`. Internal open state updates even when you do not store `open` in the parent.

## Forms and native participation

Uncontrolled inputs participate in native `<form>` submission when they render real named controls. Sometic form engines prefer registered field values over scraping the DOM, but you can:

1. Keep fields uncontrolled in the DOM.
2. Sync into `form.setValue` on change, or
3. Fully control fields through `useFormField`.

See [Forms](/forms/) and [Fields](/forms/fields).

**Native-only path:** a single uncontrolled input with browser validation and no shared meta does not need `@sometic/forms`. Use Sometic Input only if you want shared styling slots, state attributes, or adapter consistency.

## When to use uncontrolled state

**Use** when:

- Defaults are enough and the parent does not need every keystroke.
- You integrate with progressive enhancement or classic form posts.
- You want to minimize parent re-renders.

**Prefer controlled** when:

- URL, store, or sibling widgets must drive the value.
- You must reject or transform updates before display.
- Validation UX depends on parent-owned values.

See [Controlled state](/concepts/controlled-state).

## Edge cases

**Do not flip modes:** mounting uncontrolled then later passing `value` (or the reverse) leads to subtle bugs. Choose once.

**Default updates ignored:** editing `defaultValue` after mount does not reset the field. Call `reset()` on a controller or remount the component if you need a new seed.

**`null` vs omit:** for select-like values, follow the component API (`string | null` vs omit). Omitting means uncontrolled; passing `null` usually means controlled empty selection.

**Callbacks still fire:** uncontrolled does not mean silent. `onValueChange` / `onOpenChange` still run so you can observe without owning.

## FAQ

**Is uncontrolled less accessible?** No. Accessibility comes from native semantics, labels, and ARIA wiring, not from who owns state.

**Can I read the value without React state?** Yes: change callbacks, form controller values, or element properties after interaction.

**How does this relate to the store?** Component-local uncontrolled state is not a store. Use `@sometic/store` for shared application state. See [Store](/stores/store).

**What about SSR?** Seed with `defaultValue` that matches server HTML when hydration matters. Avoid reading browser storage at import time when computing defaults.

## Related links

- [Controlled state](/concepts/controlled-state)
- [Architecture](/concepts/architecture)
- [Input](/components/input)
- [Select](/components/select)
- [Dialog](/components/dialog)
- [Forms](/forms/)
- [Field](/components/field)
