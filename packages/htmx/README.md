# `@sometic/htmx`

HTMX adapters for Sometic (store bind, swap-safe button re-init).

`@sometic/htmx` is a Wave C HTML-first integration for hypermedia apps. It provides `createHtmxStoreBind` for shared state, `bindHtmxButton` for single-element button binding, and `createHtmxBinderRoot` which listens for `htmx:afterSettle`, re-scans registered selectors, and disposes bindings for disconnected nodes. Swaps replace DOM; this package makes Sometic button bindings survive those swaps without leaking.

HTMX pages need behavior that re-attaches after partial HTML updates. Sometic keeps button and store engines outside HTMX, then this adapter owns scan/register/dispose around settle events. Imports do not touch `window` at load time. You pass a root `ParentNode & EventTarget` (often `document.body`) when creating the binder root.

Standout features: store bind; `bindHtmxButton`; `createHtmxBinderRoot` with `register({ selector, bind })`, `scan(scope?)`, and `dispose()`; and `htmxAdapterCapabilities` (`storeBind`, `button`). Register a selector once; after each settle the root rebinds matching elements and prunes detached ones.

Ecosystem: Wave C with Alpine and jQuery. Contracts: [`@sometic/adapter-contract`](https://www.npmjs.com/package/@sometic/adapter-contract). Foundation: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Engines: [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Capability notes: [HTMX](https://sometic.aitistack.com/frameworks/htmx).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

Peer (optional meta): `htmx.org` `^2`.

```bash
pnpm add @sometic/htmx htmx.org
```

```bash
npm install @sometic/htmx htmx.org
```

```bash
yarn add @sometic/htmx htmx.org
```

## Usage

Swap-safe binder root:

```ts
import { bindHtmxButton, createHtmxBinderRoot, createHtmxStoreBind } from "@sometic/htmx";

const ui = createHtmxStoreBind({ loading: false });
const root = createHtmxBinderRoot(document.body);

root.register({
    selector: "button[data-sometic-button]",
    bind: (element) => {
        if (!(element instanceof HTMLButtonElement)) {
            return { disposed: true, dispose() {} };
        }
        return bindHtmxButton(element, () => ({
            loading: ui.get().loading,
        }));
    },
});
```

Manual scan after a non-HTMX DOM change:

```ts
import { createHtmxBinderRoot } from "@sometic/htmx";

const root = createHtmxBinderRoot(document.body);
root.scan(document.getElementById("panel") ?? document.body);
// later
root.dispose();
```

## Peers / when not to use

- Optional peer `htmx.org`. Load HTMX so `htmx:afterSettle` fires on your root.
- Not a React/Vue component kit. For SPA adapters use `@sometic/react` or `@sometic/vue`.
- Without HTMX swaps, prefer `@sometic/dom` bind helpers or Alpine/jQuery adapters instead of the settle scanner.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [HTMX](https://sometic.aitistack.com/frameworks/htmx)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
