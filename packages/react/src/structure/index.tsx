import {
    createContext,
    createElement,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type HTMLAttributes,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactElement,
    type ReactNode,
} from "react";
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
    syncTabsToUrl,
} from "@sometic/dom/tabs";
import {
    createTreeController,
    getTreeKeyboardAction,
    resolveTree,
    resolveTreeItem,
    shouldMountTreeChildren,
    type TreeItem,
} from "@sometic/dom/tree";

type TabsContextValue = {
    value: string;
    setValue: (value: string) => void;
    orientation: "horizontal" | "vertical";
    dir: "ltr" | "rtl";
    lazyMount: boolean;
    forceMount: boolean;
    registerTrigger: (value: string, disabled: boolean, element: HTMLElement | null) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(): TabsContextValue {
    const ctx = useContext(TabsContext);
    if (!ctx) {
        throw new Error("TabTrigger and TabPanel require a Tabs parent");
    }
    return ctx;
}

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    orientation?: "horizontal" | "vertical";
    dir?: "ltr" | "rtl";
    lazyMount?: boolean;
    forceMount?: boolean;
    urlParam?: string;
    syncUrlHash?: boolean;
    children?: ReactNode;
};

export function Tabs(props: TabsProps): ReactElement {
    const {
        value,
        defaultValue = "",
        onValueChange,
        orientation = "horizontal",
        dir = "ltr",
        lazyMount = true,
        forceMount = false,
        urlParam,
        syncUrlHash = false,
        children,
        ...rest
    } = props;
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const [uncontrolled, setUncontrolled] = useState(defaultValue);
    const isControlled = value !== undefined;
    const current = isControlled ? value : uncontrolled;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;

    const controllerRef = useRef<ReturnType<typeof createTabsController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createTabsController({
            defaultValue: current,
            orientation,
            dir,
            onValueChange: (next) => {
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onValueChangeRef.current?.(next);
            },
        });
    }

    useLayoutEffect(() => {
        controllerRef.current?.setValue(current);
        controllerRef.current?.setOrientation(orientation);
        controllerRef.current?.setDir(dir);
    }, [current, orientation, dir]);

    useEffect(() => {
        if (urlParam === undefined && !syncUrlHash) {
            return;
        }
        if (typeof window === "undefined") {
            return;
        }
        return syncTabsToUrl({
            getValue: () => current,
            setValue: (next) => {
                controllerRef.current?.setValue(next);
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onValueChangeRef.current?.(next);
            },
            ...(urlParam === undefined ? {} : { param: urlParam }),
            hash: syncUrlHash,
            getSearchParams: () => new URLSearchParams(window.location.search),
            setSearchParams: (params) => {
                const url = new URL(window.location.href);
                url.search = params.toString();
                window.history.replaceState(null, "", url);
            },
            getHash: () => window.location.hash,
            setHash: (hash) => {
                window.history.replaceState(null, "", `#${hash}`);
            },
            subscribe: (listener) => {
                window.addEventListener("popstate", listener);
                return () => window.removeEventListener("popstate", listener);
            },
        }).dispose;
    }, [current, urlParam, syncUrlHash]);

    useEffect(() => {
        return () => {
            controllerRef.current = null;
        };
    }, []);

    const registerTrigger = useCallback(
        (tabValue: string, disabled: boolean, element: HTMLElement | null) => {
            void tabValue;
            void disabled;
            void element;
        },
        [],
    );

    const view = useMemo(() => resolveTabs({ orientation }), [orientation]);
    const ctx = useMemo(
        () => ({
            value: current,
            setValue: (next: string) => {
                controllerRef.current?.setValue(next);
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onValueChangeRef.current?.(next);
            },
            orientation,
            dir,
            lazyMount,
            forceMount,
            registerTrigger,
        }),
        [current, orientation, dir, lazyMount, forceMount, registerTrigger],
    );

    return createElement(
        TabsContext.Provider,
        { value: ctx },
        createElement(
            "div",
            {
                ...rest,
                className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
                style: { ...view.style, ...rest.style },
                ...view.attributes,
                dir,
            },
            children,
        ),
    );
}

