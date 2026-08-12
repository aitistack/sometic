# Tree

Hierarchical single-select tree with expand/collapse, RTL-aware arrows, and optional lazy mounting of children. No virtualization in this beta: keep trees to a few hundred visible nodes or virtualize in your app.

<PreviewTree />

## Usage

::: code-group

```tsx [JS]
import { Tree } from "@sometic/react/structure";

const items = [
    {
        id: "docs",
        label: "Docs",
        children: [
            {
                id: "guide",
                label: "Guide",
                children: [
                    { id: "intro", label: "Introduction" },
                    { id: "install", label: "Installation" },
                ],
            },
            {
                id: "components",
                label: "Components",
                children: [
                    { id: "tabs", label: "Tabs" },
                    { id: "tree", label: "Tree" },
                ],
            },
        ],
    },
    {
        id: "packages",
        label: "Packages",
        children: [
            { id: "dom", label: "@sometic/dom" },
            { id: "react", label: "@sometic/react", disabled: true },
        ],
    },
];

export function Example() {
    return (
        <Tree
            items={items}
            defaultValue="tree"
            defaultExpanded={["docs", "guide", "components"]}
        />
    );
}
```

```tsx [TS]
import { Tree, type TreeItem } from "@sometic/react/structure";

const items: TreeItem[] = [
    {
        id: "docs",
        label: "Docs",
        children: [
            {
                id: "guide",
                label: "Guide",
                children: [
                    { id: "intro", label: "Introduction" },
                    { id: "install", label: "Installation" },
                ],
            },
            {
                id: "components",
                label: "Components",
                children: [
                    { id: "tabs", label: "Tabs" },
                    { id: "tree", label: "Tree" },
                ],
            },
        ],
    },
    {
        id: "packages",
        label: "Packages",
        children: [
            { id: "dom", label: "@sometic/dom" },
            { id: "react", label: "@sometic/react", disabled: true },
        ],
    },
];

export function Example(): JSX.Element {
    return (
        <Tree
            items={items}
            defaultValue="tree"
            defaultExpanded={["docs", "guide", "components"]}
        />
    );
}
```

```ts [Vanilla]
import { createTreeController, resolveTreeItem } from "@sometic/dom/tree";

const tree = createTreeController({
    items: [
        {
            id: "docs",
            label: "Docs",
            children: [
                {
                    id: "guide",
                    label: "Guide",
                    children: [{ id: "intro", label: "Introduction" }],
                },
            ],
        },
        {
            id: "packages",
            label: "Packages",
            children: [{ id: "dom", label: "@sometic/dom" }],
        },
    ],
    defaultValue: "tree",
    defaultExpanded: ["docs", "guide"],
});
for (const node of tree.getVisibleNodes()) {
    resolveTreeItem({
        id: node.item.id,
        level: node.level,
        hasChildren: node.hasChildren,
        selected: tree.isSelected(node.item.id),
        expanded: tree.isExpanded(node.item.id),
        ...(node.item.disabled === undefined ? {} : { disabled: node.item.disabled }),
    });
}
```

:::

### Vue

`Tree` from `@sometic/vue/structure`. Props: `items`, `value`, `defaultValue`, `expanded`, `defaultExpanded`, `dir`, `lazyMount`, `forceMount`. Emits `update:value` / `valueChange` and `update:expanded` / `expandedChange`.

```vue
<script setup lang="ts">
import { Tree, type TreeItem } from "@sometic/vue/structure";

const items: TreeItem[] = [
    {
        id: "docs",
        label: "Docs",
        children: [
            {
                id: "guide",
                label: "Guide",
                children: [
                    { id: "intro", label: "Introduction" },
                    { id: "install", label: "Installation" },
                ],
            },
            {
                id: "components",
                label: "Components",
                children: [
                    { id: "tabs", label: "Tabs" },
                    { id: "tree", label: "Tree" },
                ],
            },
        ],
    },
    {
        id: "packages",
        label: "Packages",
        children: [
            { id: "dom", label: "@sometic/dom" },
            { id: "react", label: "@sometic/react", disabled: true },
        ],
    },
];
</script>

<template>
    <Tree
        :items="items"
        default-value="tree"
        :default-expanded="['docs', 'guide', 'components']"
    />
</template>
```

## Keyboard

| Key | Behavior |
| --- | -------- |
| ArrowUp / ArrowDown | Move selection among visible nodes |
| ArrowRight (LTR) / ArrowLeft (RTL) | Expand, or move into first child |
| ArrowLeft (LTR) / ArrowRight (RTL) | Collapse, or move to parent |
| Home / End | First / last visible |
| Enter / Space | Select focused node |

## When to use / when not

| Use when | Prefer something else when |
| -------- | -------------------------- |
| Nested navigation / file trees | Flat lists → Tabs or Menu |
| Expand/collapse with single selection | Multi-select / drag-drop (deferred) |

**Vs React Aria Tree / Headless UI.** Prefer React Aria when you need multi-select, dense grid trees, or React-only depth today. Sometic Tree is single-select, no built-in virtualization, and honest about large-list limits. App chrome (navbars, sidebars) stays composition: layout + [Menu](/components/menu) + maybe Tree.

## Edges

- Disabled nodes are skipped by keyboard.
- `lazyMount` skips collapsed children DOM in adapters.
- Large trees: document app-owned virtualization; engine stays honest.

## FAQ

### Multi-select?

Deferred. Option A is single selection only.

### Virtualization?

Not in this phase. Keep visible trees modest, or virtualize outside the engine.

### Custom elements?

Not shipped. Use React, Vue, or `@sometic/dom/tree`.

## Related

- [Accordion](/components/accordion)
- [Menu](/components/menu)
