import { createControllableState } from "@sometic/core/controllable-state";
import {
    createNotificationsController,
    type NotificationGroup,
    type NotificationItem,
    type NotificationsController,
} from "@sometic/notifications";
import { resolveRootStyle, type StyleableRootOptions } from "../internal/styleable.js";

export type NotificationCenterViewModel = {
    open: boolean;
    unreadCount: number;
    empty: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    listAttributes: Record<string, string>;
};

export type ResolveNotificationCenterOptions = StyleableRootOptions & {
    open?: boolean;
    unreadCount?: number;
    count?: number;
    label?: string;
    labelledBy?: string;
    live?: "polite" | "assertive" | "off";
};

export function resolveNotificationCenter(
    options: ResolveNotificationCenterOptions = {},
): NotificationCenterViewModel {
    const styled = resolveRootStyle(options);
    const open = options.open !== false;
    const unreadCount = Math.max(0, Math.floor(options.unreadCount ?? 0));
    const count = Math.max(0, Math.floor(options.count ?? 0));
    const live = options.live ?? "polite";
    return {
        open,
        unreadCount,
        empty: count === 0,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "region",
            "data-slot": "root",
            "data-state": open ? "open" : "closed",
            "data-open": open ? "true" : "false",
            "data-unread": String(unreadCount),
            "data-empty": count === 0 ? "true" : "false",
            "aria-label": options.label ?? "Notifications",
            ...(options.labelledBy === undefined ? {} : { "aria-labelledby": options.labelledBy }),
            ...(open ? {} : { hidden: "" }),
        },
        listAttributes: {
            role: "list",
            "data-slot": "list",
            "data-count": String(count),
            ...(live === "off" ? {} : { "aria-live": live, "aria-relevant": "additions" }),
        },
    };
}

export type NotificationItemViewModel = {
    id: string;
    read: boolean;
    className: string;
    style: Record<string, string>;
    attributes: Record<string, string>;
    dismissAttributes: Record<string, string>;
};

export type ResolveNotificationItemOptions = StyleableRootOptions & {
    id: string;
    read?: boolean;
    priority?: "low" | "normal" | "high";
    title?: string;
    source?: string;
};

export function resolveNotificationItem(
    options: ResolveNotificationItemOptions,
): NotificationItemViewModel {
    const styled = resolveRootStyle(options);
    const read = options.read === true;
    const priority = options.priority ?? "normal";
    return {
        id: options.id,
        read,
        className: styled.className,
        style: styled.style,
        attributes: {
            role: "listitem",
            "data-slot": "item",
            "data-notification-id": options.id,
            "data-state": read ? "read" : "unread",
            "data-priority": priority,
            ...(options.source === undefined ? {} : { "data-source": options.source }),
            ...(priority === "high" ? { "aria-live": "assertive" } : {}),
        },
        dismissAttributes: {
            type: "button",
            "data-slot": "dismiss",
            "aria-label":
                options.title === undefined ? "Dismiss notification" : `Dismiss ${options.title}`,
        },
    };
}

export type CreateNotificationCenterControllerOptions = {
    notifications?: NotificationsController;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    groupBy?: "day" | "source";
    onAnnounce?: (item: NotificationItem) => void;
    onChange?: (items: readonly NotificationItem[]) => void;
};

export type NotificationCenterController = {
    readonly notifications: NotificationsController;
    isOpen(): boolean;
    setOpen(open: boolean): void;
    toggle(): void;
    getItems(): readonly NotificationItem[];
    getUnreadCount(): number;
    getGroups(): readonly NotificationGroup[];
    markRead(id: string): void;
    markAllRead(): void;
    dismiss(id: string): void;
    subscribe(listener: (items: readonly NotificationItem[]) => void): () => void;
    resolve(options?: ResolveNotificationCenterOptions): NotificationCenterViewModel;
    resolveItem(
        id: string,
        options?: Omit<ResolveNotificationItemOptions, "id" | "read" | "priority">,
    ): NotificationItemViewModel;
    dispose(): void;
};

export function createNotificationCenterController(
    options: CreateNotificationCenterControllerOptions = {},
): NotificationCenterController {
    const ownsController = options.notifications === undefined;
    const notifications =
        options.notifications ??
        createNotificationsController({
            ...(options.onAnnounce === undefined ? {} : { onAnnounce: options.onAnnounce }),
            ...(options.onChange === undefined ? {} : { onChange: options.onChange }),
        });
    const groupMode = options.groupBy ?? "day";

    const open = createControllableState<boolean>({
        defaultValue: options.defaultOpen ?? false,
        ...(Object.prototype.hasOwnProperty.call(options, "open")
            ? { value: options.open === true }
            : {}),
        ...(options.onOpenChange === undefined ? {} : { onChange: options.onOpenChange }),
    });

    const unreadCount = (): number => notifications.getItems().filter((item) => !item.read).length;

    return {
        notifications,
        isOpen: () => open.get(),
        setOpen(next) {
            open.set(next);
        },
        toggle() {
            open.set(!open.get());
        },
        getItems: () => notifications.getItems(),
        getUnreadCount: unreadCount,
        getGroups: () => notifications.groupBy(groupMode),
        markRead(id) {
            notifications.markRead(id);
        },
        markAllRead() {
            for (const item of notifications.getItems()) {
                if (!item.read) {
                    notifications.markRead(item.id);
                }
            }
        },
        dismiss(id) {
            notifications.dismiss(id);
        },
        subscribe(listener) {
            return notifications.subscribe(listener);
        },
        resolve(styleOptions = {}) {
            return resolveNotificationCenter({
                ...styleOptions,
                open: open.get(),
                unreadCount: unreadCount(),
                count: notifications.getItems().length,
            });
        },
        resolveItem(id, itemOptions = {}) {
            const item = notifications.getItems().find((entry) => entry.id === id);
            return resolveNotificationItem({
                ...itemOptions,
                id,
                read: item?.read === true,
                priority: item?.priority ?? "normal",
                ...(typeof item?.title === "string" ? { title: item.title } : {}),
                ...(typeof item?.source === "string" ? { source: item.source } : {}),
            });
        },
        dispose() {
            if (ownsController) {
                notifications.dispose();
            }
        },
    };
}

export { createNotificationsController } from "@sometic/notifications";
export type {
    CreateNotificationsControllerOptions,
    NotificationGroup,
    NotificationItem,
    NotificationPriority,
    NotificationsController,
} from "@sometic/notifications";
