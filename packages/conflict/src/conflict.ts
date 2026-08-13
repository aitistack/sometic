import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";
import { createPrefixedId } from "@sometic/core/id";

export type ConflictSide = "local" | "remote";

export type ConflictRecord<TValue = unknown> = {
    id: string;
    key: string;
    local: TValue;
    remote: TValue;
    localUpdatedAt: number;
    remoteUpdatedAt: number;
    status: "open" | "resolved";
    resolution?: TValue;
    strategyId?: string;
};

export type ConflictStrategy<TValue = unknown> = {
    id: string;
    resolve: (conflict: ConflictRecord<TValue>) => TValue;
};

export type CreateConflictControllerOptions = {
    strategies?: readonly ConflictStrategy[];
    defaultStrategyId?: string;
    now?: () => number;
    onChange?: (conflicts: ConflictRecord[]) => void;
};

export type ConflictController = {
    registerStrategy: <TValue>(strategy: ConflictStrategy<TValue>) => () => void;
    open: <TValue>(input: {
        key: string;
        local: TValue;
        remote: TValue;
        localUpdatedAt?: number;
        remoteUpdatedAt?: number;
        id?: string;
    }) => ConflictRecord<TValue>;
    resolve: <TValue = unknown>(id: string, strategyId?: string) => ConflictRecord<TValue>;
    resolveWith: <TValue>(id: string, value: TValue) => ConflictRecord<TValue>;
    get: (id: string) => ConflictRecord | undefined;
    list: (status?: ConflictRecord["status"]) => ConflictRecord[];
    clearResolved: () => void;
    subscribe: (listener: (conflicts: ConflictRecord[]) => void) => () => void;
    readonly disposed: boolean;
    dispose: () => void;
};

export const lastWriteWinsStrategy: ConflictStrategy = {
    id: "lww",
    resolve(conflict) {
        return conflict.localUpdatedAt >= conflict.remoteUpdatedAt
            ? conflict.local
            : conflict.remote;
    },
};

export const clientWinsStrategy: ConflictStrategy = {
    id: "client-wins",
    resolve(conflict) {
        return conflict.local;
    },
};

export const serverWinsStrategy: ConflictStrategy = {
    id: "server-wins",
    resolve(conflict) {
        return conflict.remote;
    },
};

export function createConflictController(
    options: CreateConflictControllerOptions = {},
): ConflictController {
    const now = options.now ?? (() => Date.now());
    const strategies = new Map<string, ConflictStrategy>();
    for (const strategy of [
        lastWriteWinsStrategy,
        clientWinsStrategy,
        serverWinsStrategy,
        ...(options.strategies ?? []),
    ]) {
        strategies.set(strategy.id, strategy);
    }
    const defaultStrategyId = options.defaultStrategyId ?? "lww";
    if (!strategies.has(defaultStrategyId)) {
        throw createError({
            code: "CONFLICT_UNKNOWN_STRATEGY",
            message: `Unknown default strategy: ${defaultStrategyId}`,
        });
    }

    const conflicts = new Map<string, ConflictRecord>();
    const listeners = new Set<(conflicts: ConflictRecord[]) => void>();
    const disposable = createDisposable(() => {
        conflicts.clear();
        listeners.clear();
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "CONFLICT_DISPOSED",
                message: "This conflict controller has been disposed",
            });
        }
    };

    const snapshot = (): ConflictRecord[] => [...conflicts.values()].map((item) => ({ ...item }));

    const emit = (): void => {
        const next = snapshot();
        options.onChange?.(next);
        for (const listener of listeners) {
            listener(next);
        }
    };

    return {
        registerStrategy(strategy) {
            assertActive();
            if (strategies.has(strategy.id)) {
                throw createError({
                    code: "CONFLICT_STRATEGY_DUPLICATE",
                    message: `Strategy already registered: ${strategy.id}`,
                });
            }
            strategies.set(strategy.id, strategy as ConflictStrategy);
            return () => {
                strategies.delete(strategy.id);
            };
        },
        open(input) {
            assertActive();
            if (typeof input.key !== "string" || input.key.trim() === "") {
                throw createError({
                    code: "CONFLICT_INVALID_KEY",
                    message: "Conflict key must be a non-empty string",
                });
            }
            const record: ConflictRecord = {
                id: input.id ?? createPrefixedId("conflict"),
                key: input.key,
                local: input.local,
                remote: input.remote,
                localUpdatedAt: input.localUpdatedAt ?? now(),
                remoteUpdatedAt: input.remoteUpdatedAt ?? now(),
                status: "open",
            };
            conflicts.set(record.id, record);
            emit();
            return { ...record } as never;
        },
        resolve(id, strategyId = defaultStrategyId) {
            assertActive();
            const record = conflicts.get(id);
            if (!record) {
                throw createError({
                    code: "CONFLICT_NOT_FOUND",
                    message: `Unknown conflict: ${id}`,
                });
            }
            if (record.status === "resolved") {
                return { ...record } as never;
            }
            const strategy = strategies.get(strategyId);
            if (!strategy) {
                throw createError({
                    code: "CONFLICT_UNKNOWN_STRATEGY",
                    message: `Unknown strategy: ${strategyId}`,
                });
            }
            const resolution = strategy.resolve(record);
            const next: ConflictRecord = {
                ...record,
                status: "resolved",
                resolution,
                strategyId,
            };
            conflicts.set(id, next);
            emit();
            return { ...next } as never;
        },
        resolveWith(id, value) {
            assertActive();
            const record = conflicts.get(id);
            if (!record) {
                throw createError({
                    code: "CONFLICT_NOT_FOUND",
                    message: `Unknown conflict: ${id}`,
                });
            }
            const next: ConflictRecord = {
                ...record,
                status: "resolved",
                resolution: value,
                strategyId: "manual",
            };
            conflicts.set(id, next);
            emit();
            return { ...next } as never;
        },
        get(id) {
            assertActive();
            const record = conflicts.get(id);
            return record ? { ...record } : undefined;
        },
        list(status) {
            assertActive();
            return snapshot().filter((item) => (status ? item.status === status : true));
        },
        clearResolved() {
            assertActive();
            for (const [id, record] of conflicts) {
                if (record.status === "resolved") {
                    conflicts.delete(id);
                }
            }
            emit();
        },
        subscribe(listener) {
            assertActive();
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        get disposed() {
            return disposable.disposed;
        },
        dispose() {
            disposable.dispose();
        },
    };
}
