import {
    computed,
    defineComponent,
    h,
    inject,
    onBeforeUnmount,
    onMounted,
    provide,
    ref,
    watch,
    type InjectionKey,
    type PropType,
    type Ref,
    type VNode,
} from "vue";
import {
    createAccordionController,
    resolveAccordion,
    resolveAccordionItem,
    shouldMountAccordionPanel,
    type AccordionType,
} from "@sometic/dom/accordion";
import { resolveBreadcrumb, resolveBreadcrumbItem } from "@sometic/dom/breadcrumb";
import { resolveBadge, type BadgeTone } from "@sometic/dom/badge";
import {
    createCommandPaletteController,
    getCommandPaletteKeyboardAction,
    resolveCommandItem,
    resolveCommandPalette,
    type CommandPaletteCommand,
} from "@sometic/dom/command-palette";
import { resolveProgress } from "@sometic/dom/progress";
import { resolveSkeleton } from "@sometic/dom/skeleton";
import { resolveSpinner } from "@sometic/dom/spinner";
import {
    createTabsController,
    getTabsKeyboardTarget,
    resolveTabPanel,
    resolveTabTrigger,
    resolveTabs,
    shouldMountTabPanel,
} from "@sometic/dom/tabs";
import {
    createTreeController,
    getTreeKeyboardAction,
    resolveTree,
    resolveTreeItem,
    shouldMountTreeChildren,
    type TreeItem,
} from "@sometic/dom/tree";

export {
    createAccordionController,
    resolveAccordion,
    resolveAccordionItem,
    resolveBadge,
    resolveBreadcrumb,
    resolveBreadcrumbItem,
    resolveProgress,
    resolveSkeleton,
    resolveSpinner,
    createTabsController,
    resolveTabPanel,
    resolveTabTrigger,
    resolveTabs,
    createCommandPaletteController,
    resolveCommandPalette,
    createTreeController,
    resolveTree,
    resolveTreeItem,
    type CommandPaletteCommand,
    type TreeItem,
} from "@sometic/dom";

type TabsContext = {
    value: Ref<string>;
    setValue: (value: string) => void;
    orientation: Ref<"horizontal" | "vertical">;
    dir: Ref<"ltr" | "rtl">;
    lazyMount: Ref<boolean>;
    forceMount: Ref<boolean>;
};

const tabsKey: InjectionKey<TabsContext> = Symbol("sometic-tabs");

export const Tabs = defineComponent({
    name: "SometicTabs",
    props: {
        value: { type: String, default: undefined },
        defaultValue: { type: String, default: "" },
        orientation: {
            type: String as PropType<"horizontal" | "vertical">,
            default: "horizontal",
        },
        dir: { type: String as PropType<"ltr" | "rtl">, default: "ltr" },
        lazyMount: { type: Boolean, default: true },
        forceMount: { type: Boolean, default: false },
    },
    emits: {
        "update:value": (_value: string) => true,
        valueChange: (_value: string) => true,
    },
    setup(props, { slots, emit, attrs }) {
        const uncontrolled = ref(props.defaultValue);
        const isControlled = (): boolean => props.value !== undefined;
        const current = (): string => (isControlled() ? (props.value as string) : uncontrolled.value);
        const controller = createTabsController({
            defaultValue: current(),
            orientation: props.orientation,
            dir: props.dir,
            onValueChange: (next) => {
                if (!isControlled()) {
                    uncontrolled.value = next;
                }
                emit("update:value", next);
                emit("valueChange", next);
            },
        });
        watch(
            () => props.value,
            () => controller.setValue(current()),
        );
        watch(
            () => props.orientation,
            (next) => controller.setOrientation(next),
        );
        watch(
            () => props.dir,
            (next) => controller.setDir(next),
        );
        const ctx: TabsContext = {
            value: computed(() => current()) as Ref<string>,
            setValue: (next) => controller.setValue(next),
            orientation: computed(() => props.orientation) as Ref<"horizontal" | "vertical">,
            dir: computed(() => props.dir) as Ref<"ltr" | "rtl">,
            lazyMount: computed(() => props.lazyMount) as Ref<boolean>,
            forceMount: computed(() => props.forceMount) as Ref<boolean>,
        };
        provide(tabsKey, ctx);
        return () => {
            const view = resolveTabs({ orientation: props.orientation });
            return h(
                "div",
                {
                    ...attrs,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                    dir: props.dir,
                },
                slots.default?.(),
            );
        };
    },
});

