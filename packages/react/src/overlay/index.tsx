import {
    createElement,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type HTMLAttributes,
    type ReactElement,
    type ReactNode,
} from "react";
import { createDialogController, resolveDialog } from "@sometic/dom/dialog";
import { createDrawerController, resolveDrawer } from "@sometic/dom/drawer";
import { createMenuController, resolveMenu, resolveMenuItem } from "@sometic/dom/menu";
import { createContextMenuController, resolveContextMenu } from "@sometic/dom/context-menu";
import { resolvePopover } from "@sometic/dom/popover";
import { resolveTooltip } from "@sometic/dom/tooltip";
import { resolveAlert, type AlertTone } from "@sometic/dom/alert";
import { createToastQueue, type ToastItem } from "@sometic/dom/toast";

export type DialogProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    titleId?: string;
    descriptionId?: string;
    children?: ReactNode;
};

export function Dialog(props: DialogProps): ReactElement | null {
    const {
        open,
        defaultOpen = false,
        onOpenChange,
        titleId,
        descriptionId,
        children,
        ...rest
    } = props;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const current = isControlled ? open === true : uncontrolled;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;

    const controllerRef = useRef<ReturnType<typeof createDialogController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createDialogController({
            defaultOpen: current,
            getContent: () => panelRef.current,
            onOpenChange: (next) => {
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onOpenChangeRef.current?.(next);
            },
        });
    }

    useLayoutEffect(() => {
        controllerRef.current?.setOpen(current);
    }, [current]);

    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);

    const view = useMemo(
        () =>
            resolveDialog({
                open: current,
                ...(titleId === undefined ? {} : { titleId }),
                ...(descriptionId === undefined ? {} : { descriptionId }),
            }),
        [current, titleId, descriptionId],
    );

    if (!current) {
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
        },
        children,
    );
}

export type PopoverProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    children?: ReactNode;
};

export function Popover(props: PopoverProps): ReactElement | null {
    const { open = false, children, ...rest } = props;
    const view = useMemo(() => resolvePopover({ open }), [open]);
    if (!open) {
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

export type TooltipProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    label: string;
    children: ReactNode;
};

export function Tooltip(props: TooltipProps): ReactElement {
    const { open = false, label, children, ...rest } = props;
    const view = useMemo(() => resolveTooltip({ open }), [open]);
    return createElement(
        "span",
        { style: { position: "relative", display: "inline-block" } },
        children,
        open
            ? createElement(
                  "div",
                  {
                      ...rest,
                      className:
                          [view.className, rest.className].filter(Boolean).join(" ") || undefined,
                      style: { ...view.style, ...rest.style },
                      ...view.attributes,
                  },
                  label,
              )
            : null,
    );
}

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
    tone?: AlertTone;
    children?: ReactNode;
};

export function Alert(props: AlertProps): ReactElement {
    const { tone, children, ...rest } = props;
    const view = useMemo(() => resolveAlert({ ...(tone === undefined ? {} : { tone }) }), [tone]);
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

export type ToastRegionProps = {
    children?: (api: {
        items: readonly ToastItem[];
        push: (input: { title: string; description?: string }) => ToastItem;
        dismiss: (id: string) => void;
    }) => ReactNode;
};

export function ToastRegion(props: ToastRegionProps): ReactElement {
    const [items, setItems] = useState<readonly ToastItem[]>([]);
    const queueRef = useRef<ReturnType<typeof createToastQueue> | null>(null);
    if (queueRef.current === null) {
        queueRef.current = createToastQueue({
            onChange: setItems,
        });
    }
    useEffect(() => {
        return () => {
            queueRef.current?.dispose();
            queueRef.current = null;
        };
    }, []);
    const queue = queueRef.current;
    return createElement(
        "div",
        { "data-slot": "toast-region" },
        props.children?.({
            items,
            push: (input) => queue.push(input),
            dismiss: (id) => queue.dismiss(id),
        }),
    );
}

export type DrawerProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    side?: "left" | "right" | "top" | "bottom";
    children?: ReactNode;
};

export function Drawer(props: DrawerProps): ReactElement | null {
    const { open, defaultOpen = false, onOpenChange, side = "right", children, ...rest } = props;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const current = isControlled ? open === true : uncontrolled;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;
    const controllerRef = useRef<ReturnType<typeof createDrawerController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createDrawerController({
            defaultOpen: current,
            side,
            getContent: () => panelRef.current,
            onOpenChange: (next) => {
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onOpenChangeRef.current?.(next);
            },
        });
    }
    useLayoutEffect(() => {
        controllerRef.current!.side = side;
        controllerRef.current?.setOpen(current);
    }, [current, side]);
    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);
    const view = useMemo(() => resolveDrawer({ open: current, side }), [current, side]);
    if (!current) {
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
        },
        children,
    );
}

export type MenuProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: ReactNode;
};

export function Menu(props: MenuProps): ReactElement | null {
    const { open, defaultOpen = false, onOpenChange, children, ...rest } = props;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const current = isControlled ? open === true : uncontrolled;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;
    const controllerRef = useRef<ReturnType<typeof createMenuController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createMenuController({
            defaultOpen: current,
            getContent: () => panelRef.current,
            onOpenChange: (next) => {
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onOpenChangeRef.current?.(next);
            },
        });
    }
    useLayoutEffect(() => {
        controllerRef.current?.setOpen(current);
    }, [current]);
    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);
    const view = useMemo(() => resolveMenu({ open: current }), [current]);
    if (!current) {
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
        },
        children,
    );
}

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
    disabled?: boolean;
    checked?: boolean;
    children?: ReactNode;
};

export function MenuItem(props: MenuItemProps): ReactElement {
    const { disabled, checked, children, ...rest } = props;
    const view = useMemo(
        () =>
            resolveMenuItem({
                ...(disabled === undefined ? {} : { disabled }),
                ...(checked === undefined ? {} : { checked }),
            }),
        [disabled, checked],
    );
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

export type ContextMenuProps = HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    x?: number;
    y?: number;
    children?: ReactNode;
};

export function ContextMenu(props: ContextMenuProps): ReactElement | null {
    const { open, defaultOpen = false, onOpenChange, x = 0, y = 0, children, ...rest } = props;
    const panelRef = useRef<HTMLDivElement | null>(null);
    const onOpenChangeRef = useRef(onOpenChange);
    onOpenChangeRef.current = onOpenChange;
    const [uncontrolled, setUncontrolled] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const current = isControlled ? open === true : uncontrolled;
    const isControlledRef = useRef(isControlled);
    isControlledRef.current = isControlled;
    const controllerRef = useRef<ReturnType<typeof createContextMenuController> | null>(null);
    if (controllerRef.current === null) {
        controllerRef.current = createContextMenuController({
            defaultOpen: current,
            getContent: () => panelRef.current,
            onOpenChange: (next) => {
                if (!isControlledRef.current) {
                    setUncontrolled(next);
                }
                onOpenChangeRef.current?.(next);
            },
        });
    }
    useLayoutEffect(() => {
        if (current) {
            controllerRef.current?.openAt(x, y);
        } else {
            controllerRef.current?.setOpen(false);
        }
    }, [current, x, y]);
    useEffect(() => {
        return () => {
            controllerRef.current?.dispose();
            controllerRef.current = null;
        };
    }, []);
    const view = useMemo(() => resolveContextMenu({ open: current, x, y }), [current, x, y]);
    if (!current) {
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
        },
        children,
    );
}
