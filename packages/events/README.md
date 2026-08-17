# `@sometic/events`

Typed, disposable event emitters for framework-independent Sometic applications.

`@sometic/events` provides `createEventEmitter`, a small typed pub/sub surface with `on`, `once`, `off`, `emit`, `listenerCount`, and `dispose`. Subscriptions return disposables from [`@sometic/core`](https://www.npmjs.com/package/@sometic/core), so cleanup matches the rest of the Sometic lifecycle model. Event maps are TypeScript-first: payload types flow from your `EventMap` into every handler.

Sometic is portable application behavior, not a visual component library. Features such as stores, auth, forms, and overlays need a shared way to emit domain events without inventing per-framework bus APIs. This package exists so engines and adapters can notify listeners with abortable subscriptions and listener-error hooks, while remaining SSR-safe and free of browser globals at import time.

Standout features include typed `EventMap` generics, disposable `on` / `once` subscriptions, optional `AbortSignal` unsubscription, `onListenerError` isolation so one bad handler does not stop the rest, and a clear disposed flag after `dispose()`. The emitter stays under a tight size budget so it is safe to pull into leaf modules.

In the ecosystem, events sits on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) and feeds higher layers that need coordination without a full store. Pair it with [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) when state is shared, or with [`@sometic/accessibility`](https://www.npmjs.com/package/@sometic/accessibility) and DOM engines when UI surfaces need typed signals. Product docs start at [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction).

## Install

```bash
pnpm add @sometic/events
```

```bash
npm install @sometic/events
```

```bash
yarn add @sometic/events
```

## Usage

Typed emitter with disposable subscription:

```ts
import { createEventEmitter } from "@sometic/events";

type AppEvents = {
    ready: { id: string };
    error: { code: string; message: string };
};

const emitter = createEventEmitter<AppEvents>({
    onListenerError: (error, eventName) => {
        console.error(eventName, error);
    },
});

const subscription = emitter.on("ready", ({ id }) => {
    console.log("ready", id);
});

emitter.emit("ready", { id: "session-1" });
subscription.dispose();
```

One-shot listener with AbortSignal:

```ts
import { createEventEmitter } from "@sometic/events";

const emitter = createEventEmitter<{ ping: number }>();
const controller = new AbortController();

emitter.once(
    "ping",
    (value) => {
        console.log(value);
    },
    { signal: controller.signal },
);

emitter.emit("ping", 1);
controller.abort();
emitter.dispose();
```

## CDN

Docs: [https://sometic.dev/primitives/events](https://sometic.dev/primitives/events).

### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/events@1.0.6/dist/cdn/sometic-events.iife.js"></script>
<script>
    const emitter = SometicEvents.createEventEmitter();
    emitter.emit("ready", { ok: true });
</script>
```

### Module script

```html
<script type="module">
    import { createEventEmitter } from "https://cdn.jsdelivr.net/npm/@sometic/events@1.0.6/dist/cdn/sometic-events.esm.js";

    const emitter = createEventEmitter();
</script>
```

## Peers / when not to use

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) (installed automatically as a dependency). Prefer [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) when you need continuous shared state and selectors rather than fire-and-forget events. Do not use this package as a replacement for native DOM events on form controls; preserve native events at the UI boundary and emit high-level events only for high-level behavior.

## Docs

- Introduction: [https://sometic.dev/guide/introduction](https://sometic.dev/guide/introduction)
- Events primitives: [https://sometic.dev/primitives/events](https://sometic.dev/primitives/events)
- Architecture: [https://sometic.dev/concepts/architecture](https://sometic.dev/concepts/architecture)
- Core on npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)
- Events on npm: [https://www.npmjs.com/package/@sometic/events](https://www.npmjs.com/package/@sometic/events)

## License

MIT
