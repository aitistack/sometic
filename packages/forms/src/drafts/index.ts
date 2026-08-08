export type DraftRecord<T> = {
    version: number;
    savedAt: number;
    values: T;
};

export type DraftStorage = {
    getItem: (key: string) => string | null | Promise<string | null>;
    setItem: (key: string, value: string) => void | Promise<void>;
    removeItem: (key: string) => void | Promise<void>;
};

export type DraftControllerOptions<T> = {
    key: string;
    version: number;
    storage: DraftStorage;
    getValues: () => T;
    setValues: (values: T) => void;
    debounceMs?: number;
    migrate?: (draft: DraftRecord<unknown>) => T | null;
    omit?: readonly string[];
    pick?: readonly string[];
    sanitize?: (values: T) => T;
};

export type DraftController<T> = {
    save: () => Promise<void>;
    load: () => Promise<T | null>;
    clear: () => Promise<void>;
    scheduleSave: () => void;
    dispose: () => void;
};

export function createMemoryDraftStorage(map = new Map<string, string>()): DraftStorage {
    return {
        getItem: (key) => map.get(key) ?? null,
        setItem: (key, value) => {
            map.set(key, value);
        },
        removeItem: (key) => {
            map.delete(key);
        },
    };
}

export function createLocalStorageDraftStorage(storage?: Storage): DraftStorage {
    return {
        getItem: (key) => {
            const store =
                storage ??
                (typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage);
            return store?.getItem(key) ?? null;
        },
        setItem: (key, value) => {
            const store =
                storage ??
                (typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage);
            store?.setItem(key, value);
        },
        removeItem: (key) => {
            const store =
                storage ??
                (typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage);
            store?.removeItem(key);
        },
    };
}

function prepareDraftValues<T>(values: T, options: DraftControllerOptions<T>): T {
    let next = values;
    if (options.pick && typeof values === "object" && values !== null) {
        const picked: Record<string, unknown> = {};
        const source = values as Record<string, unknown>;
        for (const key of options.pick) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                picked[key] = source[key];
            }
        }
        next = picked as T;
    }
    if (options.omit && typeof next === "object" && next !== null) {
        const omitted: Record<string, unknown> = { ...(next as Record<string, unknown>) };
        for (const key of options.omit) {
            delete omitted[key];
        }
        next = omitted as T;
    }
    if (options.sanitize) {
        next = options.sanitize(next);
    }
    return next;
}

export function createDraftController<T>(options: DraftControllerOptions<T>): DraftController<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    const save = async (): Promise<void> => {
        if (disposed) {
            return;
        }
        const record: DraftRecord<T> = {
            version: options.version,
            savedAt: Date.now(),
            values: prepareDraftValues(options.getValues(), options),
        };
        await options.storage.setItem(options.key, JSON.stringify(record));
    };

    const load = async (): Promise<T | null> => {
        const raw = await options.storage.getItem(options.key);
        if (!raw) {
            return null;
        }
        const parsed = JSON.parse(raw) as DraftRecord<unknown>;
        if (parsed.version !== options.version) {
            if (!options.migrate) {
                return null;
            }
            const migrated = options.migrate(parsed);
            if (migrated == null) {
                return null;
            }
            options.setValues(migrated);
            return migrated;
        }
        const values = parsed.values as T;
        options.setValues(values);
        return values;
    };

    const clear = async (): Promise<void> => {
        await options.storage.removeItem(options.key);
    };

    return {
        save,
        load,
        clear,
        scheduleSave: () => {
            if (disposed) {
                return;
            }
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                void save();
            }, options.debounceMs ?? 300);
        },
        dispose: () => {
            disposed = true;
            if (timer) {
                clearTimeout(timer);
            }
        },
    };
}
