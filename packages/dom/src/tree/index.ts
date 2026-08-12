import { createControllableState, type ControllableState } from "@sometic/core/controllable-state";
import type { ClassMerger, ClassValue } from "@sometic/styling/classes";
import { resolveStyleable, type StyleableProps, type StyleValue } from "@sometic/styling";

export type TreeItem = {
    id: string;
    label: string;
    disabled?: boolean;
    children?: TreeItem[];
};

export type ResolveTreeOptions = StyleableProps<"root"> & {
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type TreeViewModel = {
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveTree(options: ResolveTreeOptions = {}): TreeViewModel {
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "tree",
            "data-slot": "root",
        },
    };
}

export type ResolveTreeItemOptions = StyleableProps<"root"> & {
    id: string;
    selected?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    level?: number;
    hasChildren?: boolean;
    defaults?: { className?: ClassValue; style?: StyleValue };
    variants?: { className?: ClassValue; style?: StyleValue };
    merge?: ClassMerger;
};

export type TreeItemViewModel = {
    id: string;
    selected: boolean;
    expanded: boolean;
    disabled: boolean;
    level: number;
    hasChildren: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
};

export function resolveTreeItem(options: ResolveTreeItemOptions): TreeItemViewModel {
    const selected = options.selected === true;
    const expanded = options.expanded === true;
    const disabled = options.disabled === true;
    const level = options.level ?? 1;
    const hasChildren = options.hasChildren === true;
    const styled = resolveStyleable({
        ...(options.unstyled === undefined ? {} : { unstyled: options.unstyled }),
        ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
        ...(options.variants === undefined ? {} : { variants: options.variants }),
        user: {
            ...(options.classes?.root === undefined ? {} : { className: options.classes.root }),
            ...(options.styles?.root === undefined ? {} : { style: options.styles.root }),
        },
        ...(options.cssVariables === undefined ? {} : { cssVariables: options.cssVariables }),
        ...(options.merge === undefined ? {} : { merge: options.merge }),
    });
    return {
        id: options.id,
        selected,
        expanded,
        disabled,
        level,
        hasChildren,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "treeitem",
            "data-slot": "item",
            "data-state": selected ? "selected" : "unselected",
            "aria-selected": selected ? "true" : "false",
            "aria-level": String(level),
            tabindex: selected ? "0" : "-1",
            ...(hasChildren ? { "aria-expanded": expanded ? "true" : "false" } : {}),
            ...(disabled ? { "aria-disabled": "true", "data-disabled": "" } : {}),
        },
    };
}

export function shouldMountTreeChildren(options: {
    expanded: boolean;
    lazyMount?: boolean;
    forceMount?: boolean;
}): boolean {
    if (options.forceMount === true) {
        return true;
    }
    if (options.lazyMount === true) {
        return options.expanded;
    }
    return true;
}

export type FlatTreeNode = {
    item: TreeItem;
    level: number;
    parentId?: string;
    hasChildren: boolean;
};

export function flattenVisibleTreeItems(
    items: readonly TreeItem[],
    expanded: ReadonlySet<string>,
): FlatTreeNode[] {
    const result: FlatTreeNode[] = [];
    const walk = (nodes: readonly TreeItem[], level: number, parentId?: string): void => {
        for (const item of nodes) {
            const children = item.children ?? [];
            const hasChildren = children.length > 0;
            result.push({
                item,
                level,
                hasChildren,
                ...(parentId === undefined ? {} : { parentId }),
            });
            if (hasChildren && expanded.has(item.id)) {
                walk(children, level + 1, item.id);
            }
        }
    };
    walk(items, 1);
    return result;
}

export function findTreeItem(
    items: readonly TreeItem[],
    id: string,
    parent?: TreeItem,
): { item: TreeItem; parent?: TreeItem } | undefined {
    for (const item of items) {
        if (item.id === id) {
            return parent ? { item, parent } : { item };
        }
        const children = item.children ?? [];
        const nested = findTreeItem(children, id, item);
        if (nested) {
            return nested;
        }
    }
    return undefined;
}

export type CreateTreeControllerOptions = {
    items?: TreeItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    expanded?: string[];
    defaultExpanded?: string[];
    onExpandedChange?: (expanded: string[]) => void;
    dir?: "ltr" | "rtl";
    selectionMode?: "single";
};

export type TreeController = {
    readonly value: ControllableState<string>;
    readonly expanded: ControllableState<string[]>;
    readonly dir: "ltr" | "rtl";
    setItems(items: TreeItem[]): void;
    getItems(): TreeItem[];
    getVisibleNodes(): FlatTreeNode[];
    isExpanded(id: string): boolean;
    isSelected(id: string): boolean;
    setValue(value: string): void;
    setExpanded(expanded: string[]): void;
    toggleExpanded(id: string): void;
    expand(id: string): void;
    collapse(id: string): void;
    setDir(dir: "ltr" | "rtl"): void;
    resolve(options?: ResolveTreeOptions): TreeViewModel;
    resolveItem(
        options: Omit<ResolveTreeItemOptions, "selected" | "expanded"> & { id: string },
    ): TreeItemViewModel;
};

