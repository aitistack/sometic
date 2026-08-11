# Core

`@sometic/core` is the foundation package for Sometic. It ships production-grade, framework-independent primitives used by stores, styling, DOM engines, auth, HTTP, and adapters.

## Overview

| Module             | Subpath                            | Purpose                                           |
| ------------------ | ---------------------------------- | ------------------------------------------------- |
| Environment        | `@sometic/core/environment`        | SSR-safe runtime detection                        |
| Id                 | `@sometic/core/id`                 | Stable unique ids                                 |
| Disposable         | `@sometic/core/disposable`         | Cleanup contracts and stacks                      |
| Error              | `@sometic/core/error`              | Typed errors with stable codes                    |
| Result             | `@sometic/core/result`             | Explicit success / failure values                 |
| Contracts          | `@sometic/core/contracts`          | Plugin, adapter, and lifecycle types              |
| Controllable state | `@sometic/core/controllable-state` | Controlled / uncontrolled value ownership         |
| Async operation    | `@sometic/core/async-operation`    | Pending / success / error / abort orchestration   |
| Utils              | `@sometic/core/utils`              | Debounce, throttle, abort helpers, JSON, equality |

The root entry re-exports these surfaces. Prefer **subpath imports** for clearer ownership and tree-shaking.

### When to use

Shared behavior that must stay small, SSR-safe, and free of framework imports: controllable values inside engines, disposable subscriptions, typed errors, async action lifecycle.

### When not to use

- Do not treat core as a UI kit or component library
- Typed pub/sub → [`@sometic/events`](/primitives/events)
- Application or multi-subscriber store state → [`@sometic/store`](/stores/store)
- Theme tokens / CSS variable generation → [`@sometic/theme`](/theming/)

## Installation

<InstallCommands packages="@sometic/core" />


Peer-free. No browser globals are touched at import time.

## Usage

### Controllable state

::: code-group

```ts [TS]
import { createControllableState } from "@sometic/core/controllable-state";

const field = createControllableState({
    defaultValue: "",
    onChange: (next) => {
        console.log(next);
    },
});

field.get();
field.set("hello");
field.update((current) => current.toUpperCase());
field.reset();
field.isControlled; // false until `value` is provided at creation
```

```js [JS]
import { createControllableState } from "@sometic/core/controllable-state";

const field = createControllableState({
    defaultValue: "",
    onChange: (next) => {
        console.log(next);
    },
});

field.set("hello");
field.reset();
```

:::

For controlled mode, include `value` at creation. When the external value changes, update `options.value` (framework adapters sync props each render).

### Async operation

```ts
import { createAsyncOperation } from "@sometic/core/async-operation";

const loadUser = createAsyncOperation(
    async (signal, id: string) => {
        const response = await fetch(`/api/users/${id}`, { signal });
        if (!response.ok) {
            throw new Error("failed");
        }
        return response.json() as Promise<{ id: string }>;
    },
    { concurrency: "latest", timeoutMs: 10_000 },
);

const unsubscribe = loadUser.subscribe((state) => {
    console.log(state.status);
});

await loadUser.execute("42");
loadUser.abort();
unsubscribe();
```

Concurrency modes: `latest` (default), `first`, `parallel`. Prefer `latest` for UI actions.

### Environment, disposable, errors

```ts
import { canUseDom, isServerEnvironment } from "@sometic/core/environment";
import { createDisposable, DisposableStack } from "@sometic/core/disposable";
import { createError, isSometicError } from "@sometic/core/error";
import { ok, err, unwrap } from "@sometic/core/result";
import { createId, createPrefixedId } from "@sometic/core/id";

if (!isServerEnvironment() && canUseDom()) {
    // attach listeners only after mount / activate
}

const stack = new DisposableStack();
stack.defer(() => {
    // cleanup
});
stack.dispose();

const error = createError({
    code: "CORE_EXAMPLE",
    message: "Something failed",
});
isSometicError(error); // true

unwrap(ok(1));
err({ code: "X", message: "no" });
createId();
createPrefixedId("field");
```

### Utils

```ts
import {
    debounce,
    throttle,
    once,
    shallowEqual,
    anySignal,
    safeJsonParse,
    createDeferred,
} from "@sometic/core/utils";

const debounced = debounce((value: string) => console.log(value), 200);
debounced("a");
debounced.cancel();

const controller = new AbortController();
anySignal([controller.signal]);
```

## Key APIs

| Surface      | Exports                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Environment  | `getGlobalThis`, `isServerEnvironment`, `isBrowserEnvironment`, `canUseDom`, `detectRuntimeCapabilities`                              |
| Id           | `createId`, `createPrefixedId`                                                                                                        |
| Disposable   | `createDisposable`, `DisposableStack` (`use`, `defer`, `adopt`, `move`, `dispose`)                                                    |
| Error        | `SometicError`, `createError`, `isSometicError`                                                                                       |
| Result       | `ok`, `err`, `isOk`, `isErr`, `unwrap`, `mapResult`                                                                                   |
| Controllable | `createControllableState` → `get` / `set` / `update` / `reset` / `isControlled`                                                       |
| Async        | `createAsyncOperation` → `execute`, `retry`, `abort`, `reset`, `subscribe`                                                            |
| Utils        | `once`, `debounce`, `throttle`, `shallowEqual`, `createDeferred`, `anySignal`, `normalizeError`, `safeJsonParse`, `safeJsonStringify` |

Contracts (`Plugin`, `AdapterContract`, `Lifecycle`) are type-level seams for later packages. They do not pull framework code.

## How it works

- **SSR safety:** environment helpers read globals only when called, never during module evaluation.
- **Controllable state:** ownership is explicit. Controlled mode never silently overwrites an external value; uncontrolled mode keeps internal state until `reset`.
- **Async operation:** one shared `state` object per controller. Even with `parallel`, the published status reflects the latest settled transition; use `parallel` only when overlapping work is intentional.
- **Errors:** stable `code` strings, optional `cause` / `details`, safe to log (no secrets).

## Edge cases

| Edge                                     | Behavior                                                           |
| ---------------------------------------- | ------------------------------------------------------------------ |
| Controlled + missing external sync       | Stale reads if adapters forget to update `options.value`           |
| `debounce` / `throttle` without `cancel` | Timers may fire after unmount; always cancel or dispose            |
| Emit / subscribe after dispose           | Disposable stacks and async ops must not be reused after `dispose` |
| Import-time DOM                          | Forbidden; call `canUseDom()` inside activate / mount paths        |

## FAQ

### Can I import everything from the root?

Yes (`@sometic/core`). Prefer subpaths for tree-shaking and clearer ownership.

### How does controlled state get external updates?

Mutate the options object’s `value` when the parent value changes. Framework adapters do this each render.

### Does `concurrency: "parallel"` track multiple statuses?

No. Each `execute` still updates the shared `state` to the latest settled transition. Prefer `latest` for UI actions.

### Are timers cleaned up?

`debounce` / `throttle` expose `cancel`. Async timeouts clear in `finally`. Always dispose subscriptions and stacks.

### Is this SSR-safe?

Yes, when you call environment APIs only after deciding to run client code. Do not touch DOM during module evaluation.

### Bundle size?

Subpath budgets target ≤1.5KB gzip for small surfaces such as `environment` / `utils`. Prefer subpath imports.

## Related

- [Events](/primitives/events)
- [Store](/stores/store)
- [Controlled state concept](/concepts/controlled-state)
- [DOM engines](/primitives/dom)
- [Package index](/api/packages)
- [Components](/components/)
