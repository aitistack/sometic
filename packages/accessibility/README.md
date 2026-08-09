# `@sometic/accessibility`

Focus, keyboard, dismissable, portal, scroll-lock, announcer, and observer primitives for accessible Sometic UIs.

`@sometic/accessibility` ships framework-independent helpers such as `createFocusTrap`, `createKeyboardBindings`, `createDismissableLayer`, `createPortalRoot`, `lockBodyScroll`, `createLiveAnnouncer`, and resize/intersection/mutation observers. Each surface returns disposables aligned with [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) so overlays and fields clean up listeners and restored focus correctly.

Sometic is portable application behavior, not a visual kit. Accessibility engines must work the same in React, Vue, Vanilla, and Web Components: trap focus in a dialog, dismiss on Escape or outside press, announce status changes, and lock scroll without duplicating logic per adapter. This package holds that shared behavior so thin adapters only bind elements and lifecycle.

Standout features include focusable/tabbable queries, looping focus traps with return-focus, stacked dismissable layers, portal roots, body scroll lock, polite/assertive live regions, and observer helpers that never touch `window` or `document` at import time. Tree-shake via subpaths: `/focus`, `/keyboard`, `/dismissable`, `/portal`, `/scroll-lock`, `/announcer`, `/observers`.

In the ecosystem, accessibility sits under DOM controllers, overlays, and form feedback. Combine with [`@sometic/positioning`](https://www.npmjs.com/package/@sometic/positioning) for anchored surfaces and [`@sometic/styling`](https://www.npmjs.com/package/@sometic/styling) for state attributes. Docs intro: [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction).

## Install

```bash
pnpm add @sometic/accessibility
```

```bash
npm install @sometic/accessibility
```

```bash
yarn add @sometic/accessibility
```

## Usage

Focus trap plus dismissable layer for an overlay:

```ts
import {
    createDismissableLayer,
    createFocusTrap,
} from "@sometic/accessibility";

const dialog = document.querySelector<HTMLElement>("#dialog");
if (!dialog) {
    throw new Error("missing dialog");
}

const trap = createFocusTrap({
    container: dialog,
    initialFocus: "first",
    returnFocus: true,
});

const dismiss = createDismissableLayer({
    getElement: () => dialog,
    onDismiss: (reason) => {
        console.log(reason);
        trap.deactivate();
        dismiss.deactivate();
    },
});

trap.activate();
dismiss.activate();
```

Live announcements and keyboard bindings:

```ts
import {
    createKeyboardBindings,
    createLiveAnnouncer,
} from "@sometic/accessibility";

const announcer = createLiveAnnouncer({ politeness: "polite" });
announcer.announce("Saved");

const bindings = createKeyboardBindings(
    [
        {
            key: "Escape",
            handler: () => {
                announcer.announce("Cancelled", { politeness: "assertive" });
            },
        },
    ],
    { target: () => document },
);

bindings.attach();
```

## Peers / when not to use

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). No framework peers. Do not use this package as a full ARIA widget set or as a replacement for native HTML semantics (buttons, labels, dialogs) when the platform already does the job. Prefer calling these helpers from DOM engines and adapters rather than reimplementing focus traps inside each framework.

## Docs

- Introduction: [https://sometic.aitistack.com/guide/introduction](https://sometic.aitistack.com/guide/introduction)
- Accessibility guide: [https://sometic.aitistack.com/guide/accessibility](https://sometic.aitistack.com/guide/accessibility)
- Accessibility primitives: [https://sometic.aitistack.com/primitives/accessibility](https://sometic.aitistack.com/primitives/accessibility)
- Core on npm: [https://www.npmjs.com/package/@sometic/core](https://www.npmjs.com/package/@sometic/core)
- Accessibility on npm: [https://www.npmjs.com/package/@sometic/accessibility](https://www.npmjs.com/package/@sometic/accessibility)

## License

MIT
