import { createId } from "@sometic/core/id";
import { hasCapability, type AuthCapability } from "./capabilities.js";
import { createAuthError } from "./errors.js";
import {
    assertAuthorized,
    authorize,
    can,
    cannot,
    type AuthorizationPolicy,
} from "./authorization/index.js";
import type {
    AuthProvider,
    AuthSession,
    AuthUser,
    MfaChallenge,
    OAuthCallbackOptions,
    OAuthStartOptions,
    OAuthStartResult,
    RegisterCredentials,
    SignInCredentials,
} from "./provider.js";
import { createRefreshCoordinator, type RefreshCoordinator } from "./refresh/index.js";
import {
    createAnonymousSession,
    createSession,
    createSignedOutSession,
    isAuthenticatedStatus,
    isSessionExpired,
    nextSessionEpoch,
} from "./session/index.js";
import { createMemoryAuthStorage, type AuthStorage } from "./storage/index.js";

export type AuthListener = (session: AuthSession) => void;

export type AuthEvent =
    "ready" | "signedIn" | "signedOut" | "sessionUpdated" | "tokenRefreshed" | "error";

export type AuthEventMap = {
    ready: AuthSession;
    signedIn: AuthSession;
    signedOut: AuthSession;
    sessionUpdated: AuthSession;
    tokenRefreshed: AuthSession;
    error: { error: unknown; session: AuthSession };
};

export type AuthCrossTabMessage =
    | { type: "logout"; sourceId: string }
    | { type: "session"; sourceId: string; session: AuthSession };

export type AuthCrossTabBus = {
    post: (message: AuthCrossTabMessage) => void;
    subscribe: (listener: (message: AuthCrossTabMessage) => void) => () => void;
    dispose: () => void;
};

export type AuthEnvironment = {
    addEventListener?: (type: string, listener: () => void) => void;
    removeEventListener?: (type: string, listener: () => void) => void;
    document?: {
        visibilityState?: string;
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
    };
    navigator?: { onLine?: boolean };
};

export type CreateAuthOptions = {
    provider: AuthProvider;
    storage?: AuthStorage;
    skewMs?: number;
    crossTab?: AuthCrossTabBus | false;
    crossTabIncludeTokens?: boolean;
    now?: () => number;
    autoRefresh?: boolean;
    refreshIntervalMs?: number;
    environment?: AuthEnvironment | false;
};

export type StepUpReason = "mfa" | "reauthentication";

export type StepUpRequestResult = {
    session: AuthSession;
    challenge?: MfaChallenge;
};

export type AuthController = {
    readonly providerId: string;
    readonly ready: Promise<AuthSession>;
    getSession: () => AuthSession;
    getEpoch: () => number;
    getUser: () => AuthUser | null;
    getAccessToken: () => string | null;
    getRefreshToken: () => string | null;
    isAuthenticated: () => boolean;
    isReady: () => boolean;
    whenReady: () => Promise<AuthSession>;
    subscribe: (listener: AuthListener) => () => void;
    on: <K extends AuthEvent>(event: K, listener: (payload: AuthEventMap[K]) => void) => () => void;
    supports: (capability: AuthCapability) => boolean;
    signIn: (credentials: SignInCredentials) => Promise<AuthSession>;
    signOut: () => Promise<AuthSession>;
    register: (credentials: RegisterCredentials) => Promise<AuthSession>;
    refresh: (reason?: string) => Promise<AuthSession>;
    ensureFreshSession: () => Promise<AuthSession>;
    handleUnauthorized: () => Promise<AuthSession>;
    hydrate: (session: AuthSession) => Promise<void>;
    requestStepUp: (input?: { reason?: StepUpReason }) => Promise<StepUpRequestResult>;
    completeStepUp: (input?: { challengeId?: string; code?: string }) => Promise<AuthSession>;
    requestPasswordReset: (email: string) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    startOAuth: (options: OAuthStartOptions) => Promise<OAuthStartResult>;
    completeOAuth: (options: OAuthCallbackOptions) => Promise<AuthSession>;
    startMfa: () => Promise<MfaChallenge>;
    verifyMfa: (challengeId: string, code: string) => Promise<AuthSession>;
    revokeSession: () => Promise<AuthSession>;
    revokeAllSessions: () => Promise<AuthSession>;
    can: (policy: AuthorizationPolicy) => boolean;
    cannot: (policy: AuthorizationPolicy) => boolean;
    authorize: (policy: AuthorizationPolicy) => boolean;
    assertAuthorized: (policy: AuthorizationPolicy) => void;
    dispose: () => void;
};

