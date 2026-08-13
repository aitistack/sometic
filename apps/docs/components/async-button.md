# Async button

Button that runs an abortable `action(signal)` promise, owns pending loading state, and surfaces completion/error on the custom element path. Same native button semantics as [Button](/components/button), with loading derived from the operation (not a controlled `loading` prop).

<PreviewAsyncButton />

## Usage

::: code-group

```tsx [React]
import { AsyncButton } from "@sometic/react/button";

export function Example() {
    return (
        <AsyncButton
            action={async (signal) => {
                await fetch("/api/save", { signal });
            }}
        >
            Save
        </AsyncButton>
    );
}
```

```vue [Vue]
<script setup>
import { AsyncButton } from "@sometic/vue/button";
</script>

<template>
    <AsyncButton :action="async () => {}">Save</AsyncButton>
</template>
```

```js [Vanilla]
import { createAsyncButtonController } from "@sometic/dom/async-button";

const button = document.querySelector("button");
createAsyncButtonController({
    getButton: () => button,
    action: async () => {},
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerButtonElements } from "@sometic/elements/button";
    registerButtonElements();

    const el = document.querySelector("sometic-async-button");
    el.action = async (signal) => {
        await fetch("/api/save", { signal });
    };
</script>

<sometic-async-button>Save</sometic-async-button>
```

```html [CDN]
<script type="module" src="https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js"></script>

<sometic-async-button>Save</sometic-async-button>
```
:::

## Vue

```vue
<script setup>
import { AsyncButton } from "@sometic/vue/button";

async function save(signal) {
    await fetch("/api/save", { signal });
}
</script>

<template>
    <AsyncButton :action="save">Save</AsyncButton>
</template>
```

> React/Vue types define `action: (signal: AbortSignal) => Promise<unknown>`. Pass the abort signal as the **first argument**, not `{ signal }`.

## How it works

1. **Engine**: `createAsyncButtonController` wraps `@sometic/core` async operation + button resolve. Pending ⇒ loading view; re-entry aborts prior work.
2. **Adapters**: React/Vue omit external `loading`; derive it from the operation. Click calls `press`.
3. **Custom element**: `sometic-async-button` assigns `.action` as a function property; emits pending / error lifecycle events.

## Anatomy

Same as Button slots; loader shows while the operation is pending.

| Part    | `data-slot` | Role                  |
| ------- | ----------- | --------------------- |
| Root    | `root`      | Native `<button>`     |
| Prefix  | `prefix`    | Leading adornment     |
| Content | `content`   | Label / children      |
| Suffix  | `suffix`    | Trailing adornment    |
| Loader  | `loader`    | Present while pending |

## Props / attributes

### React `AsyncButtonProps`

`Omit<ButtonProps, "loading"> & { action: (signal: AbortSignal) => Promise<unknown> }`.

| Prop                            | Type                                        | Description                           |
| ------------------------------- | ------------------------------------------- | ------------------------------------- |
| `action`                        | `(signal: AbortSignal) => Promise<unknown>` | **Required.** Abortable work          |
| (Button props except `loading`) |                                             | `type`, `disabled`, styling, slots, … |

### Vue

Prop: `action` (required), plus button props (`type`, `disabled`, `unstyled`, …). Emits gated `click` after press settles.

### Custom element (`sometic-async-button`)

Observed: `type`, `disabled`, `size`, `variant`, `shadow`. Set `element.action = async (signal) => { … }` (attributes cannot carry the callback).

## Events / callbacks

| Surface    | Event                                                              |
| ---------- | ------------------------------------------------------------------ |
| React      | Native click starts action; handle success/failure inside `action` |
| Vue        | `click` after press; status via controller subscription            |
| CE         | pending / error-style custom events                                |
| Controller | `subscribe` for pending state; `press` returns a promise           |

## Controlled vs uncontrolled

Loading is owned by the async operation (not a controlled `loading` prop). `disabled` remains prop-driven.

## Form participation

`type="submit"` still submits the form. Prefer relying on pending disabled press to block double-submit, or handle submit in `action` without a native form post. Coordinate with Form `onValid` when using the forms engine.

## Accessibility

| Concern  | Guidance                                                                   |
| -------- | -------------------------------------------------------------------------- |
| Pending  | Same as Button loading (`aria-busy`, disabled press)                       |
| Keyboard | Space / Enter start the action when enabled                                |
| Errors   | Announce failures in your UI (Alert / Toast); React does not auto-announce |
| Name     | Visible label or `aria-label`                                              |

## Styling

`[data-loading]` while pending; standard button slots and size/variant attrs.

```tsx
<AsyncButton
    unstyled
    classes={{ root: "btn", loader: "btn__spinner" }}
    action={async (signal) => {
        await fetch("/api/save", { signal });
    }}
>
    Save
</AsyncButton>
```

## Edge cases

- **Rapid re-clicks**: abort the previous signal and start again.
- **Unmount**: dispose cancels outstanding work (React/Vue dispose with the adapter).
- **Rejected promises**: surface on CE; in React catch inside `action` or let reject reach your error strategy.
- **SSR**: create controller only on the client; register CE in the browser.
- **Changing `action`**: React recreates the controller when `action` identity changes; stabilize with a stable function when possible.
- **Double submit**: pending forces ignored presses like Button loading.

## Performance notes

One async operation controller per button. Abort keeps network work from stacking. Prefer this over manually juggling `loading` on Button.

## When to use / When not

**Use** for abortable saves / deletes with automatic pending UI.

**Do not use** for:

- Pure sync clicks ([Button](/components/button))
- Navigation (use a link)
- Multi-step wizards (Form submit handlers)

## FAQ

**Signal shape?** `(signal: AbortSignal) => …`, not `{ signal }`.

**Can I pass `loading`?** Omitted from props; derived from the operation.

**Abort on unmount?** Dispose cancels outstanding work via the async controller.

**Submit buttons?** Works, but coordinate with Form `onValid` if you also use the forms engine.

**Error UI?** Handle in `action` catch + [Toast](/components/toast) / [Alert](/components/alert).

**CE `.action`?** Assign a function property; attributes alone cannot carry the async callback.

**Does React forward refs?** Yes, to the underlying `<button>`.

**Re-entry?** A new press aborts the prior in-flight signal.

**Bundle tip?** Import `@sometic/react/button` (or Vue / elements matching subpaths).

## Related links

- [Button](/components/button)
- [Form](/components/form)
- [Toast](/components/toast)
- [Alert](/components/alert)
- [Toggle button](/components/toggle-button)
