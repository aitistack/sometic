# `@sometic/preact`

Preact external-store foundation adapters for Sometic (store bind; component kit expands later).

`@sometic/preact` is a Wave B foundation package. It provides `createPreactStoreBind`, shaped for Preact’s external-store pattern (`getSnapshot` + `subscribe`) over [`@sometic/store`](https://www.npmjs.com/package/@sometic/store). It does not yet re-export a full Preact component kit. If you need Wave A components today, use `@sometic/react` (or Vanilla/elements) and keep this package for store bridging, or wait for the Preact component surface to expand.

Sometic’s adapters stay thin. Preact should not fork store or auth engines. This bind keeps the same store semantics as other frameworks, asserts no import-time `window` access through `@sometic/adapter-contract`, and exposes `dispose()` for cleanup when the host unmounts.

Standout exports: `createPreactStoreBind` (`getSnapshot`, `subscribe`, `set`, `store`, `dispose`) and `preactAdapterCapabilities` (`["storeBind"]`). Pair `getSnapshot` / `subscribe` with Preact’s `useSyncExternalStore` (or equivalent) in your own components.

Ecosystem: Wave B with Angular, Svelte, and Solid. Contracts: [`@sometic/adapter-contract`](https://www.npmjs.com/package/@sometic/adapter-contract). Foundation: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Capability notes: [Preact](https://sometic.aitistack.com/frameworks/preact).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

Peer (optional meta): `preact` `^10`.

```bash
pnpm add @sometic/preact preact
```

```bash
npm install @sometic/preact preact
```

```bash
yarn add @sometic/preact preact
```

## Usage

External-store shaped bind:

```ts
import { createPreactStoreBind } from "@sometic/preact";

const counter = createPreactStoreBind({ count: 0 });

const unsubscribe = counter.subscribe(() => {
    console.log(counter.getSnapshot().count);
});

counter.set({ count: 1 });
unsubscribe();
counter.dispose();
```

Capability flag:

```ts
import { preactAdapterCapabilities } from "@sometic/preact";

console.log(preactAdapterCapabilities); // ["storeBind"]
```

## Peers / when not to use

- Optional peer `preact`. Install it in Preact apps; the bind does not require Preact at import time.
- No Preact Button/Form/Dialog kit here yet. Prefer `@sometic/react` when you need the full Wave A React surface (Preact compat may work for some apps, but this package is store-bind only).
- Use [`@sometic/store`](https://www.npmjs.com/package/@sometic/store) directly if you do not need the Preact snapshot/subscribe wrapper.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Preact](https://sometic.aitistack.com/frameworks/preact)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
