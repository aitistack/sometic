import type { AuthSession, AuthUser } from "../provider.js";
import { createAuthError } from "../errors.js";

export type AuthorizationContext = {
    session: AuthSession;
    user: AuthUser | null;
};

export type AuthorizationPolicy = (context: AuthorizationContext) => boolean;

export function createPolicy(...policies: AuthorizationPolicy[]): AuthorizationPolicy {
    return (context) => policies.every((policy) => policy(context));
}

export function requireAuthenticated(): AuthorizationPolicy {
    return (context) =>
        context.session.status === "authenticated" || context.session.status === "refreshing";
}

export function requireRole(role: string): AuthorizationPolicy {
    return (context) => context.user?.roles?.includes(role) === true;
}

export function requirePermission(permission: string): AuthorizationPolicy {
    return (context) => context.user?.permissions?.includes(permission) === true;
}

export function requireClaim(key: string, expected: unknown): AuthorizationPolicy {
    return (context) => context.user?.claims?.[key] === expected;
}

export function can(session: AuthSession, policy: AuthorizationPolicy): boolean {
    return policy({ session, user: session.user });
}

export function cannot(session: AuthSession, policy: AuthorizationPolicy): boolean {
    return !can(session, policy);
}

export function authorize(session: AuthSession, policy: AuthorizationPolicy): boolean {
    return can(session, policy);
}

export function assertAuthorized(session: AuthSession, policy: AuthorizationPolicy): void {
    if (!authorize(session, policy)) {
        throw createAuthError("AUTH_UNAUTHORIZED", "Not authorized");
    }
}
