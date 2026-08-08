import { SometicError } from "@sometic/core/error";
import { safeJsonParse, safeJsonStringify } from "@sometic/core/utils";
import { createStore } from "../create-store.js";
import type { DisposableStore, StoreEqualityFn } from "../types.js";

export type StorageAdapter = {
    readonly name: string;
    getItem(key: string): string | null | Promise<string | null>;
    setItem(key: string, value: string): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
};

export type PersistedEnvelope<TState> = {
    readonly version: number;
    readonly state: TState;
};

export type PersistMigration<TState> = {
    readonly version: number;
    migrate(previous: unknown): TState | unknown;
};

export type CreatePersistentStoreOptions<TState> = {
    key: string;
    storage: StorageAdapter;
    version?: number;
    migrations?: readonly PersistMigration<TState>[];
    serialize?: (envelope: PersistedEnvelope<TState>) => string;
    deserialize?: (raw: string) => PersistedEnvelope<TState> | undefined;
    equalityFn?: StoreEqualityFn<TState>;
    onPersistError?: (error: unknown) => void;
    syncInitial?: boolean;
};

export type PersistentStore<TState> = DisposableStore<TState> & {
    readonly hydrated: Promise<void>;
    persistNow(): Promise<void>;
    clearPersisted(): Promise<void>;
};

export function createMemoryStorage(): StorageAdapter {
    const map = new Map<string, string>();
    return {
        name: "memory",
        getItem(key) {
            return map.get(key) ?? null;
        },
        setItem(key, value) {
            map.set(key, value);
        },
        removeItem(key) {
            map.delete(key);
        },
    };
}

export function createWebStorageAdapter(kind: "localStorage" | "sessionStorage"): StorageAdapter {
    return {
        name: kind,
        getItem(key) {
            const storage = resolveWebStorage(kind);
            if (!storage) {
                return null;
            }

            try {
                return storage.getItem(key);
            } catch (error) {
                throw new SometicError({
                    code: "STORE_STORAGE_READ_FAILED",
                    message: `Failed to read ${kind} key "${key}"`,
                    cause: error,
                });
            }
        },
        setItem(key, value) {
            const storage = resolveWebStorage(kind);
            if (!storage) {
                return;
            }

            try {
                storage.setItem(key, value);
            } catch (error) {
                throw new SometicError({
                    code: "STORE_STORAGE_WRITE_FAILED",
                    message: `Failed to write ${kind} key "${key}"`,
                    cause: error,
                });
            }
        },
        removeItem(key) {
            const storage = resolveWebStorage(kind);
            if (!storage) {
                return;
            }

            try {
                storage.removeItem(key);
            } catch (error) {
                throw new SometicError({
                    code: "STORE_STORAGE_REMOVE_FAILED",
                    message: `Failed to remove ${kind} key "${key}"`,
                    cause: error,
                });
            }
        },
    };
}

function resolveWebStorage(kind: "localStorage" | "sessionStorage"): Storage | undefined {
    const candidate = globalThis as {
        localStorage?: Storage;
        sessionStorage?: Storage;
    };
    const storage = kind === "localStorage" ? candidate.localStorage : candidate.sessionStorage;
    if (!storage || typeof storage.getItem !== "function") {
        return undefined;
    }

    return storage;
}

function defaultSerialize<TState>(envelope: PersistedEnvelope<TState>): string {
    const raw = safeJsonStringify(envelope);
    if (raw === undefined) {
        throw new SometicError({
            code: "STORE_PERSIST_SERIALIZE_FAILED",
            message: "Failed to serialize persisted store envelope",
        });
    }

    return raw;
}

function defaultDeserialize<TState>(raw: string): PersistedEnvelope<TState> | undefined {
    const parsed = safeJsonParse<PersistedEnvelope<TState>>(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.version !== "number") {
        return undefined;
    }

    return parsed;
}

function applyMigrations<TState>(
    value: unknown,
    fromVersion: number,
    targetVersion: number,
    migrations: readonly PersistMigration<TState>[],
): TState {
    let current: unknown = value;
    let version = fromVersion;
    const ordered = [...migrations].sort((left, right) => left.version - right.version);

    for (const migration of ordered) {
        if (migration.version <= version || migration.version > targetVersion) {
            continue;
        }

        current = migration.migrate(current);
        version = migration.version;
    }

    if (version !== targetVersion) {
        throw new SometicError({
            code: "STORE_PERSIST_MIGRATION_GAP",
            message: `Missing migration path from version ${String(fromVersion)} to ${String(targetVersion)}`,
            details: { fromVersion, targetVersion, reachedVersion: version },
        });
    }

    return current as TState;
}

export function createPersistentStore<TState>(
    initialState: TState,
    options: CreatePersistentStoreOptions<TState>,
): PersistentStore<TState> {
    const version = options.version ?? 1;
    const migrations = options.migrations ?? [];
    const serialize = options.serialize ?? defaultSerialize;
    const deserialize = options.deserialize ?? defaultDeserialize;
    const store = createStore(
        initialState,
        options.equalityFn ? { equalityFn: options.equalityFn } : {},
    );
    let ready = false;

    const reportError = (error: unknown): void => {
        options.onPersistError?.(error);
    };

    const write = async (state: TState): Promise<void> => {
        try {
            const envelope: PersistedEnvelope<TState> = { version, state };
            await options.storage.setItem(options.key, serialize(envelope));
        } catch (error) {
            reportError(error);
            throw error;
        }
    };

    const hydrated = (async () => {
        try {
            const raw = await options.storage.getItem(options.key);
            if (raw === null) {
                if (options.syncInitial !== false) {
                    await write(store.get());
                }
                return;
            }

            const envelope = deserialize(raw);
            if (!envelope) {
                reportError(
                    new SometicError({
                        code: "STORE_PERSIST_CORRUPT",
                        message: `Corrupt persisted payload for key "${options.key}"`,
                    }),
                );
                return;
            }

            const nextState =
                envelope.version === version
                    ? envelope.state
                    : applyMigrations(envelope.state, envelope.version, version, migrations);

            store.set(nextState);
        } catch (error) {
            reportError(error);
        } finally {
            ready = true;
        }
    })();

    const unsubscribe = store.subscribe((state) => {
        if (!ready) {
            return;
        }

        void write(state).catch(() => undefined);
    });

    return {
        get disposed() {
            return store.disposed;
        },
        get: () => store.get(),
        set: (next) => {
            store.set(next);
        },
        update: (updater) => {
            store.update(updater);
        },
        batch: (run) => {
            store.batch(run);
        },
        subscribe: (listener) => store.subscribe(listener),
        hydrated,
        async persistNow() {
            await hydrated;
            await write(store.get());
        },
        async clearPersisted() {
            await options.storage.removeItem(options.key);
        },
        dispose() {
            unsubscribe();
            store.dispose();
        },
    };
}
