# Accessibility

`@sometic/accessibility` provides framework-neutral DOM accessibility engines that components and adapters compose. Prefer these helpers over ad hoc focus / dismiss / announce logic in every widget.

## Overview

| Module                 | Import                              | Purpose                                      |
| ---------------------- | ----------------------------------- | -------------------------------------------- |
| Focus trap / tab order | `@sometic/accessibility/focus`       | Contain focus; restore to trigger            |
| Keyboard bindings      | `@sometic/accessibility/keyboard`    | Declarative key matchers                     |
| Dismissable layer      | `@sometic/accessibility/dismissable` | Escape / outside dismiss stacking            |
| Portal root            | `@sometic/accessibility/portal`      | Mount overlay hosts outside ancestors        |
| Scroll lock            | `@sometic/accessibility/scroll-lock` | Lock body scroll with scrollbar compensation |
| Live announcer         | `@sometic/accessibility/announcer`   | Polite / assertive `aria-live`               |
| Observers              | `@sometic/accessibility/observers`   | Resize / intersection / mutation helpers     |

### When to use

Building overlays, dialogs, popovers, tooltips, toasts, or any interactive surface that needs focus containment, Escape/outside dismiss, scroll locking, or screen-reader announcements.

### When not to use

- Prefer native `<button>`, `<dialog>`, labels, and focus order first; engines fill gaps, they do not replace natives
- Full WCAG certification is not “shipping these helpers alone”
- Application state and auth are unrelated packages

## Installation

::: code-group

```bash [npm]
npm install @sometic/accessibility
```

```bash [pnpm]
pnpm add @sometic/accessibility
```

```bash [yarn]
yarn add @sometic/accessibility
```

```bash [bun]
bun add @sometic/accessibility
```

:::

## Usage

### Focus trap

```ts
import { createFocusTrap, getTabbableElements } from "@sometic/accessibility/focus";

const trap = createFocusTrap({
    container: () => document.getElementById("dialog"),
    loop: true,
    initialFocus: "first",
    returnFocus: true,
});

trap.activate();
// …
trap.deactivate();
trap.dispose();
```

### Keyboard bindings

```ts
import { createKeyboardBindings, onKey } from "@sometic/accessibility/keyboard";

const bindings = createKeyboardBindings(
    [
        {
            key: "Escape",
            handler: () => {
                /* close */
            },
        },
    ],
    { target: window, eventName: "keydown" },
);

bindings.attach();
bindings.detach();
bindings.dispose();

const stop = onKey(window, {
    key: "Enter",
    handler: () => {
        /* submit shortcut */
    },
});
stop.dispose();
```

### Dismissable + scroll lock + announcer

```ts
import { createDismissableLayer } from "@sometic/accessibility/dismissable";
import { lockBodyScroll } from "@sometic/accessibility/scroll-lock";
import { createLiveAnnouncer } from "@sometic/accessibility/announcer";
import { createPortalRoot } from "@sometic/accessibility/portal";

const portal = createPortalRoot({ id: "sometic-overlays" });
portal.ensure();

const unlock = lockBodyScroll();
const layer = createDismissableLayer({
    getElement: () => document.getElementById("dialog"),
    onDismiss: (reason) => {
        console.log(reason);
        unlock.dispose();
    },
    escapeDeactivates: true,
    outsidePress: true,
});
layer.activate();

const announcer = createLiveAnnouncer();
announcer.announce("Saved", { politeness: "polite" });
```

## Key APIs

| Export                                                                  | Role                                    |
| ----------------------------------------------------------------------- | --------------------------------------- |
| `createFocusTrap` / `createFocusScope`                                  | Activate / deactivate focus containment |
| `getFocusableElements` / `getTabbableElements`                          | Query tab order                         |
| `createKeyboardBindings` (`attach` / `detach`) / `matchesKey` / `onKey` | Key routing                             |
| `createDismissableLayer`                                                | Stacked Escape / outside dismiss        |
| `createPortalRoot`                                                      | Ensure a portal host element            |
| `lockBodyScroll`                                                        | Disposable body scroll lock             |
| `createLiveAnnouncer`                                                   | `announce(message, { politeness? })`    |
| `observeResize` / `observeIntersection` / `observeMutations`            | Observer wrappers returning disposables |

Root `@sometic/accessibility` re-exports the same surfaces for convenience. Prefer subpaths when tree-shaking matters.

## Screen-reader relationships

| Engine         | Assistive role                                                                |
| -------------- | ----------------------------------------------------------------------------- |
| Focus trap     | Keeps keyboard focus inside a modal surface; restores focus to the trigger    |
| Live announcer | Polite / assertive status updates via `aria-live`                             |
| Dismissable    | Escape / outside close; pair with a visible close control and labelled dialog |

## How it works

Document, body, and observers are resolved lazily inside factories and `activate` / `ensure` / `announce`. No browser globals at import time. Nested dismissable layers and focus traps stack; only the top dismissable layer handles Escape / outside.

## Edge cases

| Edge                        | Behavior                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------- |
| SSR / missing `document`    | Factories return inert / no-op behavior                                            |
| Nested dialogs              | Stack layers; only the top dismissable handles Escape                              |
| Scrollbar gap               | `lockBodyScroll` adds padding when `innerWidth - clientWidth` is measurable        |
| Announcer disposed too soon | Message may never be heard; keep announcer alive briefly after announce            |
| Native `<dialog>`           | Prefer it when it fits; trap helps custom overlays and cross-framework consistency |

## FAQ

### Import-time browser access?

No. Globals are resolved lazily inside factories and activate paths.

### Does focus trap replace `<dialog>`?

No. Prefer native dialog when it fits. The trap helps custom overlays and consistent adapter behavior.

### Are these WCAG certified?

No. They are building blocks. Automated axe checks and manual screen-reader review remain required for Level 2+ components.

### Announcer not heard?

Ensure `announce` runs after a user action; keep messages concise; do not dispose immediately. Choose polite vs assertive per call.

### Guide for product a11y?

See [Guide: accessibility](/guide/accessibility) and component pages under [Components](/components/).

## Related

- [Guide: accessibility](/guide/accessibility)
- [DOM engines](/primitives/dom)
- [Positioning](/primitives/positioning)
- [Dialog](/components/dialog)
- [Popover](/components/popover)
- [Toast](/components/toast)
- [Package index](/api/packages)
