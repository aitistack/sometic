# `@sometic/core`

Framework-independent lifecycle, environment, and shared primitive contracts for the Sometic ecosystem.

`@sometic/core` is the foundation package every other Sometic module builds on. It ships small, SSR-safe primitives for runtime detection, cleanup, typed errors, controllable state, and async orchestration without tying you to React, Vue, or any other UI stack. You get production contracts that stay dependency-light and tree-shakeable via root or subpath imports.

Sometic is a portable application behavior system, not a visual UI kit. Core exists so behavior engines (events, stores, forms, auth, HTTP, accessibility) share one vocabulary for dispose, environment, controlled vs uncontrolled values, and typed failure. Adapters stay thin because the hard lifecycle work lives here, not in framework wrappers. Your styling system remains yours; core never forces fonts, CSS frameworks, or component chrome.

Out of the box you get SSR-safe environment helpers (`canUseDom`, `isServerEnvironment`), `createId` / `createPrefixedId`, disposable stacks, `SometicError` with stable codes, `Result` helpers, plugin/adapter/lifecycle contract types, `createControllableState` for controlled and uncontrolled values, `createAsyncOperation` with concurrency and abort, plus utilities such as `debounce`, `throttle`, `anySignal`, and safe JSON helpers. Prefer subpaths like `@sometic/core/utils` when you want the smallest import graph.

In the ecosystem, core sits under every foundation and feature package. Install it whenever you use Sometic, or pull it alone for disposable/async patterns in any TypeScript app. Related packages include [`@sometic/events`](https://www.npmjs.com/package/@sometic/events), [`@sometic/store`](https://www.npmjs.com/package/@sometic/store), [`@sometic/styling`](https://www.npmjs.com/package/@sometic/styling), [`@sometic/accessibility`](https://www.npmjs.com/package/@sometic/accessibility), [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme), and [`@sometic/positioning`](https://www.npmjs.com/package/@sometic/positioning). Start with the product intro at [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction).

## Modules

| Module             | Subpath                            | Purpose                                          |
| ------------------ | ---------------------------------- | ------------------------------------------------ |
| Environment        | `@sometic/core/environment`        | SSR-safe runtime and DOM capability detection    |
| Id                 | `@sometic/core/id`                 | Stable unique and prefixed ids                   |
| Disposable         | `@sometic/core/disposable`         | Cleanup contracts and `DisposableStack`          |
| Error              | `@sometic/core/error`              | Typed errors with stable codes                   |
| Result             | `@sometic/core/result`             | Explicit success and failure values              |
| Contracts          | `@sometic/core/contracts`          | Plugin, adapter, and lifecycle types             |
| Controllable state | `@sometic/core/controllable-state` | Controlled and uncontrolled value ownership      |
| Async operation    | `@sometic/core/async-operation`    | Pending, success, error, and abort orchestration |
| Utils              | `@sometic/core/utils`              | Debounce, throttle, abort helpers, safe JSON     |

## Used by

| Package                                                                          | How it uses core                            |
| -------------------------------------------------------------------------------- | ------------------------------------------- |
| [`@sometic/events`](https://www.npmjs.com/package/@sometic/events)               | Disposable subscriptions and cleanup        |
| [`@sometic/store`](https://www.npmjs.com/package/@sometic/store)                 | Errors, utils, disposable store lifecycle   |
| [`@sometic/styling`](https://www.npmjs.com/package/@sometic/styling)             | Shared contracts for unstyled primitives    |
| [`@sometic/accessibility`](https://www.npmjs.com/package/@sometic/accessibility) | Disposable focus, dismiss, announcer layers |
| [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom)                     | Environment-safe DOM controllers            |
| [`@sometic/http`](https://www.npmjs.com/package/@sometic/http)                   | Async, abort, and typed error boundaries    |
| [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth)                   | Session lifecycle and disposable cleanup    |
| [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms)                 | Controllable field state and async submit   |
| [`@sometic/validation`](https://www.npmjs.com/package/@sometic/validation)       | Result-shaped validation outcomes           |
| Framework adapters (`@sometic/react`, Vue, and siblings)                         | Thin bindings over core contracts           |

## Install

```bash
pnpm add @sometic/core
```

```bash
npm install @sometic/core
```

```bash
yarn add @sometic/core
```

## Usage

Controllable state and disposable cleanup:

```ts
import { createControllableState, createDisposable, DisposableStack } from "@sometic/core";

const value = createControllableState({
    defaultValue: "",
    onChange: (next) => {
        console.log(next);
    },
});

value.set("hello");

const stack = new DisposableStack();
stack.use(
    createDisposable(() => {
        value.reset();
    }),
);
stack.dispose();
```

Async operations with abort-aware concurrency:

```ts
import { createAsyncOperation, isBrowserEnvironment } from "@sometic/core";

const loadUser = createAsyncOperation(
    async (signal, userId: string) => {
        const response = await fetch(`/api/users/${userId}`, { signal });
        if (!response.ok) {
            throw new Error("request failed");
        }
        return response.json() as Promise<{ id: string }>;
    },
    { concurrency: "latest" },
);

if (isBrowserEnvironment()) {
    await loadUser.execute("42");
}
```

## Peers / when not to use

No peer dependencies. Do not treat core as a UI kit or className helper. Prefer [`@sometic/events`](https://www.npmjs.com/package/@sometic/events) for typed pub/sub and [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) for application state. Skip core only if you are not integrating with Sometic at all.

## Docs

- Introduction: [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction)
- Core primitives: [https://sometic.aitistack.com/primitives/core](https://sometic.aitistack.com/primitives/core)
- Architecture: [https://sometic.aitistack.com/concepts/architecture](https://sometic.aitistack.com/concepts/architecture)
- Controlled state: [https://sometic.aitistack.com/concepts/controlled-state](https://sometic.aitistack.com/concepts/controlled-state)
- Uncontrolled state: [https://sometic.aitistack.com/concepts/uncontrolled-state](https://sometic.aitistack.com/concepts/uncontrolled-state)
- Tree shaking: [https://sometic.aitistack.com/concepts/tree-shaking](https://sometic.aitistack.com/concepts/tree-shaking)
- npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)

## License

MIT
