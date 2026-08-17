# Toast

Imperative toast queue with live-region announcements, max visible cap, and timed dismiss. Not a positioned overlay: pair with your own region UI via `ToastRegion` or `sometic-toast-region`.

<PreviewToast />

## Usage

::: code-group

```tsx [React]
import { ToastRegion } from "@sometic/react/overlay";

export function Example() {
    return (
        <ToastRegion>
            {({ items, push, dismiss }) => (
                <>
                    <button type="button" onClick={() => push({ title: "Saved" })}>
                        Toast
                    </button>
                    <ul>
                        {items.map((item) => (
                            <li key={item.id}>
                                {item.title}
                                <button type="button" onClick={() => dismiss(item.id)}>
                                    Dismiss
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </ToastRegion>
    );
}
```

```vue [Vue]
<script setup>
import { ToastRegion } from "@sometic/vue/overlay";
</script>

<template>
    <ToastRegion v-slot="{ items, push, dismiss }">
        <button type="button" @click="push({ title: 'Saved' })">Toast</button>
        <ul>
            <li v-for="item in items" :key="item.id">
                {{ item.title }}
                <button type="button" @click="dismiss(item.id)">Dismiss</button>
            </li>
        </ul>
    </ToastRegion>
</template>
```

```js [Vanilla]
import { createToastQueue } from "@sometic/dom/toast";

const list = document.querySelector("#toasts");
const queue = createToastQueue({
    onChange(items) {
        list.replaceChildren(
            ...items.map((item) => {
                const li = document.createElement("li");
                li.textContent = item.title;
                const button = document.createElement("button");
                button.type = "button";
                button.textContent = "Dismiss";
                button.addEventListener("click", () => queue.dismiss(item.id));
                li.append(button);
                return li;
            }),
        );
    },
});

document.querySelector("#go").addEventListener("click", () => {
    queue.push({ title: "Saved" });
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerOverlayElements } from "@sometic/elements/overlay";
    registerOverlayElements();

    const region = document.querySelector("sometic-toast-region");
    document.querySelector("#go").addEventListener("click", () => {
        region.push({ title: "Saved" });
    });
</script>

<button type="button" id="go">Toast</button>
<sometic-toast-region></sometic-toast-region>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.4/dist/cdn/sometic-elements.iife.js"></script>

<button type="button" id="go">Toast</button>
<sometic-toast-region></sometic-toast-region>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.4/dist/cdn/sometic-elements.esm.js"
></script>

<button type="button" id="go">Toast</button>
<sometic-toast-region></sometic-toast-region>
```

:::

## Vue

```vue
<script setup>
import { ToastRegion } from "@sometic/vue/overlay";
</script>

<template>
    <ToastRegion v-slot="{ items, push, dismiss }">
        <button type="button" @click="push({ title: 'Saved' })">Toast</button>
        <ul>
            <li v-for="item in items" :key="item.id">
                {{ item.title }}
                <button type="button" @click="dismiss(item.id)">Dismiss</button>
            </li>
        </ul>
    </ToastRegion>
</template>
```

## How it works

1. **Engine (`createToastQueue`)**: manages items (`id`, `title`, `description?`, `durationMs`, `politeness`), timers, `maxVisible` (default 3), optional `LiveAnnouncer`, `push` / `dismiss` / `clear`, `dispose`.
2. **Adapters**: React/Vue `ToastRegion` create a queue, render `data-slot="toast-region"`, expose render-prop / slot API `{ items, push, dismiss }`, dispose on unmount.
3. **Custom element**: `sometic-toast-region` mirrors queue methods (`push`, `dismiss`, `clear`) and emits `toast-change`.

## Anatomy

| Part   | `data-slot`    | Role                                        |
| ------ | -------------- | ------------------------------------------- |
| Region | `toast-region` | Host for item list UI you render (adapters) |
| Item   | `toast` (CE)   | CE default list item; adapters: your markup |

You style and render each `ToastItem` in React/Vue. CE renders a simple text list by default.

## Props / attributes

### React `ToastRegionProps`

