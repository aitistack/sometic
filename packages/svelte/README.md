# `@sometic/svelte`

Svelte store-oriented foundation adapters for Sometic (store bind; component kit expands later).

`@sometic/svelte` is a Wave B foundation package. It ships `createSvelteStoreBind`, a disposable wrapper around [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) with a Svelte-friendly `subscribe` / `set` / `update` shape. It does not yet provide a full Svelte component library like `@sometic/react` or `@sometic/vue`. Treat it as an experimental store bridge while the broader catalog expands.

Portable behavior is the point of Sometic. Store logic stays in `@sometic/store`; this adapter only adapts subscription and lifecycle to Svelte-style consumers. Imports stay free of `window` (checked through `@sometic/adapter-contract`), and `dispose()` tears down the underlying store when your component or module ends.

Standout exports: `createSvelteStoreBind` (readable-style `subscribe` that emits the current value immediately, plus `set`, `update`, `store`, `dispose`) and `svelteAdapterCapabilities` (`["storeBind"]`). You can wrap the bind with Svelte 5 runes or `$`-store patterns in your own code without forking store internals.

In the ecosystem this pairs with Angular, Solid, and Preact Wave B packages. Contracts and fixtures: [`@sometic/adapter-contract`](https://www.npmjs.com/package/@sometic/adapter-contract). Foundation: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Capability notes: [Svelte](https://sometic.aitistack.com/frameworks/svelte).

## Install

Peer (optional meta): `svelte` `^5`.

```bash
pnpm add @sometic/svelte svelte
```

```bash
npm install @sometic/svelte svelte
```

```bash
yarn add @sometic/svelte svelte
```

## Usage

Svelte-shaped store bind:

```ts
import { createSvelteStoreBind } from "@sometic/svelte";

const counter = createSvelteStoreBind({ count: 0 });

const unsubscribe = counter.subscribe((value) => {
    console.log(value.count);
});

counter.update((state) => ({ count: state.count + 1 }));
unsubscribe();
counter.dispose();
```

Capability list:

```ts
import { svelteAdapterCapabilities } from "@sometic/svelte";

console.log(svelteAdapterCapabilities.includes("storeBind")); // true
```

## Peers / when not to use

- Optional peer `svelte`. Install it in Svelte apps; the bind API does not touch Svelte globals at import time.
- No Sometic Svelte Button/Form/Dialog components yet. Prefer `@sometic/react`, `@sometic/vue`, or `@sometic/elements` for full UI adapters, or bind engines from `@sometic/dom` yourself.
- If you only need the core store without a Svelte subscribe shape, depend on [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) directly.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Svelte](https://sometic.aitistack.com/frameworks/svelte)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