export function createTreeController(options: CreateTreeControllerOptions = {}): TreeController {
    let items = [...(options.items ?? [])];
    let dir = options.dir ?? "ltr";
    const value = createControllableState<string>({
        defaultValue: options.defaultValue ?? "",
        ...(options.value === undefined ? {} : { value: options.value }),
        ...(options.onValueChange === undefined ? {} : { onChange: options.onValueChange }),
    });
    const expanded = createControllableState<string[]>({
        defaultValue: options.defaultExpanded ?? [],
        ...(options.expanded === undefined ? {} : { value: options.expanded }),
        ...(options.onExpandedChange === undefined ? {} : { onChange: options.onExpandedChange }),
    });

    const expandedSet = (): Set<string> => new Set(expanded.get());

    return {
        value,
        expanded,
        get dir() {
            return dir;
        },
        setItems(next) {
            items = [...next];
        },
        getItems() {
            return [...items];
        },
        getVisibleNodes() {
            return flattenVisibleTreeItems(items, expandedSet());
        },
        isExpanded(id) {
            return expandedSet().has(id);
        },
        isSelected(id) {
            return value.get() === id;
        },
        setValue(next) {
            value.set(next);
        },
        setExpanded(next) {
            expanded.set([...next]);
        },
        toggleExpanded(id) {
            const set = expandedSet();
            if (set.has(id)) {
                set.delete(id);
            } else {
                set.add(id);
            }
            expanded.set([...set]);
        },
        expand(id) {
            const set = expandedSet();
            set.add(id);
            expanded.set([...set]);
        },
        collapse(id) {
            const set = expandedSet();
            set.delete(id);
            expanded.set([...set]);
        },
        setDir(next) {
            dir = next;
        },
        resolve(styleOptions = {}) {
            return resolveTree(styleOptions);
        },
        resolveItem(itemOptions) {
            const found = findTreeItem(items, itemOptions.id);
            const hasChildren = (found?.item.children?.length ?? 0) > 0;
            return resolveTreeItem({
                ...itemOptions,
                selected: value.get() === itemOptions.id,
                expanded: expandedSet().has(itemOptions.id),
                hasChildren: itemOptions.hasChildren ?? hasChildren,
                ...(itemOptions.disabled === undefined && found?.item.disabled !== undefined
                    ? { disabled: found.item.disabled }
                    : {}),
            });
        },
    };
}

export function getTreeKeyboardAction(
    event: Pick<KeyboardEvent, "key">,
    options: {
        nodes: FlatTreeNode[];
        selected: string;
        expanded: ReadonlySet<string>;
        dir?: "ltr" | "rtl";
    },
):
    | { select?: string; expand?: string; collapse?: string; focus?: string }
    | undefined {
    const nodes = options.nodes.filter((node) => node.item.disabled !== true);
    if (nodes.length === 0) {
        return undefined;
    }
    const index = nodes.findIndex((node) => node.item.id === options.selected);
    const current = index >= 0 ? nodes[index] : nodes[0];
    if (!current) {
        return undefined;
    }
    const dir = options.dir ?? "ltr";
    const openKey = dir === "rtl" ? "ArrowLeft" : "ArrowRight";
    const closeKey = dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    const key = event.key;
    const safeIndex = index >= 0 ? index : 0;

    if (key === "ArrowDown") {
        const next = nodes[Math.min(nodes.length - 1, safeIndex + 1)];
        return next ? { focus: next.item.id, select: next.item.id } : undefined;
    }
    if (key === "ArrowUp") {
        const next = nodes[Math.max(0, safeIndex - 1)];
        return next ? { focus: next.item.id, select: next.item.id } : undefined;
    }
    if (key === "Home") {
        const first = nodes[0];
        return first ? { focus: first.item.id, select: first.item.id } : undefined;
    }
    if (key === "End") {
        const last = nodes[nodes.length - 1];
        return last ? { focus: last.item.id, select: last.item.id } : undefined;
    }
    if (key === openKey) {
        if (!current.hasChildren) {
            return undefined;
        }
        if (!options.expanded.has(current.item.id)) {
            return { expand: current.item.id };
        }
        const child = nodes.find((node) => node.parentId === current.item.id);
        return child ? { focus: child.item.id, select: child.item.id } : undefined;
    }
    if (key === closeKey) {
        if (current.hasChildren && options.expanded.has(current.item.id)) {
            return { collapse: current.item.id };
        }
        if (current.parentId) {
            return { focus: current.parentId, select: current.parentId };
        }
        return undefined;
    }
    if (key === "Enter" || key === " ") {
        return { select: current.item.id };
    }
    return undefined;
}
