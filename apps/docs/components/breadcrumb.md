# Breadcrumb

Navigation trail with `aria-label="Breadcrumb"` on the root and optional `aria-current="page"` on the current item. Pure resolve helpers; no open state.

<PreviewBreadcrumb />

## Usage

::: code-group

```tsx [React]
import { Breadcrumb, BreadcrumbItem } from "@sometic/react/structure";

export function Example(): JSX.Element {
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <a href="/">Docs</a>
            </BreadcrumbItem>
            <BreadcrumbItem>
                <a href="/components">Components</a>
            </BreadcrumbItem>
            <BreadcrumbItem current>Structure</BreadcrumbItem>
        </Breadcrumb>
    );
}
```

```vue [Vue]
<script setup>
import { Breadcrumb, BreadcrumbItem } from "@sometic/vue/structure";
</script>

<template>
    <Breadcrumb>
        <BreadcrumbItem>
            <a href="/">Docs</a>
        </BreadcrumbItem>
        <BreadcrumbItem>
            <a href="/components">Components</a>
        </BreadcrumbItem>
        <BreadcrumbItem current>Structure</BreadcrumbItem>
    </Breadcrumb>
</template>
```

```js [Vanilla]
import { resolveBreadcrumb, resolveBreadcrumbItem } from "@sometic/dom/breadcrumb";

const nav = document.querySelector("nav.breadcrumb");
const rootView = resolveBreadcrumb();
for (const [key, value] of Object.entries(rootView.attributes)) {
    nav.setAttribute(key, value);
}

for (const item of nav.querySelectorAll("li")) {
    const view = resolveBreadcrumbItem({
        current: item.hasAttribute("data-current"),
    });
    for (const [key, value] of Object.entries(view.attributes)) {
        item.setAttribute(key, value);
    }
}
```

```html [Custom Elements (Web Components)]
<!-- CE not shipped for this surface. Use React, Vue, or @sometic/dom (Vanilla) above. -->
```

```html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
```
:::

> Custom element not shipped in this beta; use the DOM controller.

Custom element **not shipped** for Breadcrumb. Vanilla uses `@sometic/dom/breadcrumb` resolve helpers (no controller: pure attributes). React and Vue ship `Breadcrumb` / `BreadcrumbItem` from `@sometic/*/structure`.

## How it works

`resolveBreadcrumb` / `resolveBreadcrumbItem` emit attributes only. React renders `<nav><ol>` with `<li>` items.

## Anatomy

| Part           | Element | Notes                          |
| -------------- | ------- | ------------------------------ |
| Breadcrumb     | `<nav>` | `aria-label="Breadcrumb"`      |
| List           | `<ol>`  | React wraps children           |
| BreadcrumbItem | `<li>`  | Optional `aria-current="page"` |

## Props / attributes

### React `BreadcrumbProps`

Extends `HTMLAttributes<HTMLElement>` (nav). Remaining native nav attrs are forwarded to the root.

| Prop         | Type                     | Default | Description            |
| ------------ | ------------------------ | ------- | ---------------------- |
| `children`   | `ReactNode`              | —       | `BreadcrumbItem` nodes |
| Native attrs | remaining nav HTML attrs | —       | Forwarded to `<nav>`   |

### React `BreadcrumbItemProps`

Extends `HTMLAttributes<HTMLLIElement>`. Remaining native `li` attrs are forwarded.

| Prop         | Type                    | Default | Description                |
| ------------ | ----------------------- | ------- | -------------------------- |
| `current`    | `boolean`               | `false` | Sets `aria-current="page"` |
| `children`   | `ReactNode`             | —       | Link or current page text  |
| Native attrs | remaining li HTML attrs | —       | Forwarded to `<li>`        |

### Vue

`Breadcrumb` and `BreadcrumbItem` from `@sometic/vue/structure`. `BreadcrumbItem` takes `current` (boolean).

```vue
<script setup lang="ts">
import { Breadcrumb, BreadcrumbItem } from "@sometic/vue/structure";
</script>

<template>
    <Breadcrumb>
        <BreadcrumbItem>
            <a href="/">Docs</a>
        </BreadcrumbItem>
        <BreadcrumbItem>
            <a href="/components">Components</a>
        </BreadcrumbItem>
        <BreadcrumbItem current>Structure</BreadcrumbItem>
    </Breadcrumb>
</template>
```

### Custom element

**CE not shipped.** Use Vanilla resolve helpers, React, or Vue.

## Events / callbacks

None beyond native link navigation and any handlers you attach via forwarded HTML attributes (`onClick`, etc.).

## Accessibility

- Exactly one current page item when representing location.
- Keep link text clear; do not rely on separators alone for meaning.

## Styling

Target `nav[aria-label="Breadcrumb"]`, `[data-current]`, list separators in CSS (`::after`).

## When to use / When not

**Use** for hierarchical location trails.

**Do not use** for in-page section switching ([Tabs](/components/tabs)).

## FAQ

**Controller?** No: pure resolve. No open/value state.

**Overflow / ellipsis?** Use `collapseBreadcrumbItems` / `resolveBreadcrumbEllipsis` from `@sometic/dom/breadcrumb`, and compose [Menu](/components/menu) for the ellipsis actions if needed.

**Is there an `sometic-breadcrumb`?** No. CE not shipped.

**Vue components?** Yes. `@sometic/vue/structure`.

**Does React forward native attrs?** Yes, onto `<nav>` and each `<li>`.

## Related links

- [Tabs](/components/tabs)
- [Accessibility](/guide/accessibility)
- [Styling slots](/concepts/styling-slots)