export const TabTrigger = defineComponent({
    name: "SometicTabTrigger",
    props: {
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        controls: { type: String, default: undefined },
    },
    setup(props, { slots, attrs }) {
        const tabs = inject(tabsKey);
        if (!tabs) {
            throw new Error("TabTrigger requires a Tabs parent");
        }
        return () => {
            const selected = tabs.value.value === props.value;
            const view = resolveTabTrigger({
                value: props.value,
                selected,
                disabled: props.disabled,
                ...(props.controls === undefined ? {} : { controls: props.controls }),
            });
            return h(
                "button",
                {
                    ...attrs,
                    type: "button",
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                    "data-value": props.value,
                    onClick: () => {
                        if (!props.disabled) {
                            tabs.setValue(props.value);
                        }
                    },
                    onKeydown: (event: KeyboardEvent) => {
                        const parent = (event.currentTarget as HTMLElement).parentElement;
                        const registry = [
                            ...(parent?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []),
                        ];
                        const next = getTabsKeyboardTarget(event, {
                            tabs: registry.map((element) => ({
                                value: element.dataset.value ?? "",
                                disabled: element.getAttribute("aria-disabled") === "true",
                                element,
                            })),
                            selected: tabs.value.value,
                            orientation: tabs.orientation.value,
                            dir: tabs.dir.value,
                        });
                        if (!next) {
                            return;
                        }
                        event.preventDefault();
                        tabs.setValue(next);
                        registry.find((element) => element.dataset.value === next)?.focus();
                    },
                },
                slots.default?.(),
            );
        };
    },
});

export const TabPanel = defineComponent({
    name: "SometicTabPanel",
    props: {
        value: { type: String, required: true },
        labelledBy: { type: String, default: undefined },
        forceMount: { type: Boolean, default: undefined },
    },
    setup(props, { slots, attrs }) {
        const tabs = inject(tabsKey);
        if (!tabs) {
            throw new Error("TabPanel requires a Tabs parent");
        }
        return () => {
            const selected = tabs.value.value === props.value;
            const mount = shouldMountTabPanel({
                selected,
                lazyMount: tabs.lazyMount.value,
                forceMount: props.forceMount ?? tabs.forceMount.value,
            });
            if (!mount) {
                return null;
            }
            const view = resolveTabPanel({
                value: props.value,
                selected,
                ...(props.labelledBy === undefined ? {} : { labelledBy: props.labelledBy }),
            });
            return h(
                "div",
                {
                    ...attrs,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                },
                slots.default?.(),
            );
        };
    },
});

type AccordionContext = {
    type: AccordionType;
    isOpen: (value: string) => boolean;
    toggle: (value: string) => void;
    lazyMount: boolean;
    forceMount: boolean;
};

const accordionKey: InjectionKey<Ref<AccordionContext>> = Symbol("sometic-accordion");

export const Accordion = defineComponent({
    name: "SometicAccordion",
    props: {
        type: { type: String as PropType<AccordionType>, default: "single" },
        value: { type: [String, Array] as PropType<string | string[]>, default: undefined },
        defaultValue: { type: [String, Array] as PropType<string | string[]>, default: undefined },
        collapsible: { type: Boolean, default: true },
        lazyMount: { type: Boolean, default: true },
        forceMount: { type: Boolean, default: false },
    },
    emits: {
        "update:value": (_value: string | string[]) => true,
        valueChange: (_value: string | string[]) => true,
    },
    setup(props, { slots, emit, attrs }) {
        const uncontrolled = ref<string | string[]>(
            props.defaultValue ?? (props.type === "multiple" ? [] : ""),
        );
        const isControlled = (): boolean => props.value !== undefined;
        const current = (): string | string[] =>
            isControlled() ? (props.value as string | string[]) : uncontrolled.value;
        const controller = createAccordionController({
            type: props.type,
            collapsible: props.collapsible,
            defaultValue: current(),
            onValueChange: (next) => {
                if (!isControlled()) {
                    uncontrolled.value = next;
                }
                emit("update:value", next);
                emit("valueChange", next);
            },
        });
        watch(
            () => props.value,
            () => controller.setValue(current()),
        );
        const ctx = computed<AccordionContext>(() => ({
            type: props.type,
            isOpen: (item) => {
                const value = current();
                return Array.isArray(value) ? value.includes(item) : value === item;
            },
            toggle: (item) => controller.toggle(item),
            lazyMount: props.lazyMount,
            forceMount: props.forceMount,
        }));
        provide(accordionKey, ctx);
        return () => {
            const view = resolveAccordion({ type: props.type });
            return h(
                "div",
                {
                    ...attrs,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                },
                slots.default?.(),
            );
        };
    },
});