export function createBroadcastAuthBus(channelName = "sometic.auth"): AuthCrossTabBus {
    const candidate = globalThis as {
        BroadcastChannel?: new (name: string) => BroadcastChannel;
    };
    if (typeof candidate.BroadcastChannel !== "function") {
        return createNoopAuthBus();
    }
    const channel = new candidate.BroadcastChannel(channelName);
    const listeners = new Set<(message: AuthCrossTabMessage) => void>();
    const onMessage = (event: MessageEvent<AuthCrossTabMessage>) => {
        const data = event.data;
        if (!data || typeof data.type !== "string") {
            return;
        }
        for (const listener of listeners) {
            listener(data);
        }
    };
    channel.addEventListener("message", onMessage);
    return {
        post: (message) => {
            channel.postMessage(message);
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose: () => {
            listeners.clear();
            channel.removeEventListener("message", onMessage);
            channel.close();
        },
    };
}

export function createNoopAuthBus(): AuthCrossTabBus {
    return {
        post: () => undefined,
        subscribe: () => () => undefined,
        dispose: () => undefined,
    };
}

export function createAuth(options: CreateAuthOptions): AuthController {
    const storage = options.storage ?? createMemoryAuthStorage();
    const sourceId = createId();
    const listeners = new Set<AuthListener>();
    const eventListeners = new Map<AuthEvent, Set<(payload: never) => void>>();
    const now = options.now ?? Date.now;
    let session = createAnonymousSession();
    let disposed = false;
    let ready = false;
    let refresh: RefreshCoordinator | null = null;
    let refreshTimer: ReturnType<typeof setInterval> | null = null;
    let resolveReady!: (session: AuthSession) => void;
    const readyPromise = new Promise<AuthSession>((resolve) => {
        resolveReady = resolve;
    });

    const emit = <K extends AuthEvent>(event: K, payload: AuthEventMap[K]): void => {
        const set = eventListeners.get(event);
        if (!set) {
            return;
        }
        for (const listener of set) {
            (listener as (value: AuthEventMap[K]) => void)(payload);
        }
    };

    const notify = (): void => {
        for (const listener of listeners) {
            listener(session);
        }
        emit("sessionUpdated", session);
    };

    const setSession = async (
        next: AuthSession,
        broadcast = true,
        event?: AuthEvent,
        epochMode: "derive" | "adopt" = "derive",
    ): Promise<void> => {
        const previous = session;
        const epoch =
            epochMode === "adopt"
                ? (next.epoch ?? previous.epoch ?? 0)
                : nextSessionEpoch(previous, next);
        session = {
            ...next,
            epoch,
            updatedAt: next.updatedAt || Date.now(),
        };
        await storage.setSession(session);
        if (broadcast && crossTab) {
            const payload =
                options.crossTabIncludeTokens === false ? { ...session, tokens: null } : session;
            crossTab.post({ type: "session", sourceId, session: payload });
        }
        notify();
        if (event) {
            emit(event, session as AuthEventMap[typeof event]);
        } else if (
            isAuthenticatedStatus(session.status) &&
            !isAuthenticatedStatus(previous.status)
        ) {
            emit("signedIn", session);
        } else if (session.status === "signedOut" && previous.status !== "signedOut") {
            emit("signedOut", session);
        }
    };

    const crossTab =
        options.crossTab === false ? null : (options.crossTab ?? createBroadcastAuthBus());

    refresh = createRefreshCoordinator({
        provider: options.provider,
        getSession: () => session,
        setSession: async (next) => {
            await setSession(
                next,
                true,
                next.status === "authenticated" ? "tokenRefreshed" : undefined,
            );
        },
        ...(options.skewMs === undefined ? {} : { skewMs: options.skewMs }),
        now,
    });

    const unsubTab = crossTab?.subscribe((message) => {
        if (message.sourceId === sourceId) {
            return;
        }
        if (message.type === "logout") {
            void setSession(createSignedOutSession(session.epoch + 1), false, "signedOut", "adopt");
            return;
        }
        if (message.type === "session") {
            void setSession(message.session, false, undefined, "adopt");
        }
    });

    const assertActive = (): void => {
        if (disposed) {
            throw createAuthError("AUTH_DISPOSED", "Auth controller disposed");
        }
    };

    const assertCapability = (capability: AuthCapability): void => {
        if (!hasCapability(options.provider.capabilities, capability)) {
            throw createAuthError("AUTH_UNSUPPORTED", `Provider does not support ${capability}`);
        }
    };

    const maybeProactiveRefresh = (): void => {
        if (!options.autoRefresh || disposed) {
            return;
        }
        if (!refresh?.shouldRefresh(session)) {
            return;
        }
        void refresh.refresh("proactive").catch((error) => {
            emit("error", { error, session });
        });
    };

    const environment =
        options.environment === false
            ? null
            : (options.environment ?? {
                  addEventListener: globalThis.addEventListener?.bind(globalThis),
                  removeEventListener: globalThis.removeEventListener?.bind(globalThis),
                  document: globalThis.document,
                  navigator: globalThis.navigator,
              });

    const onVisible = (): void => {
        if (environment?.document?.visibilityState === "visible") {
            maybeProactiveRefresh();
        }
    };
    const onOnline = (): void => {
        maybeProactiveRefresh();
    };

    if (options.autoRefresh === true) {
        refreshTimer = setInterval(maybeProactiveRefresh, options.refreshIntervalMs ?? 30_000);
        environment?.document?.addEventListener?.("visibilitychange", onVisible);
        environment?.addEventListener?.("online", onOnline);
    }

    void (async () => {
        try {
            const stored = await storage.getSession();
            if (stored) {
                session = {
                    ...stored,
                    epoch: stored.epoch ?? 0,
                };
                notify();
            } else if (options.provider.getSession) {
                const remote = await options.provider.getSession();
                if (
                    remote &&
                    (session.status === "anonymous" || session.status === "signedOut") &&
                    session.user == null
                ) {
                    await setSession(
                        {
                            ...remote,
                            epoch: remote.epoch ?? session.epoch ?? 0,
                        },
                        false,
                        undefined,
                        "adopt",
                    );
                }
            }
        } finally {
            ready = true;
            resolveReady(session);
            emit("ready", session);
        }
    })();

    const controller: AuthController = {
        providerId: options.provider.id,
        ready: readyPromise,
        getSession: () => session,
        getEpoch: () => session.epoch ?? 0,
        getUser: () => session.user,
        getAccessToken: () => session.tokens?.accessToken ?? null,
        getRefreshToken: () => session.tokens?.refreshToken ?? null,
        isAuthenticated: () => isAuthenticatedStatus(session.status),
        isReady: () => ready,
        whenReady: () => readyPromise,
        subscribe: (listener) => {
            listeners.add(listener);
            listener(session);
            return () => {
                listeners.delete(listener);
            };
        },
        on: (event, listener) => {
            let set = eventListeners.get(event);
            if (!set) {
                set = new Set();
                eventListeners.set(event, set);
            }
            set.add(listener as (payload: never) => void);
            return () => {
                set?.delete(listener as (payload: never) => void);
            };
        },
        supports: (capability) => hasCapability(options.provider.capabilities, capability),
        signIn: async (credentials) => {
            assertActive();
            assertCapability("signIn");
            const result = await options.provider.signIn!(credentials);
            const next = createSession({
                status: "authenticated",
                user: result.session.user,
                tokens: result.session.tokens,
            });
            await setSession(next, true, "signedIn");
            return next;
        },
        signOut: async () => {
            assertActive();
            assertCapability("signOut");
            await options.provider.signOut?.(session);
            const next = createSignedOutSession();
            await setSession(next, true, "signedOut");
            crossTab?.post({ type: "logout", sourceId });
            return next;
        },
        register: async (credentials) => {
            assertActive();
            assertCapability("register");
            const result = await options.provider.register!(credentials);
            const next = createSession({
                status: "authenticated",
                user: result.session.user,
                tokens: result.session.tokens,
            });
            await setSession(next, true, "signedIn");
            return next;
        },
        refresh: async () => {
            assertActive();
            return refresh!.refresh();
        },
        ensureFreshSession: async () => {
            assertActive();
            if (isSessionExpired(session, now(), options.skewMs ?? 30_000)) {
                return refresh!.refresh("ensureFresh");
            }
            return session;
        },
        handleUnauthorized: async () => {
            assertActive();
            if (!controller.supports("refresh")) {
                const next = createSession({ status: "invalid" });
                await setSession(next);
                return next;
            }
            try {
                return await refresh!.refresh("unauthorized");
            } catch (error) {
                const next = createSession({ status: "invalid" });
                await setSession(next);
                emit("error", { error, session: next });
                return next;
            }
        },
        hydrate: async (next) => {
            assertActive();
            await setSession(
                {
                    ...next,
                    epoch: next.epoch ?? session.epoch ?? 0,
                },
                false,
                undefined,
                "adopt",
            );
        },
        requestStepUp: async (input) => {
            assertActive();
            const reason = input?.reason ?? "mfa";
            if (reason === "mfa") {
                assertCapability("mfa");
            }
            const status = reason === "mfa" ? "mfaRequired" : "reauthenticationRequired";
            const next = createSession({
                status,
                user: session.user,
                tokens: session.tokens,
                epoch: session.epoch,
            });
            await setSession(next, true, undefined, "adopt");
            if (reason === "mfa") {
                const challenge = await options.provider.startMfa!(session);
                return { session: controller.getSession(), challenge };
            }
            return { session: controller.getSession() };
        },
        completeStepUp: async (input) => {
            assertActive();
            if (input?.challengeId !== undefined && input.code !== undefined) {
                return controller.verifyMfa(input.challengeId, input.code);
            }
            throw createAuthError(
                "AUTH_UNSUPPORTED",
                "Step-up completion requires a provider round-trip (verifyMfa with challengeId and code, or signIn for reauthentication)",
            );
        },
        requestPasswordReset: async (email) => {
            assertActive();
            assertCapability("passwordReset");
            await options.provider.requestPasswordReset?.(email);
        },
        verifyEmail: async (token) => {
            assertActive();
            assertCapability("emailVerification");
            await options.provider.verifyEmail?.(token);
        },
        startOAuth: async (oauthOptions) => {
            assertActive();
            assertCapability("oauth");
            return options.provider.startOAuth!(oauthOptions);
        },
        completeOAuth: async (oauthOptions) => {
            assertActive();
            assertCapability("oauth");
            const result = await options.provider.completeOAuth!(oauthOptions);
            const next = createSession({
                status: "authenticated",
                user: result.session.user,
                tokens: result.session.tokens,
            });
            await setSession(next, true, "signedIn");
            return next;
        },
        startMfa: async () => {
            assertActive();
            assertCapability("mfa");
            return options.provider.startMfa!(session);
        },
        verifyMfa: async (challengeId, code) => {
            assertActive();
            assertCapability("mfa");
            const result = await options.provider.verifyMfa!(challengeId, code);
            const next = createSession({
                status: "authenticated",
                user: result.session.user,
                tokens: result.session.tokens,
            });
            await setSession(next, true, "signedIn");
            return next;
        },
        revokeSession: async () => {
            assertActive();
            assertCapability("revokeSession");
            await options.provider.revokeSession?.(session);
            const next = createSignedOutSession();
            await setSession(next, true, "signedOut");
            crossTab?.post({ type: "logout", sourceId });
            return next;
        },
        revokeAllSessions: async () => {
            assertActive();
            assertCapability("revokeSession");
            await options.provider.revokeAllSessions?.(session);
            const next = createSignedOutSession();
            await setSession(next, true, "signedOut");
            crossTab?.post({ type: "logout", sourceId });
            return next;
        },
        can: (policy) => can(session, policy),
        cannot: (policy) => cannot(session, policy),
        authorize: (policy) => authorize(session, policy),
        assertAuthorized: (policy) => {
            assertAuthorized(session, policy);
        },
        dispose: () => {
            if (disposed) {
                return;
            }
            disposed = true;
            if (refreshTimer) {
                clearInterval(refreshTimer);
            }
            environment?.document?.removeEventListener?.("visibilitychange", onVisible);
            environment?.removeEventListener?.("online", onOnline);
            refresh?.dispose();
            unsubTab?.();
            crossTab?.dispose();
            listeners.clear();
            eventListeners.clear();
        },
    };

    return controller;
}