export type TabTriggerProps = HTMLAttributes<HTMLButtonElement> & {
    value: string;
    disabled?: boolean;
    controls?: string;
};

export function TabTrigger(props: TabTriggerProps): ReactElement {
    const { value, disabled, controls, children, ...rest } = props;
    const tabs = useTabsContext();
    const selected = tabs.value === value;
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const view = useMemo(
        () =>
            resolveTabTrigger({
                value,
                selected,
                ...(disabled === undefined ? {} : { disabled }),
                ...(controls === undefined ? {} : { controls }),
            }),
        [value, selected, disabled, controls],
    );

    useEffect(() => {
        tabs.registerTrigger(value, disabled === true, buttonRef.current);
        return () => tabs.registerTrigger(value, disabled === true, null);
    }, [tabs, value, disabled]);

    return createElement(
        "button",
        {
            type: "button",
            ...rest,
            ref: buttonRef,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
            onClick: (event) => {
                props.onClick?.(event as never);
                if (!disabled) {
                    tabs.setValue(value);
                }
            },
            onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
                props.onKeyDown?.(event);
                const registry = Array.from(
                    (event.currentTarget.parentElement?.querySelectorAll('[role="tab"]') ??
                        []) as NodeListOf<HTMLElement>,
                );
                const tabMeta = registry.map((element) => ({
                    value: element.getAttribute("data-value") ?? element.dataset.value ?? "",
                    disabled: element.getAttribute("aria-disabled") === "true",
                    element,
                }));
                const next = getTabsKeyboardTarget(event.nativeEvent, {
                    tabs: tabMeta.filter((tab) => tab.value),
                    selected: tabs.value,
                    orientation: tabs.orientation,
                    dir: tabs.dir,
                });
                if (!next) {
                    return;
                }
                event.preventDefault();
                tabs.setValue(next);
                const nextEl = registry.find(
                    (element) =>
                        (element.getAttribute("data-value") ?? element.dataset.value) === next,
                );
                nextEl?.focus();
            },
            "data-value": value,
        },
        children,
    );
}

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
    value: string;
    labelledBy?: string;
    forceMount?: boolean;
    children?: ReactNode;
};

export function TabPanel(props: TabPanelProps): ReactElement | null {
    const { value, labelledBy, forceMount, children, ...rest } = props;
    const tabs = useTabsContext();
    const selected = tabs.value === value;
    const mount = shouldMountTabPanel({
        selected,
        lazyMount: tabs.lazyMount,
        forceMount: forceMount ?? tabs.forceMount,
    });
    const view = useMemo(
        () =>
            resolveTabPanel({
                value,
                selected,
                ...(labelledBy === undefined ? {} : { labelledBy }),
            }),
        [value, selected, labelledBy],
    );
    if (!mount) {
        return null;
    }
    return createElement(
        "div",
        {
            ...rest,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
        },
        children,
    );
}

