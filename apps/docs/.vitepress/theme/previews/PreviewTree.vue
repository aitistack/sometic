<script setup lang="ts">
import { computed, ref } from "vue";
import DemoFrame from "../components/DemoFrame.vue";

type DemoTreeItem = {
    id: string;
    label: string;
    disabled?: boolean;
    children?: DemoTreeItem[];
};

type VisibleNode = {
    item: DemoTreeItem;
    level: number;
    hasChildren: boolean;
    parentId?: string;
};

const items: DemoTreeItem[] = [
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

const selected = ref("tree");
const expanded = ref(new Set(["docs", "guide", "components"]));

function flatten(
    nodes: DemoTreeItem[],
    open: Set<string>,
    level: number,
    parentId?: string,
): VisibleNode[] {
    const out: VisibleNode[] = [];
    for (const item of nodes) {
        const children = item.children ?? [];
        const hasChildren = children.length > 0;
        const row: VisibleNode = { item, level, hasChildren };
        if (parentId !== undefined) {
            row.parentId = parentId;
        }
        out.push(row);
        if (hasChildren && open.has(item.id)) {
            out.push(...flatten(children, open, level + 1, item.id));
        }
    }
    return out;
}

const visible = computed(() => flatten(items, expanded.value, 1));

function toggleExpanded(id: string): void {
    const next = new Set(expanded.value);
    if (next.has(id)) {
        next.delete(id);
    } else {
        next.add(id);
    }
    expanded.value = next;
}

function treeLevelStyle(level: number): Record<string, string> {
    return { "--pg-tree-level": String(level) };
}

function onRowClick(node: VisibleNode): void {
    if (node.item.disabled === true) {
        return;
    }
    selected.value = node.item.id;
    if (node.hasChildren) {
        toggleExpanded(node.item.id);
    }
}

function onKeydown(event: KeyboardEvent): void {
    const nodes = visible.value.filter((node) => node.item.disabled !== true);
    if (nodes.length === 0) {
        return;
    }
    const index = nodes.findIndex((node) => node.item.id === selected.value);
    const current = index >= 0 ? nodes[index] : nodes[0];
    if (!current) {
        return;
    }
    const safeIndex = index >= 0 ? index : 0;
    const key = event.key;

    if (key === "ArrowDown") {
        event.preventDefault();
        const next = nodes[Math.min(nodes.length - 1, safeIndex + 1)];
        if (next) {
            selected.value = next.item.id;
        }
        return;
    }
    if (key === "ArrowUp") {
        event.preventDefault();
        const next = nodes[Math.max(0, safeIndex - 1)];
        if (next) {
            selected.value = next.item.id;
        }
        return;
    }
    if (key === "Home") {
        event.preventDefault();
        const first = nodes[0];
        if (first) {
            selected.value = first.item.id;
        }
        return;
    }
    if (key === "End") {
        event.preventDefault();
        const last = nodes[nodes.length - 1];
        if (last) {
            selected.value = last.item.id;
        }
        return;
    }
    if (key === "ArrowRight") {
        event.preventDefault();
        if (!current.hasChildren) {
            return;
        }
        if (!expanded.value.has(current.item.id)) {
            toggleExpanded(current.item.id);
            return;
        }
        const child = nodes.find((node) => node.parentId === current.item.id);
        if (child) {
            selected.value = child.item.id;
        }
        return;
    }
    if (key === "ArrowLeft") {
        event.preventDefault();
        if (current.hasChildren && expanded.value.has(current.item.id)) {
            toggleExpanded(current.item.id);
            return;
        }
        if (current.parentId) {
            selected.value = current.parentId;
        }
        return;
    }
    if (key === "Enter" || key === " ") {
        event.preventDefault();
        selected.value = current.item.id;
    }
}
</script>

<template>
    <DemoFrame title="Preview" hint="Tree" stack>
        <div class="pg-tree" role="tree" tabindex="0" @keydown="onKeydown">
            <button
                v-for="node in visible"
                :key="node.item.id"
                type="button"
                class="pg-tree-item"
                role="treeitem"
                :aria-selected="selected === node.item.id"
                :aria-level="node.level"
                :aria-expanded="node.hasChildren ? String(expanded.has(node.item.id)) : undefined"
                :aria-disabled="node.item.disabled === true ? 'true' : undefined"
                :data-state="selected === node.item.id ? 'selected' : 'unselected'"
                :disabled="node.item.disabled === true"
                :style="treeLevelStyle(node.level)"
                @click="onRowClick(node)"
            >
                {{ node.item.label }}
            </button>
        </div>
    </DemoFrame>
</template>
