# Events

`@sometic/events` provides a tiny typed event emitter for framework-independent orchestration. Engines use it for high-level lifecycle signals without coupling to React, Vue, or DOM `EventTarget`.

## Overview

| API                  | Role                                         |
| -------------------- | -------------------------------------------- |
| `createEventEmitter` | Create a typed emitter for a fixed event map |
| `on` / `once`        | Subscribe; returns a `Disposable`            |
| `off`                | Remove a specific handler                    |
| `emit`               | Publish a payload                            |
| `listenerCount`      | Inspect subscriber count                     |
| `dispose`            | Clear all listeners and mark disposed        |

### When to use

- Cross-module notifications inside behavior engines
- One-off lifecycle signals with `once`
- Abortable subscriptions via `AbortSignal`
- Tests that need deterministic pub/sub without a store

### When not to use

- Application UI state → [`@sometic/store`](/stores/store)
- Component-local controlled props → [`@sometic/core/controllable-state`](/primitives/core)
- Native DOM events (click, input, submit): preserve native listeners
- Cross-tab messaging → store cross-tab / auth channels

## Installation

<InstallCommands packages="@sometic/events" />


Depends on `@sometic/core` for the `Disposable` contract. No browser globals at import time.

## Usage

::: code-group

```ts [TS]
import { createEventEmitter } from "@sometic/events";

type FormEvents = {
    submit: { values: Record<string, unknown> };
    reset: undefined;
};

const bus = createEventEmitter<FormEvents>({
    onListenerError: (error, eventName) => {
        console.error(eventName, error);
    },
});

const unsubscribe = bus.on("submit", ({ values }) => {
    console.log(values);
});

bus.once("reset", () => {
    console.log("reset once");
});

bus.emit("submit", { values: { email: "a@b.co" } });
bus.emit("reset", undefined);

unsubscribe.dispose();
bus.dispose();
```

```js [JS]
import { createEventEmitter } from "@sometic/events";

const bus = createEventEmitter({
    onListenerError: (error, eventName) => {
        console.error(eventName, error);
    },
});

const subscription = bus.on("submit", ({ values }) => {
    console.log(values);
});

bus.emit("submit", { values: { email: "a@b.co" } });
subscription.dispose();
bus.dispose();
```

:::

### AbortSignal

```ts
const controller = new AbortController();

bus.on(
    "submit",
    () => {
        /* ... */
    },
    { signal: controller.signal },
);

controller.abort(); // removes the listener
```

## Key APIs

```ts
createEventEmitter<TEvents extends Record<string, unknown>>(
    options?: { onListenerError?: (error: unknown, eventName: string) => void },
): EventEmitter<TEvents>
```

| Method                              | Notes                           |
| ----------------------------------- | ------------------------------- |
| `on(event, handler, { signal? })`   | Returns `Disposable`            |
| `once(event, handler, { signal? })` | Auto-removes after first emit   |
| `off(event, handler)`               | Manual remove                   |
| `emit(event, payload)`              | Invokes listeners synchronously |
| `listenerCount(event)`              | Current handler count           |
| `dispose()` / `disposed`            | Terminal cleanup                |

## How it works

Listeners run synchronously in registration order. If a handler throws, emit continues for remaining listeners. Optional `onListenerError` observes failures without aborting the emit loop.

`dispose()` clears every listener. After dispose, `emit` throws; create a new emitter instead of reusing a disposed one.

## Edge cases

| Edge                              | Behavior                                               |
| --------------------------------- | ------------------------------------------------------ |
| Listener throws                   | Other listeners still run; use `onListenerError`       |
| Emit after dispose                | Throws                                                 |
| Abort during emit                 | Signal abort removes the subscription for future emits |
| Duplicate `on` with same function | Two subscriptions unless you `off` / dispose one       |

## FAQ

### Do I need to remove listeners manually?

Prefer the `Disposable` from `on` / `once`, or pass an `AbortSignal`. Calling `dispose()` on the emitter clears all listeners.

### What happens if a listener throws?

Emit continues. Provide `onListenerError` to observe failures.

### Can I emit after dispose?

No. `emit` throws. Create a new emitter.

### Why not `EventTarget`?

This API is typed on a fixed event map, returns Sometic `Disposable`s, and stays free of DOM globals so the same bus works in Node tests and SSR entry paths.

### Is this a replacement for the store?

No. Emitters are fire-and-forget notifications. Stores hold current state and notify subscribers of snapshots.

## Related

- [Core](/primitives/core)
- [Store](/stores/store)
- [Forms](/forms/)
- [Auth service](/services/auth)
- [Package index](/api/packages)
- [Components](/components/)