type AccordionContextValue = {
    type: AccordionType;
    isOpen: (value: string) => boolean;
    toggle: (value: string) => void;
    lazyMount: boolean;
    forceMount: boolean;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext(): AccordionContextValue {
    const ctx = useContext(AccordionContext);
    if (!ctx) {
        throw new Error("AccordionItem requires an Accordion parent");
    }
    return ctx;
}

export type AccordionProps = HTMLAttributes<HTMLDivElement> & {
    type?: AccordionType;
    value?: string | string[];
    defaultValue?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    collapsible?: boolean;
    lazyMount?: boolean;
    forceMount?: boolean;
    children?: ReactNode;
};

export function Accordion(props: AccordionProps): ReactElement {
    const {
        type = "single",
        value,
        defaultValue,
        onValueChange,
        collapsible = true,
        lazyMount = true,
        forceMount = false,
        children,
        ...rest
    } = props;
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const [uncontrolled, setUncontrolled] = useState<string | string[]>(
        defaultValue ?? (type === "multiple" ? [] : ""),
    );
    const isControlled = value !== undefined;
    const current = isControlled ? value : uncontrolled;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;

    const controllerRef = useRef<ReturnType<typeof createAccordionController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createAccordionController({
            type,
            collapsible,
            defaultValue: current,
            onValueChange: (next) => {
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onValueChangeRef.current?.(next);
            },
        });
    }

    useLayoutEffect(() => {
        controllerRef.current?.setValue(current);
    }, [current]);

    useEffect(() => {
        return () => {
            controllerRef.current = null;
        };
    }, []);

    const view = useMemo(() => resolveAccordion({ type }), [type]);
    const ctx = useMemo(
        () => ({
            type,
            isOpen: (item: string) => {
                return Array.isArray(current) ? current.includes(item) : current === item;
            },
            toggle: (item: string) => {
                controllerRef.current?.toggle(item);
                const next = (() => {
                    if (type === "multiple") {
                        const list = Array.isArray(current) ? [...current] : [];
                        const idx = list.indexOf(item);
                        if (idx >= 0) {
                            list.splice(idx, 1);
                        } else {
                            list.push(item);
                        }
                        return list;
                    }
                    if (current === item) {
                        return collapsible ? "" : item;
                    }
                    return item;
                })();
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onValueChangeRef.current?.(next);
            },
            lazyMount,
            forceMount,
        }),
        [type, current, collapsible, lazyMount, forceMount],
    );

    return createElement(
        AccordionContext.Provider,
        { value: ctx },
        createElement(
            "div",
            {
                ...rest,
                className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
                style: { ...view.style, ...rest.style },
                ...view.attributes,
            },
            children,
        ),
    );
}

export type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
    value: string;
    disabled?: boolean;
    title?: ReactNode;
    forceMount?: boolean;
    children?: ReactNode;
};

export function AccordionItem(props: AccordionItemProps): ReactElement {
    const { value, disabled, title, forceMount, children, ...rest } = props;
    const accordion = useAccordionContext();
    const open = accordion.isOpen(value);
    const mount = shouldMountAccordionPanel({
        open,
        lazyMount: accordion.lazyMount,
        forceMount: forceMount ?? accordion.forceMount,
    });
    const view = useMemo(
        () =>
            resolveAccordionItem({
                value,
                open,
                ...(disabled === undefined ? {} : { disabled }),
            }),
        [value, open, disabled],
    );
    const toggle = (): void => {
        if (!disabled) {
            accordion.toggle(value);
        }
    };
    return createElement(
        "div",
        {
            ...rest,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
            onClick: (event) => {
                props.onClick?.(event as never);
                if (title == null) {
                    toggle();
                }
            },
        },
        title == null
            ? children
            : [
                  createElement(
                      "button",
                      {
                          key: "trigger",
                          type: "button",
                          "data-slot": "trigger",
                          "aria-expanded": open,
                          disabled: disabled === true,
                          onClick: (event) => {
                              event.stopPropagation();
                              toggle();
                          },
                          onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => {
                              if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  toggle();
                              }
                          },
                      },
                      title,
                  ),
                  mount
                      ? createElement(
                            "div",
                            {
                                key: "content",
                                "data-slot": "content",
                                hidden: !open,
                            },
                            children,
                        )
                      : null,
              ],
    );
}

export type BreadcrumbProps = HTMLAttributes<HTMLElement> & {
    children?: ReactNode;
};

export function Breadcrumb(props: BreadcrumbProps): ReactElement {
    const { children, ...rest } = props;
    const view = useMemo(() => resolveBreadcrumb(), []);
    return createElement(
        "nav",
        {
            ...rest,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
        },
        createElement("ol", null, children),
    );
}

export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement> & {
    current?: boolean;
    children?: ReactNode;
};

