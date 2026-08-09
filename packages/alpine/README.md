# `@sometic/alpine`

Alpine.js adapters for Sometic (store bind, button bind, lifecycle cleanup).

`@sometic/alpine` is a Wave C HTML-first integration. It connects Alpine’s directive lifecycle to Sometic engines: `createAlpineStoreBind` over [`@sometic/store`](https://www.npmjs.com/package/@sometic/store), `bindAlpineButton` over [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) button binding, and `createAlpineSometicPlugin` which registers an `x-sometic-button` directive that disposes on Alpine cleanup. It is experimental and intentionally smaller than React/Vue adapters.

Sometic supports stacks that start from markup, not only SPA frameworks. Alpine apps often sprinkle behavior onto server-rendered HTML. This package keeps button resolution and store state in shared engines while Alpine owns element lifecycle. No browser globals are read at import time; cleanup hooks keep bindings disposable when nodes leave the page.

Standout features: store bind with `get` / `set` / `update` / `subscribe` / `dispose`; `bindAlpineButton(element, getOptions, cleanup?)` for imperative use; `createAlpineSometicPlugin(getButtonOptions?)` for declarative `x-sometic-button`; and `alpineAdapterCapabilities` (`storeBind`, `button`). Pass Alpine’s `cleanup` so bindings dispose with the directive.

Ecosystem: Wave C with jQuery and HTMX. Contracts: [`@sometic/adapter-contract`](https://www.npmjs.com/package/@sometic/adapter-contract). Foundation: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Capability notes: [Alpine.js](https://sometic.aitistack.com/frameworks/alpine).

## Install

Peer (optional meta): `alpinejs` `^3.14`.

```bash
pnpm add @sometic/alpine alpinejs
```

```bash
npm install @sometic/alpine alpinejs
```

```bash
yarn add @sometic/alpine alpinejs
```

## Usage

Store bind + Alpine plugin:

```ts
import Alpine from "alpinejs";
import {
    createAlpineSometicPlugin,
    createAlpineStoreBind,
} from "@sometic/alpine";

const ui = createAlpineStoreBind({ busy: false });

Alpine.plugin(
    createAlpineSometicPlugin(() => ({
        loading: ui.get().busy,
        disabled: ui.get().busy,
    })),
);

Alpine.start();
```

Imperative button bind (pass Alpine’s `cleanup` when inside a directive):

```ts
import { bindAlpineButton } from "@sometic/alpine";

const button = document.querySelector("button")!;
const binding = bindAlpineButton(button, () => ({ loading: false }));
// later, or via Alpine cleanup: bindAlpineButton(el, getOptions, utilities.cleanup)
binding.dispose();
```

Markup for the plugin directive: `<button type="button" x-sometic-button>Save</button>`.

## Peers / when not to use

- Optional peer `alpinejs`. Install Alpine in the page or bundle before registering the plugin.
- Not a full form/auth/overlay kit. For SPA component adapters use `@sometic/react` or `@sometic/vue`. For custom elements use `@sometic/elements`.
- Skip if you only need DOM controllers without Alpine: use `@sometic/dom` directly.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Alpine.js](https://sometic.aitistack.com/frameworks/alpine)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
