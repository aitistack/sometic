import { createDisposable } from "@sometic/core/disposable";
import { createError } from "@sometic/core/error";

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
    now?: () => number;
};

export type DraftController<T> = {
    save: () => Promise<void>;
    load: () => Promise<T | null>;
    clear: () => Promise<void>;
    scheduleSave: () => void;
    readonly disposed: boolean;
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
    if (typeof options.key !== "string" || options.key.trim() === "") {
        throw createError({
            code: "DRAFT_INVALID_KEY",
            message: "Draft key must be a non-empty string",
        });
    }
    if (!Number.isFinite(options.version) || options.version < 0) {
        throw createError({
            code: "DRAFT_INVALID_VERSION",
            message: "Draft version must be a non-negative number",
        });
    }

    const now = options.now ?? (() => Date.now());
    const debounceMs = Math.max(0, Math.floor(options.debounceMs ?? 0));
    let timer: ReturnType<typeof setTimeout> | undefined;
    let saveChain: Promise<void> = Promise.resolve();

    const disposable = createDisposable(() => {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createError({
                code: "DRAFT_DISPOSED",
                message: "This draft controller has been disposed",
            });
        }
    };

    const save = async (): Promise<void> => {
        assertActive();
        const values = prepareDraftValues(options.getValues(), options);
        const record: DraftRecord<T> = {
            version: options.version,
            savedAt: now(),
            values,
        };
        try {
            await options.storage.setItem(options.key, JSON.stringify(record));
        } catch (cause) {
            throw createError({
                code: "DRAFT_SAVE_FAILED",
                message: "Failed to save draft",
                cause,
            });
        }
    };

    const enqueueSave = (): Promise<void> => {
        saveChain = saveChain.then(save, save);
        return saveChain;
    };

    return {
        save: () => enqueueSave(),
        async load() {
            assertActive();
            let raw: string | null;
            try {
                raw = await options.storage.getItem(options.key);
            } catch (cause) {
                throw createError({
                    code: "DRAFT_LOAD_FAILED",
                    message: "Failed to load draft",
                    cause,
                });
            }
            if (raw === null || raw === "") {
                return null;
            }
            let parsed: unknown;
            try {
                parsed = JSON.parse(raw) as unknown;
            } catch (cause) {
                throw createError({
                    code: "DRAFT_PARSE_FAILED",
                    message: "Draft storage contained invalid JSON",
                    cause,
                });
            }
            if (
                typeof parsed !== "object" ||
                parsed === null ||
                !("version" in parsed) ||
                !("values" in parsed)
            ) {
                throw createError({
                    code: "DRAFT_INVALID_RECORD",
                    message: "Draft record shape is invalid",
                });
            }
            const record = parsed as DraftRecord<unknown>;
            let values: T | null;
            if (record.version !== options.version) {
                if (!options.migrate) {
                    return null;
                }
                values = options.migrate(record);
            } else {
                values = record.values as T;
            }
            if (values === null) {
                return null;
            }
            const prepared = prepareDraftValues(values, options);
            options.setValues(prepared);
            return prepared;
        },
        async clear() {
            assertActive();
            if (timer !== undefined) {
                clearTimeout(timer);
                timer = undefined;
            }
            try {
                await options.storage.removeItem(options.key);
            } catch (cause) {
                throw createError({
                    code: "DRAFT_CLEAR_FAILED",
                    message: "Failed to clear draft",
                    cause,
                });
            }
        },
        scheduleSave() {
            assertActive();
            if (debounceMs === 0) {
                void enqueueSave();
                return;
            }
            if (timer !== undefined) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                timer = undefined;
                void enqueueSave();
            }, debounceMs);
        },
        get disposed() {
            return disposable.disposed;
        },
        dispose() {
            disposable.dispose();
        },
    };
}