export const AccordionItem = defineComponent({
    name: "SometicAccordionItem",
    props: {
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        title: { type: String, default: undefined },
        forceMount: { type: Boolean, default: undefined },
    },
    setup(props, { slots, attrs }) {
        const accordion = inject(accordionKey);
        if (!accordion) {
            throw new Error("AccordionItem requires an Accordion parent");
        }
        return () => {
            const open = accordion.value.isOpen(props.value);
            const mount = shouldMountAccordionPanel({
                open,
                lazyMount: accordion.value.lazyMount,
                forceMount: props.forceMount ?? accordion.value.forceMount,
            });
            const view = resolveAccordionItem({
                value: props.value,
                open,
                disabled: props.disabled,
            });
            const toggle = (): void => {
                if (!props.disabled) {
                    accordion.value.toggle(props.value);
                }
            };
            const children: VNode[] = [];
            if (props.title != null) {
                children.push(
                    h(
                        "button",
                        {
                            type: "button",
                            "data-slot": "trigger",
                            "aria-expanded": open,
                            disabled: props.disabled,
                            onClick: (event: Event) => {
                                event.stopPropagation();
                                toggle();
                            },
                        },
                        props.title,
                    ),
                );
                if (mount) {
                    children.push(
                        h("div", { "data-slot": "content", hidden: !open }, slots.default?.()),
                    );
                }
            }
            return h(
                "div",
                {
                    ...attrs,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                    onClick: () => {
                        if (props.title == null) {
                            toggle();
                        }
                    },
                },
                props.title == null ? slots.default?.() : children,
            );
        };
    },
});

export const Breadcrumb = defineComponent({
    name: "SometicBreadcrumb",
    setup(_props, { slots, attrs }) {
        return () => {
            const view = resolveBreadcrumb();
            return h(
                "nav",
                {
                    ...attrs,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                },
                h("ol", null, slots.default?.()),
            );
        };
    },
});

export const BreadcrumbItem = defineComponent({
    name: "SometicBreadcrumbItem",
    props: {
        current: { type: Boolean, default: false },
    },
    setup(props, { slots, attrs }) {
        return () => {
            const view = resolveBreadcrumbItem({ current: props.current });
            return h(
                "li",
                {
                    ...attrs,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                },
                slots.default?.(),
            );
        };
    },
});

