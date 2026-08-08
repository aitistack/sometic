# Controlled state

**Controlled state** means your application owns the value. You pass the current value into the component or controller and update it from change callbacks. Sometic engines never silently overwrite a controlled value.

## Overview

Most value-bearing surfaces accept the shared names:

| Concept  | Typical props                                      |
| -------- | -------------------------------------------------- |
| Value    | `value`, `checked`, `open`                         |
| Change   | `onValueChange`, `onCheckedChange`, `onOpenChange` |
| Equality | optional `isEqual` on low-level controllers        |

When `value` (or the equivalent) is present on the options object, the engine treats the instance as controlled for its lifetime. Presence of the key matters, not only whether the value is `undefined` versus a string.

## How it works under the hood

Foundation helper: `createControllableState` from `@sometic/core` (or the matching controllable-state subpath).

```ts
import { createControllableState } from "@sometic/core";

const state = createControllableState({
    value: externalValue,
    defaultValue: "",
    onChange: (next) => setExternalValue(next),
});

state.get(); // reads options.value when controlled
state.set("next"); // notifies onChange; does not mutate an internal cache as source of truth
```

**Rules the helper enforces:**

- **Controlled detection:** `Object.prototype.hasOwnProperty.call(options, "value")`.
- **No silent override:** in controlled mode, `set` does not keep a parallel source of truth; the next `get` still reads `options.value`.
- **Equality:** default `Object.is`; skip `onChange` when equal.
- **Reentrancy guard:** nested `onChange` → `set` calls are ignored to avoid loops.
- **Reset:** `reset()` applies `defaultValue` through the same `set` path.

Component adapters wrap this pattern with framework props. Controllers for input, checkbox, dialog open state, and similar surfaces follow the same contract.

## Examples

### React input

```tsx
import { useState } from "react";
import { Input } from "@sometic/react/input";

export function ControlledEmail(): JSX.Element {
    const [email, setEmail] = useState("");

    return <Input value={email} onValueChange={setEmail} name="email" type="email" />;
}
```

### Vue checkbox

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Checkbox } from "@sometic/vue/selection";

const accepted = ref(false);
</script>

<template>
    <Checkbox :checked="accepted" @checked-change="accepted = $event" />
</template>
```

### Dialog open (React)

```tsx
import { useState } from "react";
import { Dialog } from "@sometic/react/dialog";

export function ControlledDialog(): JSX.Element {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* title / content slots per Dialog docs */}
        </Dialog>
    );
}
```

Escape and other dismiss paths must call `onOpenChange(false)`. If your handler ignores that, the UI and props disagree until you update state.

## When to use controlled state

**Use** when:

- Parent validation, drafts, or URL state must drive the field.
- Multiple controls share one value (radio set, synced inputs).
- You need to reject or transform updates before commit.

**Prefer uncontrolled** when:

- A simple form field only needs a default and a submit-time read.
- You want fewer re-renders and less parent wiring.

See [Uncontrolled state](/concepts/uncontrolled-state).

## Controlled vs store

| Concern   | Controlled props            | `@sometic/store`                        |
| --------- | --------------------------- | --------------------------------------- |
| Scope     | One component or small tree | Shared app / engine state               |
| SSR       | Parent owns hydration       | Explicit store instance                 |
| Cross-tab | Not built in                | Optional persistent / cross-tab modules |

Do not put every keystroke in a global store unless many parts of your app need it. Controlled props are the default for fields; stores are for shared application state. See [Store](/stores/store).

## Edge cases

**Empty string:** `value=""` is controlled and valid. Omitting `value` is uncontrolled.

**Switching modes:** do not flip between controlled and uncontrolled after mount. Pick one ownership model.

**Stale closures:** ensure `onValueChange` always updates the same state the next render passes as `value`.

**Forms:** the form controller owns field values at the engine layer. Bind inputs with `value` / `onValueChange` from `useFormField` (or equivalent) so form meta and UI stay aligned. See [Forms](/forms/).

## FAQ

**Why does presence of `value` matter more than `undefined`?** So frameworks can pass `value={maybeUndefined}` and still be controlled. Detection uses the options key, matching common React conventions.

**Does controlled mode block `onChange`?** No. User interaction still notifies. You must update the prop for the UI to change.

**Can I use controlled open and uncontrolled fields together?** Yes. Ownership is per value surface.

**What about `disabled` / `loading`?** Those are always parent-driven props (or attributes), not controllable value state.

## Related links

- [Uncontrolled state](/concepts/uncontrolled-state)
- [Architecture](/concepts/architecture)
- [Input](/components/input)
- [Checkbox](/components/checkbox)
- [Dialog](/components/dialog)
- [Forms](/forms/)
- [Store](/stores/store)
