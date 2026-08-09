# `@sometic/styling`

Class, style, slot, and state-attribute resolvers for unstyled Sometic primitives.

`@sometic/styling` is the styling contract layer for Sometic. It resolves class tokens, inline styles, CSS variables, polymorphic `as` targets, `data-slot` attributes, and state attributes (`data-disabled`, `data-loading`, and friends) without bundling Tailwind, Bootstrap, or any CSS runtime. Adapters and components call resolvers; you own the visual system.

Sometic is portable application behavior, not a visual kit. Components ship unstyled by default so every stack (React, Vue, Vanilla, Web Components) can share one behavior engine while applying your design tokens and class strategies. This package exists so class merging, override priority, and slot naming stay identical across frameworks instead of drifting into per-adapter string hacks.

Standout features include `resolveClasses` / `createClassResolver`, `resolveStyles` and `resolveCssVariables`, layered `resolveStyleable` with documented override priority (`behavior` → `defaults` → `variants` → `state` → `user` → `cssVariables`), `defineSlots` / `createSlotAttributes`, `resolveStateAttributes`, and `resolvePolymorphicAs`. Subpaths (`@sometic/styling/classes`, `/styles`, `/slots`, `/state`, `/polymorphic`) keep imports tree-shakeable.

In the ecosystem, styling pairs with [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme) for tokens and CSS variables, and with DOM/component packages that expose slots. It does not depend on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) at runtime, but sits in the same foundation story documented at [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction) and the styling guide.

## Install

One-click **Copy** controls (npm package pages cannot host clipboard buttons):

[Copy install commands on the docs](https://sometic.aitistack.com/guide/installation)

```bash
pnpm add @sometic/styling
```

```bash
npm install @sometic/styling
```

```bash
yarn add @sometic/styling
```

## Usage

Resolve layered class and style props:

```ts
import { resolveStyleable, resolveStateAttributes } from "@sometic/styling";

const { className, style } = resolveStyleable({
    defaults: { className: "btn", style: { display: "inline-flex" } },
    variants: { className: "btn--primary" },
    state: { className: "is-loading" },
    user: { className: ["my-btn", false && "hidden"] },
    cssVariables: { "--btn-pad": "0.75rem" },
});

const attrs = resolveStateAttributes({
    disabled: false,
    loading: true,
    size: "md",
    variant: "primary",
});
```

Slots for part styling:

```ts
import { createSlotAttributes, defineSlots, pickSlotValue } from "@sometic/styling";

const slots = defineSlots(["root", "label", "icon"] as const);

const rootAttrs = createSlotAttributes("root");
const labelClass = pickSlotValue({ root: "field", label: "field__label" }, "label");

console.log(slots, rootAttrs, labelClass);
```

## Peers / when not to use

No peer dependencies. Do not use this package as a CSS framework or theme engine (use [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme) for runtime tokens). Skip it if you only need a one-off `classnames` helper outside Sometic components. Prefer its resolvers whenever you build or wrap unstyled Sometic surfaces so override order stays consistent.

## Docs

- Introduction: [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction)
- Styling guide: [https://sometic.aitistack.com/guide/styling](https://sometic.aitistack.com/guide/styling)
- Styling primitives: [https://sometic.aitistack.com/primitives/styling](https://sometic.aitistack.com/primitives/styling)
- Styling slots: [https://sometic.aitistack.com/concepts/styling-slots](https://sometic.aitistack.com/concepts/styling-slots)
- State attributes: [https://sometic.aitistack.com/concepts/state-attributes](https://sometic.aitistack.com/concepts/state-attributes)
- Core on npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)
- Styling on npm: [https://www.npmjs.com/package/@sometic/styling](https://www.npmjs.com/package/@sometic/styling)

## License

MIT
