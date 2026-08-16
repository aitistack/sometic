import { createAuthError } from "../errors.js";
import type { AuthProvider, AuthSession } from "../provider.js";
import { createSession, isSessionExpired } from "../session/index.js";

export type RefreshCoordinatorOptions = {
    provider: AuthProvider;
    getSession: () => AuthSession;
    setSession: (session: AuthSession) => void | Promise<void>;
    skewMs?: number;
    maxRetries?: number;
    timeoutMs?: number;
    now?: () => number;
};

export type RefreshCoordinator = {
    refresh: (reason?: string) => Promise<AuthSession>;
    isRefreshing: () => boolean;
    shouldRefresh: (session?: AuthSession) => boolean;
    dispose: () => void;
};

export function createRefreshCoordinator(options: RefreshCoordinatorOptions): RefreshCoordinator {
    const skewMs = options.skewMs ?? 30_000;
    const maxRetries = options.maxRetries ?? 1;
    const timeoutMs = options.timeoutMs ?? 15_000;
    const now = options.now ?? Date.now;
    let inflight: Promise<AuthSession> | null = null;
    let disposed = false;
    let attempt = 0;

    const shouldRefresh = (session = options.getSession()): boolean => {
        if (session.status === "signedOut" || session.status === "anonymous") {
            return false;
        }
        if (session.status === "expired" || session.status === "refreshing") {
            return true;
        }
        return isSessionExpired(session, now(), skewMs);
    };

    const refresh = async (): Promise<AuthSession> => {
        if (disposed) {
            throw createAuthError("AUTH_DISPOSED", "Auth refresh coordinator disposed");
        }
        if (!options.provider.capabilities.has("refresh") || !options.provider.refresh) {
            throw createAuthError("AUTH_UNSUPPORTED", "Provider does not support refresh");
        }
        if (inflight) {
            return inflight;
        }

        const run = async (): Promise<AuthSession> => {
            const current = options.getSession();
            const next = createSession({
                status: "refreshing",
                user: current.user,
                tokens: current.tokens,
                epoch: current.epoch,
            });
            await options.setSession(next);

            for (attempt = 0; attempt <= maxRetries; attempt += 1) {
                const controller = new AbortController();
                const timer = setTimeout(() => {
                    controller.abort();
                }, timeoutMs);
                try {
                    const result = await Promise.race([
                        options.provider.refresh!(current),
                        new Promise<never>((_, reject) => {
                            controller.signal.addEventListener(
                                "abort",
                                () => {
                                    reject(
                                        createAuthError("AUTH_REFRESH_FAILED", "Refresh timed out"),
                                    );
                                },
                                { once: true },
                            );
                        }),
                    ]);
                    clearTimeout(timer);
                    const next = createSession({
                        status: "authenticated",
                        user: result.session.user,
                        tokens: result.session.tokens,
                        epoch: current.epoch,
                    });
                    await options.setSession(next);
                    return next;
                } catch {
                    clearTimeout(timer);
                }
            }

            const invalid = createSession({
                status: "invalid",
                user: null,
                tokens: null,
                epoch: current.epoch,
            });
            await options.setSession(invalid);
            throw createAuthError("AUTH_REFRESH_FAILED", "Session refresh failed");
        };

        inflight = run().finally(() => {
            inflight = null;
            attempt = 0;
        });
        return inflight;
    };

    return {
        refresh,
        isRefreshing: () => inflight !== null,
        shouldRefresh,
        dispose: () => {
            disposed = true;
            inflight = null;
        },
    };
}
