# `@sometic/elements`

Vanilla custom elements (`sometic-*`) powered by Sometic DOM engines.

`@sometic/elements` registers light-DOM-first Web Components that wrap the same controllers and resolvers used by framework adapters. Tags such as `sometic-button`, `sometic-input`, `sometic-dialog`, and `sometic-form` give HTML-first apps (or progressive enhancement stacks) a component surface without pulling React or Vue.

These elements exist so Vanilla, HTMX-adjacent, and multi-framework teams can share one behavior model. Engines live in [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom); elements are a thin custom-element shell that maps attributes, slots, and `sometic-*` events onto those engines. Optional Shadow DOM is available via a `shadow` attribute where supported, but Light DOM remains the default for form association and consumer styling.

Standout features include grouped registration helpers (`registerButtonElements`, `registerInputElements`, `registerOverlayElements`, …), typed custom events (`SometicValueChangeDetail`, `SometicFormSubmitDetail`, `SometicOpenChangeDetail`), and subpath imports (`@sometic/elements/button`, `@sometic/elements/input`, `@sometic/elements/form`, `@sometic/elements/overlay`) so you only register the families you need. Side-effect imports define the `sometic-*` tags once per registry.

Ecosystem placement: elements depend on [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom), [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms), [`@sometic/validation`](https://www.npmjs.com/package/@sometic/validation), and [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth) for status/form wiring, while foundation utilities come from [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Start with the [introduction](https://sometic.aitistack.com/guide/introduction) and the [Vanilla guide](https://sometic.aitistack.com/frameworks/vanilla).

## Install

```bash
pnpm add @sometic/elements
```

```bash
npm install @sometic/elements
```

```bash
yarn add @sometic/elements
```

## Usage

Register button elements, then use them in HTML:

```ts
import { registerButtonElements } from "@sometic/elements/button";

registerButtonElements();
```

```html
<sometic-button type="button" size="md" variant="primary"> Save </sometic-button>

<sometic-async-button> Run action </sometic-async-button>
```

Register overlays and listen for open changes:

```ts
import { registerOverlayElements, type SometicOpenChangeDetail } from "@sometic/elements/overlay";

registerOverlayElements();

const dialog = document.querySelector("sometic-dialog");
dialog?.addEventListener("open-change", (event) => {
    const detail = (event as CustomEvent<SometicOpenChangeDetail>).detail;
    console.log("open", detail.open);
});
```

## Peers / when not to use

No framework peers. Dependencies include `@sometic/dom`, `@sometic/forms`, `@sometic/validation`, `@sometic/auth`, and date packages for date inputs.

Prefer framework adapters ([`@sometic/react`](https://www.npmjs.com/package/@sometic/react), [`@sometic/vue`](https://www.npmjs.com/package/@sometic/vue)) when you want JSX/SFC components with framework lifecycle. Prefer raw [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) when you need controllers without custom elements. Do not import element side-effect barrels on the server without a custom-elements-safe guard.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Vanilla / Web Components](https://sometic.aitistack.com/frameworks/vanilla)
- [DOM engines](https://sometic.aitistack.com/primitives/dom)
- [Components](https://sometic.aitistack.com/components/)

## License

MIT
