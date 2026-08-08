import type { AuthSession, AuthSessionStatus, AuthTokens, AuthUser } from "../provider.js";

export function createSession(options: {
    status: AuthSessionStatus;
    user?: AuthUser | null;
    tokens?: AuthTokens | null;
    updatedAt?: number;
    epoch?: number;
}): AuthSession {
    return {
        status: options.status,
        user: options.user ?? null,
        tokens: options.tokens ?? null,
        updatedAt: options.updatedAt ?? Date.now(),
        epoch: options.epoch ?? 0,
    };
}

export function createSignedOutSession(epoch = 0): AuthSession {
    return createSession({ status: "signedOut", epoch });
}

export function createAnonymousSession(epoch = 0): AuthSession {
    return createSession({ status: "anonymous", epoch });
}

export function isAuthenticatedStatus(status: AuthSessionStatus): boolean {
    return status === "authenticated" || status === "refreshing";
}

export function sessionExpiresAt(session: AuthSession): number | null {
    return session.tokens?.expiresAt ?? null;
}

export function isSessionExpired(session: AuthSession, now = Date.now(), skewMs = 0): boolean {
    const expiresAt = sessionExpiresAt(session);
    if (expiresAt == null) {
        return false;
    }
    return now + skewMs >= expiresAt;
}

export function shouldBumpSessionEpoch(previous: AuthSession, next: AuthSession): boolean {
    const previousUserId = previous.user?.id ?? null;
    const nextUserId = next.user?.id ?? null;
    if (previousUserId !== nextUserId) {
        return true;
    }
    if (next.status === "signedOut" && previous.status !== "signedOut") {
        return true;
    }
    if (
        (next.status === "invalid" || next.status === "expired") &&
        previous.status !== "invalid" &&
        previous.status !== "expired" &&
        previous.status !== "signedOut" &&
        previous.status !== "anonymous"
    ) {
        return true;
    }
    if (
        isAuthenticatedStatus(next.status) &&
        (previous.status === "anonymous" ||
            previous.status === "signedOut" ||
            previous.status === "invalid" ||
            previous.status === "expired")
    ) {
        return true;
    }
    return false;
}

export function nextSessionEpoch(previous: AuthSession, next: AuthSession): number {
    const current = previous.epoch ?? 0;
    if (shouldBumpSessionEpoch(previous, next)) {
        return current + 1;
    }
    return typeof next.epoch === "number" ? next.epoch : current;
}
