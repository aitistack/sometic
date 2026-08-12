import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";
import { createPrefixedId } from "@sometic/core/id";

export type NotificationPriority = "low" | "normal" | "high";

export type NotificationGroupBy = "day" | "source";

export type NotificationItem = {
    id: string;
    title: string;
    body: string | null;
    source: string | null;
    href: string | null;
    createdAt: number;
    read: boolean;
    priority: NotificationPriority;
};

export type NotificationInput = {
    title: string;
    id?: string;
    body?: string;
    source?: string;
    href?: string;
    createdAt?: number;
    read?: boolean;
    priority?: NotificationPriority;
};

export type NotificationFilter = {
    unreadOnly?: boolean;
    source?: string;
    priority?: NotificationPriority;
};

export type NotificationGroup = {
    key: string;
    items: NotificationItem[];
};

export type CreateNotificationsControllerOptions = {
    items?: NotificationInput[];
    maxItems?: number;
    now?: () => number;
    onChange?: (items: NotificationItem[]) => void;
    onAnnounce?: (item: NotificationItem) => void;
};

export type NotificationsController = {
    getItems(filter?: NotificationFilter): NotificationItem[];
    getItem(id: string): NotificationItem | undefined;
    getUnreadCount(): number;
    push(input: NotificationInput): NotificationItem;
    pushMany(inputs: NotificationInput[]): NotificationItem[];
    markRead(id: string): void;
    markUnread(id: string): void;
    markAllRead(): void;
    dismiss(id: string): void;
    dismissAll(): void;
    groupBy(mode: NotificationGroupBy, filter?: NotificationFilter): NotificationGroup[];
    subscribe(listener: (items: NotificationItem[]) => void): () => void;
    readonly disposed: boolean;
    dispose(): void;
};

type NotificationRecord = NotificationItem & { sequence: number };

function toItem(record: NotificationRecord): NotificationItem {
    return {
        id: record.id,
        title: record.title,
        body: record.body,
        source: record.source,
        href: record.href,
        createdAt: record.createdAt,
        read: record.read,
        priority: record.priority,
    };
}

function dayKey(timestamp: number): string {
    return new Date(timestamp).toISOString().slice(0, 10);
}

export function createNotificationsController(
    options: CreateNotificationsControllerOptions = {},
): NotificationsController {
    const maxItems =
        options.maxItems === undefined ? undefined : Math.max(1, Math.floor(options.maxItems));
    const now = options.now ?? (() => Date.now());

    const records: NotificationRecord[] = [];
    const listeners = new Set<(items: NotificationItem[]) => void>();
    let sequence = 0;

    const disposable = createDisposable(() => {
        listeners.clear();
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "notifications_disposed",
                message: "This notifications controller has been disposed",
            });
        }
    };

    const matches = (record: NotificationRecord, filter: NotificationFilter | undefined): boolean => {
        if (!filter) {
            return true;
        }
        if (filter.unreadOnly === true && record.read) {
            return false;
        }
        if (filter.source !== undefined && record.source !== filter.source) {
            return false;
        }
        if (filter.priority !== undefined && record.priority !== filter.priority) {
            return false;
        }
        return true;
    };

    const sorted = (filter?: NotificationFilter): NotificationRecord[] =>
        records
            .filter((record) => matches(record, filter))
            .sort((left, right) =>
                right.createdAt === left.createdAt
                    ? right.sequence - left.sequence
                    : right.createdAt - left.createdAt,
            );

    const emit = (): void => {
        const snapshot = sorted().map(toItem);
        if (options.onChange) {
            options.onChange(snapshot);
        }
        for (const listener of Array.from(listeners)) {
            listener(snapshot);
        }
    };

    const createRecord = (input: NotificationInput): NotificationRecord => {
        if (input.title.length === 0) {
            throw createError({
                code: "notifications_invalid_item",
                message: "A notification requires a title",
            });
        }

        sequence += 1;
        return {
            id: input.id ?? createPrefixedId("notification"),
            title: input.title,
            body: input.body ?? null,
            source: input.source ?? null,
            href: input.href ?? null,
            createdAt: input.createdAt ?? now(),
            read: input.read ?? false,
            priority: input.priority ?? "normal",
            sequence,
        };
    };

    const trim = (): void => {
        if (maxItems === undefined || records.length <= maxItems) {
            return;
        }
        const keep = new Set(sorted().slice(0, maxItems).map((record) => record.id));
        for (let index = records.length - 1; index >= 0; index -= 1) {
            const record = records[index];
            if (record && !keep.has(record.id)) {
                records.splice(index, 1);
            }
        }
    };

    const setRead = (id: string, read: boolean): void => {
        assertActive();
        const record = records.find((entry) => entry.id === id);
        if (!record || record.read === read) {
            return;
        }
        record.read = read;
        emit();
    };

    if (options.items) {
        for (const input of options.items) {
            records.push(createRecord(input));
        }
        trim();
    }

    return {
        get disposed() {
            return disposable.disposed;
        },
        getItems(filter) {
            return sorted(filter).map(toItem);
        },
        getItem(id) {
            const record = records.find((entry) => entry.id === id);
            return record ? toItem(record) : undefined;
        },
        getUnreadCount() {
            return records.filter((record) => !record.read).length;
        },
        push(input) {
            assertActive();
            const record = createRecord(input);
            records.push(record);
            trim();
            if (!record.read && options.onAnnounce) {
                options.onAnnounce(toItem(record));
            }
            emit();
            return toItem(record);
        },
        pushMany(inputs) {
            assertActive();
            const created = inputs.map(createRecord);
            records.push(...created);
            trim();
            if (options.onAnnounce) {
                for (const record of created) {
                    if (!record.read) {
                        options.onAnnounce(toItem(record));
                    }
                }
            }
            emit();
            return created.map(toItem);
        },
        markRead(id) {
            setRead(id, true);
        },
        markUnread(id) {
            setRead(id, false);
        },
        markAllRead() {
            assertActive();
            let changed = false;
            for (const record of records) {
                if (!record.read) {
                    record.read = true;
                    changed = true;
                }
            }
            if (changed) {
                emit();
            }
        },
        dismiss(id) {
            assertActive();
            const index = records.findIndex((entry) => entry.id === id);
            if (index < 0) {
                return;
            }
            records.splice(index, 1);
            emit();
        },
        dismissAll() {
            assertActive();
            if (records.length === 0) {
                return;
            }
            records.splice(0, records.length);
            emit();
        },
        groupBy(mode, filter) {
            const groups = new Map<string, NotificationItem[]>();
            for (const record of sorted(filter)) {
                const key = mode === "source" ? (record.source ?? "unknown") : dayKey(record.createdAt);
                const bucket = groups.get(key);
                if (bucket) {
                    bucket.push(toItem(record));
                } else {
                    groups.set(key, [toItem(record)]);
                }
            }
            return Array.from(groups, ([key, items]) => ({ key, items }));
        },
        subscribe(listener) {
            if (disposable.disposed) {
                return () => {};
            }
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            disposable.dispose();
        },
    };
}