export const CommandPalette = defineComponent({
    name: "SometicCommandPalette",
    props: {
        open: { type: Boolean, default: undefined },
        defaultOpen: { type: Boolean, default: false },
        value: { type: String, default: undefined },
        defaultValue: { type: String, default: "" },
        filter: { type: String, default: undefined },
        defaultFilter: { type: String, default: "" },
        commands: {
            type: Array as PropType<CommandPaletteCommand[]>,
            required: true,
        },
    },
    emits: {
        "update:open": (_open: boolean) => true,
        openChange: (_open: boolean) => true,
        "update:value": (_value: string) => true,
        valueChange: (_value: string) => true,
        "update:filter": (_filter: string) => true,
        filterChange: (_filter: string) => true,
        select: (_command: CommandPaletteCommand) => true,
    },
    setup(props, { emit, attrs }) {
        const panelRef = ref<HTMLElement | null>(null);
        const uncontrolledOpen = ref(props.defaultOpen);
        const uncontrolledValue = ref(props.defaultValue);
        const uncontrolledFilter = ref(props.defaultFilter);
        const isOpenControlled = (): boolean => props.open !== undefined;
        const isValueControlled = (): boolean => props.value !== undefined;
        const isFilterControlled = (): boolean => props.filter !== undefined;
        const currentOpen = (): boolean =>
            isOpenControlled() ? props.open === true : uncontrolledOpen.value;
        const currentValue = (): string =>
            isValueControlled() ? (props.value as string) : uncontrolledValue.value;
        const currentFilter = (): string =>
            isFilterControlled() ? (props.filter as string) : uncontrolledFilter.value;

        const controller = createCommandPaletteController({
            defaultOpen: currentOpen(),
            defaultValue: currentValue(),
            defaultFilter: currentFilter(),
            commands: props.commands,
            getContent: () => panelRef.value,
            onOpenChange: (next) => {
                if (!isOpenControlled()) {
                    uncontrolledOpen.value = next;
                }
                emit("update:open", next);
                emit("openChange", next);
            },
            onValueChange: (next) => {
                if (!isValueControlled()) {
                    uncontrolledValue.value = next;
                }
                emit("update:value", next);
                emit("valueChange", next);
            },
            onFilterChange: (next) => {
                if (!isFilterControlled()) {
                    uncontrolledFilter.value = next;
                }
                emit("update:filter", next);
                emit("filterChange", next);
            },
            onSelect: (command) => emit("select", command),
        });

        onMounted(() => {
            controller.setOpen(currentOpen());
            controller.overlay.sync();
        });
        watch(
            () => [props.open, props.value, props.filter, props.commands] as const,
            () => {
                controller.setCommands(props.commands);
                controller.setOpen(currentOpen());
                controller.setValue(currentValue());
                controller.setFilter(currentFilter());
                controller.overlay.sync();
            },
        );
        onBeforeUnmount(() => controller.dispose());

        return () => {
            if (!currentOpen()) {
                return null;
            }
            const view = resolveCommandPalette({ open: true });
            const filtered = controller.getFilteredCommands();
            return h(
                "div",
                {
                    ...attrs,
                    ref: panelRef,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                    onKeydown: (event: KeyboardEvent) => {
                        const action = getCommandPaletteKeyboardAction(event, { open: true });
                        if (!action) {
                            return;
                        }
                        event.preventDefault();
                        if (action === "close") {
                            controller.setOpen(false);
                        } else if (action === "next") {
                            controller.moveActive(1);
                        } else if (action === "previous") {
                            controller.moveActive(-1);
                        } else if (action === "select") {
                            controller.selectActive();
                        }
                    },
                },
                [
                    h("input", {
                        "data-slot": "filter",
                        value: currentFilter(),
                        onInput: (event: Event) => {
                            const next = (event.target as HTMLInputElement).value;
                            controller.setFilter(next);
                        },
                    }),
                    h(
                        "div",
                        { role: "listbox", "data-slot": "list" },
                        filtered.map((command) => {
                            const item = resolveCommandItem({
                                id: command.id,
                                selected: currentValue() === command.id,
                                ...(command.disabled === undefined
                                    ? {}
                                    : { disabled: command.disabled }),
                            });
                            return h(
                                "button",
                                {
                                    key: command.id,
                                    type: "button",
                                    class: item.className || undefined,
                                    style: item.style,
                                    ...item.attributes,
                                    disabled: command.disabled === true,
                                    onClick: () => {
                                        controller.setActive(command.id);
                                        controller.selectActive();
                                    },
                                },
                                command.label,
                            );
                        }),
                    ),
                ],
            );
        };
    },
});

