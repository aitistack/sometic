# `@sometic/adapter-contract`

Shared framework adapter contract types, fixtures, and test helpers for Sometic.

`@sometic/adapter-contract` is the small shared vocabulary that keeps React, Vue, Vanilla, Wave B store binds, and Wave C HTML-first adapters honest about the same capabilities. It exports framework ids, capability unions, manifest lists (`WAVE_A_MANIFESTS`, `WAVE_B_MANIFESTS`, `WAVE_C_MANIFESTS`), lifecycle/SSR contract types, and helpers such as `assertManifestCapabilities`, store-bind fixtures, and `assertNoImportTimeWindowAccess`.

Adapters must stay thin. Without a shared contract it is easy for one framework package to claim “form” or “auth” support while another silently omits it, or to touch `window` at import time and break SSR. This package exists so tests and tooling can assert manifests, controlled-value shapes, and dispose/rebind fixtures against a single source of truth rooted in [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) and [`@sometic/store`](https://www.npmjs.com/package/@sometic/store).

Standout exports include `AdapterFrameworkId`, `AdapterCapability`, `AdapterManifest`, `ControlledValueContract`, `AdapterLifecycleContract`, `AdapterSsrContract`, wave manifest arrays, `assertManifestCapabilities`, `createStoreBindFixture`, `createDisposeRebindFixture`, and `assertNoImportTimeWindowAccess(false)`. Wave A manifests list React, Vue, Vanilla (`@sometic/dom`), and Elements. Wave B lists Angular, Svelte, Solid, Preact (store bind). Wave C lists Alpine, jQuery, HTMX (store bind + button).

Most application code never imports this package directly. Adapter maintainers and Sometic’s own tests do. Application developers still benefit: capability claims in docs and packages stay aligned. Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Adapter model: [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

Usually a transitive dependency of adapters. Install directly for adapter tests or custom adapters:

```bash
pnpm add @sometic/adapter-contract
```

```bash
npm install @sometic/adapter-contract
```

```bash
yarn add @sometic/adapter-contract
```

## Usage

Assert a manifest claims required capabilities:

```ts
import { WAVE_A_MANIFESTS, assertManifestCapabilities } from "@sometic/adapter-contract";

const react = WAVE_A_MANIFESTS.find((item) => item.id === "react")!;
assertManifestCapabilities(react, ["button", "form", "auth"]);
```

Fixtures and SSR import guard:

```ts
import {
    assertNoImportTimeWindowAccess,
    createDisposeRebindFixture,
    createStoreBindFixture,
} from "@sometic/adapter-contract";

assertNoImportTimeWindowAccess(false);

const storeFixture = createStoreBindFixture({ count: 0 });
const lifecycle = createDisposeRebindFixture();

console.log(storeFixture.increments, lifecycle.bindCount);
```

## Peers / when not to use

- No framework peers. Depends on `@sometic/core` and `@sometic/store` for shared typing/fixtures.
- Do not use this as an application UI package. Import `@sometic/react`, `@sometic/vue`, or another adapter instead.
- Skip unless you write or test adapters, or need capability manifests in tooling.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- [Frameworks](https://sometic.aitistack.com/frameworks/)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
