# `@sometic/solid`

Solid signals foundation adapters for Sometic (store bind; component kit expands later).

`@sometic/solid` is a Wave B foundation package. It exports `createSolidStoreBind`, a disposable bind over [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) with `get` / `set` / `subscribe` for Solid-friendly wiring. It does not yet ship Solid components for buttons, forms, overlays, or auth. Use it when you need shared Sometic store semantics inside a Solid app while the component kit expands later.

Sometic separates engines from adapters. Solid should not own a second store implementation. This package reuses `@sometic/store`, keeps imports free of browser globals at module load (via `@sometic/adapter-contract`), and requires explicit `dispose()` so subscriptions and store resources do not leak across remounts.

Standout exports: `createSolidStoreBind` and `solidAdapterCapabilities` (`["storeBind"]`). From Solid components you can bridge `subscribe` into signals or effects you create; the bind does not invent a parallel Solid store API beyond the documented methods.

Ecosystem placement: Wave B with Angular, Svelte, and Preact. Shared contracts: [`@sometic/adapter-contract`](https://www.npmjs.com/package/@sometic/adapter-contract). Primitives: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Capability notes: [Solid](https://sometic.aitistack.com/frameworks/solid).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

Peer (optional meta): `solid-js` `^1.8`.

```bash
pnpm add @sometic/solid solid-js
```

```bash
npm install @sometic/solid solid-js
```

```bash
yarn add @sometic/solid solid-js
```

## Usage

Store bind:

```ts
import { createSolidStoreBind } from "@sometic/solid";

const counter = createSolidStoreBind({ count: 0 });

const stop = counter.subscribe((state) => {
    console.log(state.count);
});

counter.set({ count: counter.get().count + 1 });
stop();
counter.dispose();
```

Capabilities:

```ts
import { solidAdapterCapabilities } from "@sometic/solid";

console.log([...solidAdapterCapabilities]); // ["storeBind"]
```

## Peers / when not to use

- Optional peer `solid-js`. Install it for Solid apps; this package does not import Solid at load time.
- Not a Solid UI kit yet. For production component adapters, use `@sometic/react`, `@sometic/vue`, or `@sometic/elements`.
- Prefer [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) alone if you do not need the Solid-oriented bind wrapper.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Solid](https://sometic.aitistack.com/frameworks/solid)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
