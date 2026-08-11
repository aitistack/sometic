# `@sometic/dom`

Framework-neutral DOM engines (controllers, view models, and bind helpers) that power Sometic adapters and custom elements.

`@sometic/dom` is the shared behavior layer for buttons, fields, inputs, selection controls, overlays, navigation structure, and feedback surfaces. It does not ship a visual design system. Controllers and resolvers produce view models, native-friendly attributes, and slot class/style maps so React, Vue, Vanilla, and Web Components can render the same behavior with their own markup.

Sometic keeps portable application behavior out of framework packages. Framework adapters stay thin and call into these engines instead of reimplementing press handling, field IDs, controlled input state, dialog focus, or toast queues per UI library. That split is why one accessibility and interaction model can travel across stacks without forking business logic.

Standout capabilities include resolve helpers (`resolveButton`, `resolveField`, `resolveDialog`), bind helpers for Vanilla (`bindButton`, `bindInput`, `bindCheckbox`, `bindSelect`), controllable controllers (`createInputController`, `createDialogController`, `createTabsController`, `createToastQueue`), and first-class slots/state attributes built on [`@sometic/styling`](https://www.npmjs.com/package/@sometic/styling) and [`@sometic/accessibility`](https://www.npmjs.com/package/@sometic/accessibility). Prefer intentional subpaths such as `@sometic/dom/button`, `@sometic/dom/field`, `@sometic/dom/input`, and `@sometic/dom/dialog` so consumers only pull the surface they need.

In the ecosystem, this package sits above [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) and is consumed by [`@sometic/react`](https://www.npmjs.com/package/@sometic/react), [`@sometic/vue`](https://www.npmjs.com/package/@sometic/vue), and [`@sometic/elements`](https://www.npmjs.com/package/@sometic/elements). Read the product model in the [introduction](https://sometic.aitistack.com/guide/introduction) and the DOM overview at [primitives/dom](https://sometic.aitistack.com/primitives/dom).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/primitives/dom)

```bash
pnpm add @sometic/dom
```

```bash
npm install @sometic/dom
```

```bash
yarn add @sometic/dom
```

## Usage

Resolve a button view model (classes, attributes, loading/disabled press guards):

```ts
import { bindButton, resolveButton } from "@sometic/dom/button";

const view = resolveButton({
    type: "button",
    loading: false,
    disabled: false,
    defaults: { className: "btn" },
    variants: { className: "btn--primary" },
});

const button = document.querySelector("button");
if (button) {
    bindButton(button, () => ({
        type: "button",
        defaults: { className: "btn" },
    }));
}
```

Drive a dialog with a disposable controller and resolve its open-state view model:

```ts
import { createDialogController } from "@sometic/dom/dialog";

const dialog = createDialogController({
    defaultOpen: false,
    getContent: () => document.querySelector("#confirm-panel"),
    getTrigger: () => document.querySelector("#confirm-trigger"),
    onOpenChange: (open) => {
        console.log("dialog open", open);
    },
});

const view = dialog.resolve({ size: "md" });
dialog.setOpen(true);
```

Field and input subpaths compose the same way (`@sometic/dom/field`, `@sometic/dom/input`) for labels, described-by IDs, and controllable values without importing the full root barrel.

## Peers / when not to use

There are no framework peer dependencies. Runtime deps include `@sometic/core`, `@sometic/accessibility`, `@sometic/styling`, `@sometic/positioning`, and `@sometic/date-core` (for date input engines).

Skip `@sometic/dom` when you only need foundation primitives (`@sometic/core`) or a framework component package and never plan to call engines yourself. Prefer [`@sometic/elements`](https://www.npmjs.com/package/@sometic/elements) or framework adapters if you want ready-made tags/components rather than binding controllers by hand.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [DOM primitives](https://sometic.aitistack.com/primitives/dom)
- [Vanilla framework guide](https://sometic.aitistack.com/frameworks/vanilla)
- [Components](https://sometic.aitistack.com/components/)

## License

MIT
