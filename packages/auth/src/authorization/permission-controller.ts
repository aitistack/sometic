import { createDisposable } from "@sometic/core/disposable";
import { AUTH_ERROR_CODES, createAuthError } from "../errors.js";
import type { AuthController } from "../create-auth.js";
import { can, requirePermission, type AuthorizationPolicy } from "./index.js";

export type PermissionGrant = {
    permission: string;
    resource?: string;
    scope?: string;
};

export type PermissionCheck = {
    permission: string;
    resource?: string;
    scope?: string;
};

export type CreatePermissionControllerOptions = {
    auth: AuthController;
    grants?: readonly PermissionGrant[];
    onChange?: (grants: PermissionGrant[]) => void;
};

export type PermissionController = {
    grant: (grant: PermissionGrant) => void;
    revoke: (grant: PermissionGrant) => void;
    clearGrants: () => void;
    listGrants: () => PermissionGrant[];
    can: (check: PermissionCheck | string) => boolean;
    require: (check: PermissionCheck | string) => void;
    policy: (check: PermissionCheck | string) => AuthorizationPolicy;
    subscribe: (listener: (grants: PermissionGrant[]) => void) => () => void;
    readonly disposed: boolean;
    dispose: () => void;
};

function normalizeCheck(check: PermissionCheck | string): PermissionCheck {
    if (typeof check === "string") {
        return { permission: check };
    }
    return check;
}

function grantKey(grant: PermissionGrant): string {
    return `${grant.permission}::${grant.resource ?? ""}::${grant.scope ?? ""}`;
}

export function createPermissionController(
    options: CreatePermissionControllerOptions,
): PermissionController {
    let grants = new Map<string, PermissionGrant>();
    for (const grant of options.grants ?? []) {
        grants.set(grantKey(grant), { ...grant });
    }
    const listeners = new Set<(grants: PermissionGrant[]) => void>();
    const disposable = createDisposable(() => {
        listeners.clear();
        grants.clear();
    });

    const assertActive = (): void => {
        if (disposable.disposed) {
            throw createAuthError(
                AUTH_ERROR_CODES.disposed,
                "This permission controller has been disposed",
            );
        }
    };

    const snapshot = (): PermissionGrant[] => [...grants.values()].map((grant) => ({ ...grant }));

    const emit = (): void => {
        const next = snapshot();
        options.onChange?.(next);
        for (const listener of listeners) {
            listener(next);
        }
    };

    const matches = (check: PermissionCheck): boolean => {
        for (const grant of grants.values()) {
            if (grant.permission !== check.permission) {
                continue;
            }
            if (check.resource !== undefined && grant.resource !== check.resource) {
                continue;
            }
            if (check.scope !== undefined && grant.scope !== check.scope) {
                continue;
            }
            if (check.resource === undefined && grant.resource !== undefined) {
                continue;
            }
            if (check.scope === undefined && grant.scope !== undefined) {
                continue;
            }
            return true;
        }
        if (check.resource !== undefined || check.scope !== undefined) {
            return false;
        }
        return can(options.auth.getSession(), requirePermission(check.permission));
    };

    return {
        grant(grant) {
            assertActive();
            if (typeof grant.permission !== "string" || grant.permission.trim() === "") {
                throw createAuthError(
                    AUTH_ERROR_CODES.invalidPermission,
                    "Permission must be a non-empty string",
                );
            }
            grants.set(grantKey(grant), { ...grant });
            emit();
        },
        revoke(grant) {
            assertActive();
            grants.delete(grantKey(grant));
            emit();
        },
        clearGrants() {
            assertActive();
            grants = new Map();
            emit();
        },
        listGrants() {
            assertActive();
            return snapshot();
        },
        can(check) {
            assertActive();
            return matches(normalizeCheck(check));
        },
        require(check) {
            assertActive();
            if (!matches(normalizeCheck(check))) {
                throw createAuthError(AUTH_ERROR_CODES.unauthorized, "Not authorized");
            }
        },
        policy(check) {
            const normalized = normalizeCheck(check);
            return () => matches(normalized);
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