export function BreadcrumbItem(props: BreadcrumbItemProps): ReactElement {
    const { current = false, children, ...rest } = props;
    const view = useMemo(() => resolveBreadcrumbItem({ current }), [current]);
    return createElement(
        "li",
        {
            ...rest,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
        },
        children,
    );
}

export type CommandPaletteProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    filter?: string;
    defaultFilter?: string;
    onFilterChange?: (filter: string) => void;
    commands: CommandPaletteCommand[];
    onSelect?: (command: CommandPaletteCommand) => void;
    children?: ReactNode;
};

export function CommandPalette(props: CommandPaletteProps): ReactElement | null {
    const {
        open,
        defaultOpen = false,
        onOpenChange,
        value,
        defaultValue = "",
        onValueChange,
        filter,
        defaultFilter = "",
        onFilterChange,
        commands,
        onSelect,
        children,
        ...rest
    } = props;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [uncontrolledFilter, setUncontrolledFilter] = useState(defaultFilter);
    const [, setTick] = useState(0);
    const isOpenControlled = open !== undefined;
    const isValueControlled = value !== undefined;
    const isFilterControlled = filter !== undefined;
    const currentOpen = isOpenControlled ? open : uncontrolledOpen;
    const currentValue = isValueControlled ? value : uncontrolledValue;
    const currentFilter = isFilterControlled ? filter : uncontrolledFilter;
    const onOpenChangeRef = useRef(onOpenChange);
    const onValueChangeRef = useRef(onValueChange);
    const onFilterChangeRef = useRef(onFilterChange);
    const onSelectRef = useRef(onSelect);
    onOpenChangeRef.current = onOpenChange;
    onValueChangeRef.current = onValueChange;
    onFilterChangeRef.current = onFilterChange;
    onSelectRef.current = onSelect;

    const controllerRef = useRef<ReturnType<typeof createCommandPaletteController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createCommandPaletteController({
            defaultOpen: currentOpen,
            defaultValue: currentValue,
            defaultFilter: currentFilter,
            commands,
            getContent: () => panelRef.current,
            onOpenChange: (next) => {
                if (!isOpenControlled) {
                    setUncontrolledOpen(next);
                }
                onOpenChangeRef.current?.(next);
            },
            onValueChange: (next) => {
                if (!isValueControlled) {
                    setUncontrolledValue(next);
                }
                onValueChangeRef.current?.(next);
                setTick((n) => n + 1);
            },
            onFilterChange: (next) => {
                if (!isFilterControlled) {
                    setUncontrolledFilter(next);
                }
                onFilterChangeRef.current?.(next);
            },
            onSelect: (command) => onSelectRef.current?.(command),
        });
    }

    useLayoutEffect(() => {
        controllerRef.current?.setCommands(commands);
        controllerRef.current?.setOpen(currentOpen);
        controllerRef.current?.setValue(currentValue);
        controllerRef.current?.setFilter(currentFilter);
        controllerRef.current?.overlay.sync();
    }, [commands, currentOpen, currentValue, currentFilter]);

    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);

    const filtered = controllerRef.current?.getFilteredCommands() ?? commands;
    const view = useMemo(() => resolveCommandPalette({ open: currentOpen }), [currentOpen]);

    if (!currentOpen) {
        return null;
    }

    return createElement(
        "div",
        {
            ...rest,
            ref: panelRef,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
            onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
                props.onKeyDown?.(event);
                const action = getCommandPaletteKeyboardAction(event.nativeEvent, {
                    open: currentOpen,
                });
                if (!action) {
                    return;
                }
                event.preventDefault();
                if (action === "close") {
                    controllerRef.current?.setOpen(false);
                } else if (action === "next") {
                    controllerRef.current?.moveActive(1);
                    setUncontrolledValue(controllerRef.current?.getActiveId() ?? "");
                    setTick((n) => n + 1);
                } else if (action === "previous") {
                    controllerRef.current?.moveActive(-1);
                    setUncontrolledValue(controllerRef.current?.getActiveId() ?? "");
                    setTick((n) => n + 1);
                } else if (action === "select") {
                    controllerRef.current?.selectActive();
                }
            },
        },
        createElement("input", {
            "data-slot": "filter",
            value: currentFilter,
            onChange: (event) => {
                const next = event.currentTarget.value;
                controllerRef.current?.setFilter(next);
                if (!isFilterControlled) {
                    setUncontrolledFilter(next);
                }
                onFilterChangeRef.current?.(next);
            },
        }),
        createElement(
            "div",
            { role: "listbox", "data-slot": "list" },
            filtered.map((command) => {
                const item = resolveCommandItem({
                    id: command.id,
                    selected: currentValue === command.id,
                    ...(command.disabled === undefined ? {} : { disabled: command.disabled }),
                });
                return createElement(
                    "button",
                    {
                        key: command.id,
                        type: "button",
                        className: item.className || undefined,
                        style: item.style,
                        ...item.attributes,
                        disabled: command.disabled === true,
                        onClick: () => {
                            controllerRef.current?.setActive(command.id);
                            controllerRef.current?.selectActive();
                        },
                    },
                    command.label,
                );
            }),
        ),
        children,
    );
}

