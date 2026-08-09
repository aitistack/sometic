# `@sometic/jquery`

jQuery adapters for Sometic (store bind, button plugin, destroy cleanup).

`@sometic/jquery` is a Wave C legacy-friendly integration. It exposes `createJQueryStoreBind` for shared store state, `bindJQueryButton` for imperative button binding, and `registerJQueryAdapters` which adds a `$.fn.someticButton` plugin with a `"destroy"` command. Behavior still comes from [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) and [`@sometic/store`](https://www.npmjs.com/package/@sometic/store); jQuery only owns selection and plugin ergonomics.

Many production apps still mix jQuery with progressive enhancement. Sometic supports that path without letting jQuery shape modern architecture. Engines remain framework-independent, imports stay free of `window` at load time, and destroy/dispose paths prevent leaked listeners when nodes are removed or rebound.

Standout features: store bind (`get` / `set` / `update` / `subscribe` / `dispose`); `bindJQueryButton` that replaces prior bindings on the same element; `registerJQueryAdapters($)` for `$("button").someticButton(options)` and `$("button").someticButton("destroy")`; and `jqueryAdapterCapabilities` (`storeBind`, `button`). Options may be a plain object or a getter function.

Ecosystem: Wave C with Alpine and HTMX. Contracts: [`@sometic/adapter-contract`](https://www.npmjs.com/package/@sometic/adapter-contract). Foundation: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Capability notes: [jQuery](https://sometic.aitistack.com/frameworks/jquery).

## Install

Peer (optional meta): `jquery` `^3.7`.

```bash
pnpm add @sometic/jquery jquery
```

```bash
npm install @sometic/jquery jquery
```

```bash
yarn add @sometic/jquery jquery
```

## Usage

Register the plugin and bind buttons:

```ts
import $ from "jquery";
import { createJQueryStoreBind, registerJQueryAdapters } from "@sometic/jquery";

registerJQueryAdapters($);

const ui = createJQueryStoreBind({ loading: false });

$("button.save").someticButton(() => ({
    loading: ui.get().loading,
    disabled: ui.get().loading,
}));
```

Destroy bindings when tearing down:

```ts
import $ from "jquery";
import { registerJQueryAdapters } from "@sometic/jquery";

registerJQueryAdapters($);
$("button.save").someticButton("destroy");
```

## Peers / when not to use

- Optional peer `jquery`. Pass your jQuery static into `registerJQueryAdapters`.
- Not a modern SPA component kit. Prefer `@sometic/react`, `@sometic/vue`, or `@sometic/elements` for new apps.
- If you do not use jQuery plugins, call `@sometic/dom` `bindButton` directly and skip this package.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [jQuery](https://sometic.aitistack.com/frameworks/jquery)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