export const Tree = defineComponent({
    name: "SometicTree",
    props: {
        items: { type: Array as PropType<TreeItem[]>, required: true },
        value: { type: String, default: undefined },
        defaultValue: { type: String, default: "" },
        expanded: { type: Array as PropType<string[]>, default: undefined },
        defaultExpanded: { type: Array as PropType<string[]>, default: () => [] },
        dir: { type: String as PropType<"ltr" | "rtl">, default: "ltr" },
        lazyMount: { type: Boolean, default: true },
        forceMount: { type: Boolean, default: false },
    },
    emits: {
        "update:value": (_value: string) => true,
        valueChange: (_value: string) => true,
        "update:expanded": (_expanded: string[]) => true,
        expandedChange: (_expanded: string[]) => true,
    },
    setup(props, { emit, attrs }) {
        const uncontrolledValue = ref(props.defaultValue);
        const uncontrolledExpanded = ref([...props.defaultExpanded]);
        const isValueControlled = (): boolean => props.value !== undefined;
        const isExpandedControlled = (): boolean => props.expanded !== undefined;
        const currentValue = (): string =>
            isValueControlled() ? (props.value as string) : uncontrolledValue.value;
        const currentExpanded = (): string[] =>
            isExpandedControlled() ? (props.expanded as string[]) : uncontrolledExpanded.value;

        const controller = createTreeController({
            items: props.items,
            defaultValue: currentValue(),
            defaultExpanded: currentExpanded(),
            dir: props.dir,
            onValueChange: (next) => {
                if (!isValueControlled()) {
                    uncontrolledValue.value = next;
                }
                emit("update:value", next);
                emit("valueChange", next);
            },
            onExpandedChange: (next) => {
                if (!isExpandedControlled()) {
                    uncontrolledExpanded.value = next;
                }
                emit("update:expanded", next);
                emit("expandedChange", next);
            },
        });

        watch(
            () => [props.items, props.value, props.expanded, props.dir] as const,
            () => {
                controller.setItems(props.items);
                controller.setValue(currentValue());
                controller.setExpanded(currentExpanded());
                controller.setDir(props.dir);
            },
        );

        const renderItems = (items: TreeItem[], level: number): VNode[] =>
            items.map((item) => {
                const open = currentExpanded().includes(item.id);
                const hasChildren = (item.children?.length ?? 0) > 0;
                const mountChildren = shouldMountTreeChildren({
                    expanded: open,
                    lazyMount: props.lazyMount,
                    forceMount: props.forceMount,
                });
                const view = resolveTreeItem({
                    id: item.id,
                    selected: currentValue() === item.id,
                    expanded: open,
                    level,
                    hasChildren,
                    ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
                });
                return h(
                    "div",
                    {
                        key: item.id,
                        class: view.className || undefined,
                        style: view.style,
                        ...view.attributes,
                        "data-value": item.id,
                        onClick: (event: Event) => {
                            event.stopPropagation();
                            if (item.disabled) {
                                return;
                            }
                            controller.setValue(item.id);
                        },
                    },
                    [
                        item.label,
                        hasChildren && mountChildren && open
                            ? h(
                                  "div",
                                  { role: "group", "data-slot": "group" },
                                  renderItems(item.children ?? [], level + 1),
                              )
                            : undefined,
                    ],
                );
            });

        return () => {
            controller.setItems(props.items);
            controller.setExpanded(currentExpanded());
            const nodes = controller.getVisibleNodes();
            const root = resolveTree();
            return h(
                "div",
                {
                    ...attrs,
                    class: [root.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...root.style, ...(attrs.style as object | undefined) },
                    ...root.attributes,
                    dir: props.dir,
                    onKeydown: (event: KeyboardEvent) => {
                        const action = getTreeKeyboardAction(event, {
                            nodes,
                            selected: currentValue(),
                            expanded: new Set(currentExpanded()),
                            dir: props.dir,
                        });
                        if (!action) {
                            return;
                        }
                        event.preventDefault();
                        if (action.expand) {
                            controller.expand(action.expand);
                        }
                        if (action.collapse) {
                            controller.collapse(action.collapse);
                        }
                        if (action.select) {
                            controller.setValue(action.select);
                        }
                    },
                },
                renderItems(props.items, 1),
            );
        };
    },
});

export const Progress = defineComponent({
    name: "SometicProgress",
    props: {
        value: { type: Number, default: undefined },
        max: { type: Number, default: undefined },
        indeterminate: { type: Boolean, default: false },
    },
    setup(props, { attrs }) {
        return () => {
            const view = resolveProgress({
                ...(props.value === undefined ? {} : { value: props.value }),
                ...(props.max === undefined ? {} : { max: props.max }),
                indeterminate: props.indeterminate,
            });
            return h("div", {
                ...attrs,
                class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                style: { ...view.style, ...(attrs.style as object | undefined) },
                ...view.attributes,
            });
        };
    },
});

export const Spinner = defineComponent({
    name: "SometicSpinner",
    props: {
        label: { type: String, default: undefined },
    },
    setup(props, { attrs }) {
        return () => {
            const view = resolveSpinner({
                ...(props.label === undefined ? {} : { label: props.label }),
            });
            return h("div", {
                ...attrs,
                class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                style: { ...view.style, ...(attrs.style as object | undefined) },
                ...view.attributes,
            });
        };
    },
});

export const Skeleton = defineComponent({
    name: "SometicSkeleton",
    props: {
        animated: { type: Boolean, default: undefined },
    },
    setup(props, { attrs }) {
        return () => {
            const view = resolveSkeleton({
                ...(props.animated === undefined ? {} : { animated: props.animated }),
            });
            return h("div", {
                ...attrs,
                class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                style: { ...view.style, ...(attrs.style as object | undefined) },
                ...view.attributes,
            });
        };
    },
});

export const Badge = defineComponent({
    name: "SometicBadge",
    props: {
        tone: { type: String as PropType<BadgeTone>, default: "neutral" },
    },
    setup(props, { slots, attrs }) {
        return () => {
            const view = resolveBadge({ tone: props.tone });
            return h(
                "span",
                {
                    ...attrs,
                    class: [view.className, attrs.class].filter(Boolean).join(" ") || undefined,
                    style: { ...view.style, ...(attrs.style as object | undefined) },
                    ...view.attributes,
                },
                slots.default?.(),
            );
        };
    },
});
