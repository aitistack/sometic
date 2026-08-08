import { createAuthError } from "../errors.js";
import type { AuthSession } from "../provider.js";

export type AuthStorage = {
    getSession: () => AuthSession | null | Promise<AuthSession | null>;
    setSession: (session: AuthSession) => void | Promise<void>;
    clearSession: () => void | Promise<void>;
};

export function createMemoryAuthStorage(initial: AuthSession | null = null): AuthStorage {
    let session = initial;
    return {
        getSession: () => session,
        setSession: (next) => {
            session = next;
        },
        clearSession: () => {
            session = null;
        },
    };
}

type WebStorageLike = {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
};

function createWebStorageAuthStorage(
    key: string,
    resolveStorage: () => WebStorageLike | null,
): AuthStorage {
    return {
        getSession: () => {
            const storage = resolveStorage();
            if (!storage) {
                return null;
            }
            const raw = storage.getItem(key);
            if (!raw) {
                return null;
            }
            try {
                return JSON.parse(raw) as AuthSession;
            } catch {
                throw createAuthError("AUTH_STORAGE_FAILED", "Failed to parse stored session");
            }
        },
        setSession: (session) => {
            const storage = resolveStorage();
            if (!storage) {
                throw createAuthError("AUTH_STORAGE_FAILED", "Browser storage is unavailable");
            }
            try {
                storage.setItem(key, JSON.stringify(session));
            } catch {
                throw createAuthError("AUTH_STORAGE_FAILED", "Failed to persist session");
            }
        },
        clearSession: () => {
            const storage = resolveStorage();
            storage?.removeItem(key);
        },
    };
}

export function createSessionStorageAuthStorage(key = "sometic.auth.session"): AuthStorage {
    return createWebStorageAuthStorage(key, () => {
        if (typeof globalThis.sessionStorage === "undefined") {
            return null;
        }
        return globalThis.sessionStorage;
    });
}

export function createLocalStorageAuthStorage(key = "sometic.auth.session"): AuthStorage {
    return createWebStorageAuthStorage(key, () => {
        if (typeof globalThis.localStorage === "undefined") {
            return null;
        }
        return globalThis.localStorage;
    });
}

export function createCustomAuthStorage(storage: AuthStorage): AuthStorage {
    return storage;
}
