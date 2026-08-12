# Tabs

Accessible tablist with shared selection state. `Tabs` owns value (controlled or uncontrolled); `TabTrigger` and `TabPanel` read selection from context and resolve ARIA/`data-state` each render.

<PreviewTabs />

## Usage

::: code-group

```tsx [JS]
import { Tabs, TabTrigger, TabPanel } from "@sometic/react/structure";

export function Example() {
    return (
        <Tabs defaultValue="overview">
            <TabTrigger value="overview">Overview</TabTrigger>
            <TabTrigger value="api">API</TabTrigger>
            <TabPanel value="overview">Portable selection state.</TabPanel>
            <TabPanel value="api">Resolve emits ARIA for your CSS.</TabPanel>
        </Tabs>
    );
}
```

```tsx [TS]
import { Tabs, TabTrigger, TabPanel } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return (
        <Tabs defaultValue="overview">
            <TabTrigger value="overview">Overview</TabTrigger>
            <TabTrigger value="api">API</TabTrigger>
            <TabPanel value="overview">Portable selection state.</TabPanel>
            <TabPanel value="api">Resolve emits ARIA for your CSS.</TabPanel>
        </Tabs>
    );
}
```

```js [Vanilla]
import {
    createTabsController,
    resolveTabs,
    resolveTabTrigger,
    resolveTabPanel,
} from "@sometic/dom/tabs";

const root = document.querySelector("#tabs");
const listView = resolveTabs({ orientation: "horizontal" });
for (const [key, value] of Object.entries(listView.attributes)) {
    root.setAttribute(key, value);
}

const controller = createTabsController({
    defaultValue: "overview",
    onValueChange: (value) => {
        for (const trigger of root.querySelectorAll("[data-tab]")) {
            const selected = trigger.dataset.tab === value;
            const view = resolveTabTrigger({
                value: trigger.dataset.tab,
                selected,
                disabled: trigger.hasAttribute("disabled"),
            });
            for (const [key, attr] of Object.entries(view.attributes)) {
                trigger.setAttribute(key, attr);
            }
        }
        for (const panel of document.querySelectorAll("[data-panel]")) {
            const selected = panel.dataset.panel === value;
            panel.hidden = !selected;
            const view = resolveTabPanel({
                value: panel.dataset.panel,
                selected,
            });
            for (const [key, attr] of Object.entries(view.attributes)) {
                panel.setAttribute(key, attr);
            }
        }
    },
});

for (const trigger of root.querySelectorAll("[data-tab]")) {
    trigger.addEventListener("click", () => {
        if (!trigger.hasAttribute("disabled")) {
            controller.setValue(trigger.dataset.tab);
        }
    });
}
```

:::

> Custom element not shipped in this beta; use the DOM controller.

Custom element **not shipped** for Tabs. Vanilla uses `@sometic/dom/tabs`. React and Vue ship `Tabs` / `TabTrigger` / `TabPanel` from `@sometic/*/structure`.

## How it works

1. **Resolve**: `resolveTabs` (`role="tablist"`), `resolveTabTrigger` (`role="tab"`), `resolveTabPanel` (`role="tabpanel"`).
2. **Controller (`createTabsController`)**: controllable `value` string.
3. **React**: Tabs provides context; triggers call `setValue`; inactive panels return `null`.

## Anatomy

| Part       | Role       |
| ---------- | ---------- |
| Tabs       | `tablist`  |
| TabTrigger | `tab`      |
| TabPanel   | `tabpanel` |

## Props / attributes

### React `TabsProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded to the tablist root.

| Prop            | Type                         | Default        | Description          |
| --------------- | ---------------------------- | -------------- | -------------------- |
| `value`         | `string`                     | —              | Controlled selection |
| `defaultValue`  | `string`                     | `""`           | Uncontrolled initial |
| `onValueChange` | `(value: string) => void`    | —              | Selection changes    |
| `orientation`   | `"horizontal" \| "vertical"` | `"horizontal"` | `aria-orientation`   |
| `children`      | `ReactNode`                  | —              | Triggers and panels  |
| Native attrs    | remaining div HTML attrs     | —              | Forwarded to tablist |

### React `TabTriggerProps`

Extends `HTMLAttributes<HTMLButtonElement>` (native button attrs forwarded; rendered as `<button type="button">`).