| Prop       | Type                                           | Description |
| ---------- | ---------------------------------------------- | ----------- |
| `children` | `(api: { items, push, dismiss }) => ReactNode` | Render prop |

React `push` typing on the adapter accepts `{ title, description? }`. The DOM queue also accepts `durationMs` and `politeness` on `createToastQueue` / direct `push`.

### Queue options (`createToastQueue`)

| Option              | Type              | Default | Description               |
| ------------------- | ----------------- | ------- | ------------------------- |
| `maxVisible`        | `number`          | `3`     | Cap visible toasts        |
| `defaultDurationMs` | `number`          | `4000`  | Auto dismiss              |
| `onChange`          | `(items) => void` |         | Subscription              |
| `announcer`         | `LiveAnnouncer`   | owned   | Optional shared announcer |

### `push` input (DOM queue)

`{ title: string; description?: string; durationMs?: number; politeness?: AriaLivePoliteness }`

### Vue

Default slot scoped API: `{ items, push, dismiss }`.

### Custom element (`sometic-toast-region`)

Methods: `push`, `dismiss`, `clear`. Event: `toast-change` with `{ items }`.

## Events / callbacks

Render prop / scoped slot + queue `onChange`. CE emits toast change details. No focus trap or modal events.

## Controlled vs uncontrolled

Queue owns items (uncontrolled list). Adapters mirror `items` into React/Vue state via `onChange`.

## Form participation

N/A. Often used to report submit success/failure from [Async button](/components/async-button) or [Form](/components/form).

## Accessibility

| Concern     | Guidance                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| Live region | Queue announces via politeness + optional announcer                       |
| Spam        | Do not also assertive-spam Alerts for the same event                      |
| Content     | Keep titles short; descriptions optional                                  |
| Dismiss     | Provide a dismiss control in your item UI calling `dismiss(id)`           |
| Keyboard    | Toasts are non-modal; do not steal focus; keep actions reachable if shown |
| Focus trap  | None (unlike Dialog)                                                      |

## Styling

Region is unstyled on adapters; design your item cards. Prefer non-blocking placement (corner stacks). CE uses `data-slot="list"` / `data-slot="toast"`.

## Edge cases

- **Dispose**: clears timers (adapters dispose on unmount).
- **Exceeding `maxVisible`**: queue keeps the newest slice (`slice(-maxVisible)`).
- **SSR**: create queues in the browser; register CE after DOM APIs exist.
- **Shared announcer**: inject one app-level `LiveAnnouncer` when creating queues to avoid duplicate live regions.
- **Pause on hover**: not built into the queue API; implement in UI if required.
- **Multi-region**: each region owns its own queue; coordinate if you need a global stack.

## Performance notes

Timers per item; dispose aggressively on route change. Prefer a shared announcer at app level when injecting. Thin render-prop adapters avoid shipping positioning code.

## When to use / When not

**Use** for ephemeral feedback after actions.

**Do not use** for:

- Persistent page errors ([Alert](/components/alert))
- Modal decisions ([Dialog](/components/dialog))
- Anchored interactive panels ([Popover](/components/popover))

## FAQ

**Is Toast a Dialog?** No. No focus trap; non-blocking.

**How do I style items?** Map `items` in the render prop / slot to your markup.

**Pause on hover?** Not built into the queue API; implement in UI if required.

**`maxVisible`?** Pass when creating the queue (DOM). React/Vue adapters use `createToastQueue()` defaults unless you build a custom queue.

**Politeness?** Per-toast override on DOM `push`; default `"polite"`.

**CE methods?** Call `element.push({ title })`, `dismiss(id)`, `clear()`.

**Duration?** Default 4000ms; override per `push` on the DOM queue.

**Does dispose stop timers?** Yes.

**Bundle tip?** Import `@sometic/react/overlay` (or Vue / elements / dom toast subpaths).

## Related links

- [Alert](/components/alert)
- [Dialog](/components/dialog)
- [Async button](/components/async-button)
- [Popover](/components/popover)
- [Beta maturity](/releases/beta)
