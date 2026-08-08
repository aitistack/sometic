# Breadcrumb

Navigation trail with `aria-label="Breadcrumb"` on the root and optional `aria-current="page"` on the current item. Pure resolve helpers; no open state.

<PreviewBreadcrumb />

## Usage

::: code-group

```tsx [JS]
import { Breadcrumb, BreadcrumbItem } from "@sometic/react/structure";

export function Example() {
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <a href="/">Docs</a>
            </BreadcrumbItem>
            <BreadcrumbItem>
                <a href="/components">Components</a>
            </BreadcrumbItem>
            <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
        </Breadcrumb>
    );
}
```

```tsx [TS]
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
            <BreadcrumbItem current>Breadcrumb</BreadcrumbItem>
        </Breadcrumb>
    );
}
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

:::

> Custom element not shipped in this beta; use the DOM controller.

Custom element **not shipped** for Breadcrumb. Vanilla uses `@sometic/dom/breadcrumb` resolve helpers (no controller — pure attributes). React + DOM are primary; Vue re-exports resolve helpers only.

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

No Vue Breadcrumb components. `@sometic/vue/structure` re-exports resolve helpers. Prefer React or Vanilla resolve.

### Custom element

**CE not shipped.** Use Vanilla resolve helpers or React.

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

**Controller?** No — pure resolve. No open/value state.

**Is there an `sometic-breadcrumb`?** No. CE not shipped.

**Vue components?** Not shipped. React + DOM primary.

**Does React forward native attrs?** Yes, onto `<nav>` and each `<li>`.

## Related links

- [Tabs](/components/tabs)
- [Accessibility](/guide/accessibility)
- [Styling slots](/concepts/styling-slots)