export type TreeProps = HTMLAttributes<HTMLDivElement> & {
    items: TreeItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    expanded?: string[];
    defaultExpanded?: string[];
    onExpandedChange?: (expanded: string[]) => void;
    dir?: "ltr" | "rtl";
    lazyMount?: boolean;
    forceMount?: boolean;
};

export function Tree(props: TreeProps): ReactElement {
    const {
        items,
        value,
        defaultValue = "",
        onValueChange,
        expanded,
        defaultExpanded = [],
        onExpandedChange,
        dir = "ltr",
        lazyMount = true,
        forceMount = false,
        ...rest
    } = props;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const [uncontrolledExpanded, setUncontrolledExpanded] = useState(defaultExpanded);
    const isValueControlled = value !== undefined;
    const isExpandedControlled = expanded !== undefined;
    const currentValue = isValueControlled ? value : uncontrolledValue;
    const currentExpanded = isExpandedControlled ? expanded : uncontrolledExpanded;
    const onValueChangeRef = useRef(onValueChange);
    const onExpandedChangeRef = useRef(onExpandedChange);
    onValueChangeRef.current = onValueChange;
    onExpandedChangeRef.current = onExpandedChange;

    const controllerRef = useRef<ReturnType<typeof createTreeController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createTreeController({
            items,
            defaultValue: currentValue,
            defaultExpanded: currentExpanded,
            dir,
            onValueChange: (next) => {
                if (!isValueControlled) {
                    setUncontrolledValue(next);
                }
                onValueChangeRef.current?.(next);
            },
            onExpandedChange: (next) => {
                if (!isExpandedControlled) {
                    setUncontrolledExpanded(next);
                }
                onExpandedChangeRef.current?.(next);
            },
        });
    }

    useLayoutEffect(() => {
        controllerRef.current?.setItems(items);
        controllerRef.current?.setValue(currentValue);
        controllerRef.current?.setExpanded(currentExpanded);
        controllerRef.current?.setDir(dir);
    }, [items, currentValue, currentExpanded, dir]);

    const root = useMemo(() => resolveTree(), []);
    const nodes = useMemo(() => {
        controllerRef.current?.setItems(items);
        controllerRef.current?.setExpanded(currentExpanded);
        return controllerRef.current?.getVisibleNodes() ?? [];
    }, [items, currentExpanded]);

    const renderItems = (treeItems: TreeItem[], level: number): ReactNode[] => {
        return treeItems.map((item) => {
            const open = currentExpanded.includes(item.id);
            const hasChildren = (item.children?.length ?? 0) > 0;
            const mountChildren = shouldMountTreeChildren({
                expanded: open,
                lazyMount,
                forceMount,
            });
            const view = resolveTreeItem({
                id: item.id,
                selected: currentValue === item.id,
                expanded: open,
                level,
                hasChildren,
                ...(item.disabled === undefined ? {} : { disabled: item.disabled }),
            });
            return createElement(
                "div",
                {
                    key: item.id,
                    className: view.className || undefined,
                    style: view.style,
                    ...view.attributes,
                    "data-value": item.id,
                    onClick: (event) => {
                        event.stopPropagation();
                        if (item.disabled) {
                            return;
                        }
                        controllerRef.current?.setValue(item.id);
                        if (!isValueControlled) {
                            setUncontrolledValue(item.id);
                        }
                        onValueChangeRef.current?.(item.id);
                    },
                },
                item.label,
                hasChildren && mountChildren
                    ? createElement(
                          "div",
                          { role: "group", "data-slot": "group" },
                          open ? renderItems(item.children ?? [], level + 1) : null,
                      )
                    : null,
            );
        });
    };

    return createElement(
        "div",
        {
            ...rest,
            className: [root.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...root.style, ...rest.style },
            ...root.attributes,
            dir,
            onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
                props.onKeyDown?.(event);
                const action = getTreeKeyboardAction(event.nativeEvent, {
                    nodes,
                    selected: currentValue,
                    expanded: new Set(currentExpanded),
                    dir,
                });
                if (!action) {
                    return;
                }
                event.preventDefault();
                if (action.expand) {
                    controllerRef.current?.expand(action.expand);
                    const next = [...new Set([...currentExpanded, action.expand])];
                    if (!isExpandedControlled) {
                        setUncontrolledExpanded(next);
                    }
                    onExpandedChangeRef.current?.(next);
                }
                if (action.collapse) {
                    controllerRef.current?.collapse(action.collapse);
                    const next = currentExpanded.filter((id) => id !== action.collapse);
                    if (!isExpandedControlled) {
                        setUncontrolledExpanded(next);
                    }
                    onExpandedChangeRef.current?.(next);
                }
                if (action.select) {
                    controllerRef.current?.setValue(action.select);
                    if (!isValueControlled) {
                        setUncontrolledValue(action.select);
                    }
                    onValueChangeRef.current?.(action.select);
                }
            },
        },
        renderItems(items, 1),
    );
}

