import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";
import { createPrefixedId } from "@sometic/core/id";

export type ActivityEntry = {
    id: string;
    type: string;
    message: string;
    createdAt: number;
    actorId: string | null;
    resourceId: string | null;
    meta: Record<string, unknown> | null;
};

export type ActivityEntryInput = {
    type: string;
    message: string;
    id?: string;
    createdAt?: number;
    actorId?: string;
    resourceId?: string;
    meta?: Record<string, unknown>;
};

export type ActivityFilter = {
    type?: string;
    types?: string[];
    actorId?: string;
    resourceId?: string;
    since?: number;
    until?: number;
};

export type ActivityPageOptions = {
    cursor?: string | null;
    limit?: number;
    filter?: ActivityFilter;
};

export type ActivityPage = {
    items: ActivityEntry[];
    nextCursor: string | null;
    hasMore: boolean;
};

export type CreateActivityControllerOptions = {
    entries?: ActivityEntryInput[];
    pageSize?: number;
    maxEntries?: number;
    now?: () => number;
    onChange?: (entries: ActivityEntry[]) => void;
};

export type ActivityController = {
    append(input: ActivityEntryInput): ActivityEntry;
    appendMany(inputs: ActivityEntryInput[]): ActivityEntry[];
    getEntries(filter?: ActivityFilter): ActivityEntry[];
    getEntry(id: string): ActivityEntry | undefined;
    count(filter?: ActivityFilter): number;
    getPage(options?: ActivityPageOptions): ActivityPage;
    clear(): void;
    subscribe(listener: (entries: ActivityEntry[]) => void): () => void;
    readonly disposed: boolean;
    dispose(): void;
};

type ActivityRecord = ActivityEntry & { sequence: number };

function toEntry(record: ActivityRecord): ActivityEntry {
    return {
        id: record.id,
        type: record.type,
        message: record.message,
        createdAt: record.createdAt,
        actorId: record.actorId,
        resourceId: record.resourceId,
        meta: record.meta === null ? null : { ...record.meta },
    };
}

export function createActivityController(
    options: CreateActivityControllerOptions = {},
): ActivityController {
    const pageSize = Math.max(1, Math.floor(options.pageSize ?? 20));
    const maxEntries =
        options.maxEntries === undefined ? undefined : Math.max(1, Math.floor(options.maxEntries));
    const now = options.now ?? (() => Date.now());

    const records: ActivityRecord[] = [];
    const listeners = new Set<(entries: ActivityEntry[]) => void>();
    let sequence = 0;

    const disposable = createDisposable(() => {
        listeners.clear();
    });

    const matches = (record: ActivityRecord, filter: ActivityFilter | undefined): boolean => {
        if (!filter) {
            return true;
        }
        if (filter.type !== undefined && record.type !== filter.type) {
            return false;
        }
        if (filter.types !== undefined && !filter.types.includes(record.type)) {
            return false;
        }
        if (filter.actorId !== undefined && record.actorId !== filter.actorId) {
            return false;
        }
        if (filter.resourceId !== undefined && record.resourceId !== filter.resourceId) {
            return false;
        }
        if (filter.since !== undefined && record.createdAt < filter.since) {
            return false;
        }
        if (filter.until !== undefined && record.createdAt > filter.until) {
            return false;
        }
        return true;
    };

    const sorted = (filter?: ActivityFilter): ActivityRecord[] =>
        records
            .filter((record) => matches(record, filter))
            .sort((left, right) =>
                right.createdAt === left.createdAt
                    ? right.sequence - left.sequence
                    : right.createdAt - left.createdAt,
            );

    const emit = (): void => {
        const snapshot = sorted().map(toEntry);
        if (options.onChange) {
            options.onChange(snapshot);
        }
        for (const listener of Array.from(listeners)) {
            listener(snapshot);
        }
    };

    const createRecord = (input: ActivityEntryInput): ActivityRecord => {
        if (input.type.length === 0) {
            throw createError({
                code: "activity_invalid_entry",
                message: "An activity entry requires a type",
            });
        }

        sequence += 1;
        return {
            id: input.id ?? createPrefixedId("activity"),
            type: input.type,
            message: input.message,
            createdAt: input.createdAt ?? now(),
            actorId: input.actorId ?? null,
            resourceId: input.resourceId ?? null,
            meta: input.meta === undefined ? null : { ...input.meta },
            sequence,
        };
    };

    const trim = (): void => {
        if (maxEntries === undefined || records.length <= maxEntries) {
            return;
        }
        const keep = new Set(
            sorted()
                .slice(0, maxEntries)
                .map((record) => record.id),
        );
        for (let index = records.length - 1; index >= 0; index -= 1) {
            const record = records[index];
            if (record && !keep.has(record.id)) {
                records.splice(index, 1);
            }
        }
    };

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "activity_disposed",
                message: "This activity controller has been disposed",
            });
        }
    };

    if (options.entries) {
        for (const input of options.entries) {
            records.push(createRecord(input));
        }
        trim();
    }

    return {
        get disposed() {
            return disposable.disposed;
        },
        append(input) {
            assertActive();
            const record = createRecord(input);
            records.push(record);
            trim();
            emit();
            return toEntry(record);
        },
        appendMany(inputs) {
            assertActive();
            const created = inputs.map(createRecord);
            records.push(...created);
            trim();
            emit();
            return created.map(toEntry);
        },
        getEntries(filter) {
            return sorted(filter).map(toEntry);
        },
        getEntry(id) {
            const record = records.find((entry) => entry.id === id);
            return record ? toEntry(record) : undefined;
        },
        count(filter) {
            return records.filter((record) => matches(record, filter)).length;
        },
        getPage(pageOptions = {}) {
            const filtered = sorted(pageOptions.filter);
            const limit = Math.max(1, Math.floor(pageOptions.limit ?? pageSize));
            const cursor = pageOptions.cursor ?? null;

            let start = 0;
            if (cursor !== null) {
                const index = filtered.findIndex((record) => record.id === cursor);
                if (index < 0) {
                    throw createError({
                        code: "activity_invalid_cursor",
                        message: `Unknown activity cursor ${cursor}`,
                        details: { cursor },
                    });
                }
                start = index + 1;
            }

            const page = filtered.slice(start, start + limit);
            const hasMore = start + page.length < filtered.length;
            const last = page[page.length - 1];

            return {
                items: page.map(toEntry),
                nextCursor: hasMore && last ? last.id : null,
                hasMore,
            };
        },
        clear() {
            assertActive();
            records.splice(0, records.length);
            emit();
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
