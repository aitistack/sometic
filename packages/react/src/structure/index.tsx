import {
    createContext,
    createElement,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactElement,
    type ReactNode,
} from "react";
import {
    createAccordionController,
    resolveAccordion,
    resolveAccordionItem,
    type AccordionType,
} from "@sometic/dom/accordion";
import { resolveBreadcrumb, resolveBreadcrumbItem } from "@sometic/dom/breadcrumb";
import { resolveBadge, type BadgeTone } from "@sometic/dom/badge";
import { resolveProgress } from "@sometic/dom/progress";
import { resolveSkeleton } from "@sometic/dom/skeleton";
import { resolveSpinner } from "@sometic/dom/spinner";
import {
    createTabsController,
    resolveTabPanel,
    resolveTabTrigger,
    resolveTabs,
} from "@sometic/dom/tabs";

type TabsContextValue = {
    value: string;
    setValue: (value: string) => void;
    orientation: "horizontal" | "vertical";
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
    children?: ReactNode;
};

export function Tabs(props: TabsProps): ReactElement {
    const {
        value,
        defaultValue = "",
        onValueChange,
        orientation = "horizontal",
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
        }),
        [current, orientation],
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
    return createElement(
        "button",
        {
            type: "button",
            ...rest,
            className: [view.className, rest.className].filter(Boolean).join(" ") || undefined,
            style: { ...view.style, ...rest.style },
            ...view.attributes,
            onClick: (event) => {
                props.onClick?.(event as never);
                if (!disabled) {
                    tabs.setValue(value);
                }
            },
        },
        children,
    );
}

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
    value: string;
    labelledBy?: string;
    children?: ReactNode;
};

export function TabPanel(props: TabPanelProps): ReactElement | null {
    const { value, labelledBy, children, ...rest } = props;
    const tabs = useTabsContext();
    const selected = tabs.value === value;
    const view = useMemo(
        () =>
            resolveTabPanel({
                value,
                selected,
                ...(labelledBy === undefined ? {} : { labelledBy }),
            }),
        [value, selected, labelledBy],
    );
    if (!selected) {
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
    children?: ReactNode;
};

export function Accordion(props: AccordionProps): ReactElement {
    const { type = "single", value, defaultValue, onValueChange, children, ...rest } = props;
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
                    return current === item ? "" : item;
                })();
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onValueChangeRef.current?.(next);
            },
        }),
        [type, current],
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
    children?: ReactNode;
};

export function AccordionItem(props: AccordionItemProps): ReactElement {
    const { value, disabled, title, children, ...rest } = props;
    const accordion = useAccordionContext();
    const open = accordion.isOpen(value);
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
                      },
                      title,
                  ),
                  open
                      ? createElement("div", { key: "content", "data-slot": "content" }, children)
                      : null,
              ],
    );
}

export type BreadcrumbProps = HTMLAttributes<HTMLElement> & { children?: ReactNode };

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
