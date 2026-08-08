import { createStore } from "../create-store.js";
import type { CreateStoreOptions, DisposableStore } from "../types.js";
import {
    createPersistentStore,
    createMemoryStorage,
    type CreatePersistentStoreOptions,
    type PersistMigration,
    type PersistedEnvelope,
    type PersistentStore,
    type StorageAdapter,
} from "../persistent/index.js";
import {
    createCrossTabStore,
    type CreateCrossTabStoreOptions,
    type CrossTabStore,
} from "../cross-tab/index.js";

export type PersistenceEncryptor = {
    encrypt(plaintext: string): string;
    decrypt(ciphertext: string): string;
};

export type CreatePersistenceProfileOptions<TState> = {
    version: number;
    migrate?: PersistMigration<TState>["migrate"] | readonly PersistMigration<TState>[];
    denyKeys?: readonly string[];
    encrypt?: PersistenceEncryptor;
};

export type PersistenceProfile<TState> = Pick<
    CreatePersistentStoreOptions<TState>,
    "version" | "migrations" | "serialize" | "deserialize"
>;

function stripDeniedKeys<TState>(state: TState, denyKeys: readonly string[] | undefined): TState {
    if (!denyKeys || denyKeys.length === 0 || state === null || typeof state !== "object") {
        return state;
    }
    const next: Record<string, unknown> = { ...(state as Record<string, unknown>) };
    for (const key of denyKeys) {
        delete next[key];
    }
    return next as TState;
}

export function createPersistenceProfile<TState>(
    options: CreatePersistenceProfileOptions<TState>,
): PersistenceProfile<TState> {
    const denyKeys = options.denyKeys;
    const encryptor = options.encrypt;

    const migrations: readonly PersistMigration<TState>[] =
        options.migrate == null
            ? []
            : typeof options.migrate === "function"
              ? [{ version: options.version, migrate: options.migrate }]
              : options.migrate;

    const serialize = (envelope: PersistedEnvelope<TState>): string => {
        const stripped: PersistedEnvelope<TState> = {
            version: envelope.version,
            state: stripDeniedKeys(envelope.state, denyKeys),
        };
        const raw = JSON.stringify(stripped);
        return encryptor ? encryptor.encrypt(raw) : raw;
    };

    const deserialize = (raw: string): PersistedEnvelope<TState> | undefined => {
        try {
            const plaintext = encryptor ? encryptor.decrypt(raw) : raw;
            const parsed = JSON.parse(plaintext) as PersistedEnvelope<TState>;
            if (!parsed || typeof parsed !== "object" || typeof parsed.version !== "number") {
                return undefined;
            }
            return {
                version: parsed.version,
                state: stripDeniedKeys(parsed.state, denyKeys),
            };
        } catch {
            return undefined;
        }
    };

    return {
        version: options.version,
        migrations,
        serialize,
        deserialize,
    };
}

export function createUiStore<TState>(
    initialState: TState,
    options: CreateStoreOptions<TState> = {},
): DisposableStore<TState> {
    return createStore(initialState, options);
}

export type CreatePrefsStoreOptions<TState> = {
    key: string;
    storage?: StorageAdapter;
    version?: number;
    denyKeys?: readonly string[];
    migrate?: CreatePersistenceProfileOptions<TState>["migrate"];
    encrypt?: PersistenceEncryptor;
    equalityFn?: CreatePersistentStoreOptions<TState>["equalityFn"];
    onPersistError?: CreatePersistentStoreOptions<TState>["onPersistError"];
    crossTab?: boolean | Omit<CreateCrossTabStoreOptions<TState>, "key">;
};

export function createPrefsStore<TState>(
    initialState: TState,
    options: CreatePrefsStoreOptions<TState>,
): PersistentStore<TState> | CrossTabStore<TState> {
    const profileOptions: CreatePersistenceProfileOptions<TState> = {
        version: options.version ?? 1,
    };
    if (options.denyKeys !== undefined) {
        profileOptions.denyKeys = options.denyKeys;
    }
    if (options.migrate !== undefined) {
        profileOptions.migrate = options.migrate;
    }
    if (options.encrypt !== undefined) {
        profileOptions.encrypt = options.encrypt;
    }
    const profile = createPersistenceProfile<TState>(profileOptions);

    if (options.crossTab) {
        const crossTabOptions =
            options.crossTab === true
                ? { key: options.key }
                : { key: options.key, ...options.crossTab };
        return createCrossTabStore(initialState, crossTabOptions);
    }

    const persistentOptions: CreatePersistentStoreOptions<TState> = {
        key: options.key,
        storage: options.storage ?? createMemoryStorage(),
        version: profile.version ?? 1,
        serialize: profile.serialize!,
        deserialize: profile.deserialize!,
    };
    if (profile.migrations !== undefined) {
        persistentOptions.migrations = profile.migrations;
    }
    if (options.equalityFn !== undefined) {
        persistentOptions.equalityFn = options.equalityFn;
    }
    if (options.onPersistError !== undefined) {
        persistentOptions.onPersistError = options.onPersistError;
    }

    return createPersistentStore(initialState, persistentOptions);
}

export function createSessionStore<TState>(
    initialState: TState,
    options: CreateStoreOptions<TState> = {},
): DisposableStore<TState> {
    return createStore(initialState, options);
}