export type ProgressProps = HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
    indeterminate?: boolean;
};

export function Progress(props: ProgressProps): ReactElement {
    const { value, max, indeterminate, ...rest } = props;
    const view = useMemo(
        () =>
            resolveProgress({
                ...(value === undefined ? {} : { value }),
                ...(max === undefined ? {} : { max }),
                ...(indeterminate === undefined ? {} : { indeterminate }),
            }),
        [value, max, indeterminate],
    );
    return createElement("div", {
        ...rest,
        className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
        style: { ...view.style, ...rest.style },
        ...view.attributes,
    });
}

export type SpinnerProps = HTMLAttributes<HTMLDivElement> & { label?: string };

export function Spinner(props: SpinnerProps): ReactElement {
    const { label, ...rest } = props;
    const view = useMemo(
        () => resolveSpinner({ ...(label === undefined ? {} : { label }) }),
        [label],
    );
    return createElement("div", {
        ...rest,
        className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
        style: { ...view.style, ...rest.style },
        ...view.attributes,
    });
}

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & { animated?: boolean };

export function Skeleton(props: SkeletonProps): ReactElement {
    const { animated, ...rest } = props;
    const view = useMemo(
        () => resolveSkeleton({ ...(animated === undefined ? {} : { animated }) }),
        [animated],
    );
    return createElement("div", {
        ...rest,
        className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
        style: { ...view.style, ...rest.style },
        ...view.attributes,
    });
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    tone?: BadgeTone;
    children?: ReactNode;
};

export function Badge(props: BadgeProps): ReactElement {
    const { tone = "neutral", children, ...rest } = props;
    const view = useMemo(() => resolveBadge({ tone }), [tone]);
    return createElement(
        "span",
        {
            ...rest,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
        },
        children,
    );
}

export type { CommandPaletteCommand, TreeItem };
