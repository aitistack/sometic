# `@sometic/angular`

Angular Signals-oriented foundation adapters for Sometic (store bind; component kit expands later).

`@sometic/angular` is a Wave B foundation package. Today it exposes `createAngularStoreBind`, a disposable bind over [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) that you can wire into Angular Signals or services. It does not yet ship a full Angular component kit comparable to `@sometic/react` or `@sometic/vue`. That honesty is intentional: adapters expand only after contracts stabilize.

Sometic keeps behavior in framework-independent engines. Angular should not reimplement store semantics, auth refresh, or form controllers. This package starts with store bind so Angular apps can share the same external store model used across the ecosystem, with explicit `dispose()` for cleanup and no `window` access at import time (enforced via `@sometic/adapter-contract`).

Standout exports today: `createAngularStoreBind` (returns `store`, `get` / `set` / `update`, `subscribe`, and `dispose`), plus `angularAdapterCapabilities` (`["storeBind"]`) for capability discovery. Use the bind from injectable services or signal wrappers you own. Prefer React/Vue adapters when you need buttons, forms, overlays, and auth UI now.

In the ecosystem this sits under Wave B with Svelte, Solid, and Preact. Shared types and fixtures live in [`@sometic/adapter-contract`](https://www.npmjs.com/package/@sometic/adapter-contract). Primitives start at [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Capability notes: [Angular](https://sometic.aitistack.com/frameworks/angular).

## Install

Peer (optional meta): `@angular/core` `^20.3.25 || ^21.2.17 || ^22.0.1` (Angular 19 has no security patch for current advisories).

```bash
pnpm add @sometic/angular @angular/core
```

```bash
npm install @sometic/angular @angular/core
```

```bash
yarn add @sometic/angular @angular/core
```

## Usage

Create a disposable store bind:

```ts
import { createAngularStoreBind } from "@sometic/angular";

const counter = createAngularStoreBind({ count: 0 });

counter.update((state) => ({ count: state.count + 1 }));
const stop = counter.subscribe((state) => {
    console.log(state.count);
});

stop();
counter.dispose();
```

Capability discovery (tests / tooling):

```ts
import { angularAdapterCapabilities } from "@sometic/angular";

console.log(angularAdapterCapabilities);
// ["storeBind"]
```

## Peers / when not to use

- Optional peer `@angular/core`. The bind itself depends on `@sometic/store` and does not require Angular at import time, but production Angular apps should install the peer.
- Do not expect Button, Form, Dialog, or Auth Angular components here yet. Use `@sometic/react` / `@sometic/vue` / `@sometic/elements` for full Wave A surfaces, or call engines directly.
- Skip this package if you only need a plain store without an Angular-facing bind API: use [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) alone.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Angular](https://sometic.aitistack.com/frameworks/angular)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