| Prop         | Type                        | Default | Description              |
| ------------ | --------------------------- | ------- | ------------------------ |
| `value`      | `string`                    | —       | Tab id (required)        |
| `disabled`   | `boolean`                   | —       | Disables activation      |
| `controls`   | `string`                    | —       | Optional `aria-controls` |
| `children`   | `ReactNode`                 | —       | Label                    |
| Native attrs | remaining button HTML attrs | —       | Forwarded to the button  |

### React `TabPanelProps`

Extends `HTMLAttributes<HTMLDivElement>`. Remaining native div attrs are forwarded when the panel is selected.

| Prop         | Type                     | Default | Description                |
| ------------ | ------------------------ | ------- | -------------------------- |
| `value`      | `string`                 | —       | Matching tab id (required) |
| `labelledBy` | `string`                 | —       | Optional `aria-labelledby` |
| `children`   | `ReactNode`              | —       | Panel content              |
| Native attrs | remaining div HTML attrs | —       | Forwarded when selected    |

### Vue

`Tabs`, `TabTrigger`, and `TabPanel` from `@sometic/vue/structure`. Same props as React (`value`, `defaultValue`, `orientation`, `dir`, `lazyMount`, `forceMount`). Emits `update:value` and `valueChange`.

```vue
<script setup lang="ts">
import { Tabs, TabTrigger, TabPanel } from "@sometic/vue/structure";
</script>

<template>
    <Tabs default-value="overview">
        <TabTrigger value="overview">Overview</TabTrigger>
        <TabTrigger value="api">API</TabTrigger>
        <TabPanel value="overview">Portable tab selection with ARIA resolve.</TabPanel>
        <TabPanel value="api">createTabsController + resolveTabTrigger/Panel.</TabPanel>
    </Tabs>
</template>
```

### Custom element

**CE not shipped.** Use Vanilla DOM controller, React, or Vue.

## Events / callbacks

| Surface        | Event                          | Payload  |
| -------------- | ------------------------------ | -------- |
| React          | `onValueChange`                | `string` |
| Vue            | `valueChange` / `update:value` | `string` |
| Custom element | —                              | —        |
| DOM controller | `onValueChange`                | `string` |

`TabTrigger` also preserves native `onClick` (fires before selection update).

## Controlled vs uncontrolled

Pass `value` + `onValueChange` for controlled apps (routes, query params). Omit `value` and use `defaultValue` for local UI state.

## Accessibility

- Selected tab: `aria-selected="true"`, `tabindex="0"`.
- Inactive tabs: `tabindex="-1"`.
- Arrow / Home / End roving focus is built into adapters and `getTabsKeyboardTarget` / `bindTabsKeyboard` (RTL-aware for horizontal tabs).
- Inactive panels default to lazy mount in React/Vue (`lazyMount`); use `forceMount` to keep them in the DOM.

## Styling

Target `[role="tablist"]`, `[data-state="active"|"inactive"]`, `[aria-selected]`.

## When to use / When not

**Use** for in-page section switching.

**Do not use** for site navigation links (use links / [Breadcrumb](/components/breadcrumb)).

**Vs Radix / React Aria.** Choose Radix or React Aria when you are React-only and already invested. Choose Sometic when the same tab behavior must survive a framework change: one controller in `@sometic/dom`, unstyled resolve slots, React and Vue adapters.

## FAQ

**Must TabTrigger live under Tabs?** Yes. Context is required.

**Can panels stay mounted?** React returns `null` when inactive by default (`lazyMount`). Pass `forceMount` to keep DOM for CSS transitions or SSR hydration needs.

**Do Tabs own arrow-key roving focus?** Yes. Horizontal/vertical orientation and RTL reverse horizontal arrows. Home/End jump to first/last enabled tab. Adapters and `bindTabsKeyboard` / `getTabsKeyboardTarget` share the same rules.

**URL sync?** Opt-in via `syncTabsToUrl` (Vanilla) or React `urlParam` / `syncUrlHash`. No router dependency: you provide get/set for search params or hash.

**Is there an `sometic-tabs`?** No. CE not shipped.

**Vue components?** Yes. `@sometic/vue/structure`.

**Does React forward native attrs?** Yes: div attrs on Tabs/TabPanel, button attrs on TabTrigger.

**SSR?** No browser globals at import time. Create controllers and bind keyboard after hydration.

## Related links

- [Accordion](/components/accordion)
- [Controlled state](/concepts/controlled-state)
- [Styling slots](/concepts/styling-slots)
