# Structure FAQ

## What is in the structure family?

Tabs, Accordion, Breadcrumb, Command palette, and Tree engines in `@sometic/dom`, with React and Vue adapters under `@sometic/*/structure`. Feedback CEs (badge/progress/spinner/skeleton) also live in the elements structure barrel.

## Do Tabs own arrow-key roving focus?

Yes. Horizontal/vertical orientation and RTL reverse horizontal arrows. Home/End jump to first/last enabled tab. Adapters and `bindTabsKeyboard` / `getTabsKeyboardTarget` share the same rules.

## Lazy mount?

Tabs and Accordion default to `lazyMount` in adapters (inactive panels are not mounted). Pass `forceMount` to keep DOM for CSS transitions or SSR hydration needs.

## URL sync for Tabs?

Opt-in via `syncTabsToUrl` (Vanilla) or React `urlParam` / `syncUrlHash`. No router dependency: you provide get/set for search params or hash.

## Vue components?

Yes for Tabs, Accordion, Breadcrumb, CommandPalette, and Tree. They mirror React props/events (`update:value`, `valueChange`, and so on).

## Are structure custom elements shipped?

No for Tabs/Accordion/Breadcrumb/Command/Tree. Use React, Vue, or DOM controllers. Feedback CEs remain available.

## Command palette vs Combobox vs Menu?

| Need | Use |
| ---- | --- |
| Modal quick actions | Command palette |
| Inline filterable field | Combobox |
| Anchored action list | Menu |

## Tree virtualization?

Not in this phase. Keep visible trees modest, or virtualize outside the engine.

## Breadcrumb overflow?

Use `collapseBreadcrumbItems` / `resolveBreadcrumbEllipsis` from `@sometic/dom/breadcrumb`, and compose [Menu](/components/menu) for the ellipsis actions if needed.

## SSR?

No browser globals at import time. Create controllers and bind keyboard in the browser (or onMounted / useEffect).
