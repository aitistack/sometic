import type { AuthCapability } from "../capabilities.js";
import { createAuthError } from "../errors.js";
import type {
    AuthProvider,
    AuthProviderResult,
    AuthSession,
    AuthUser,
    RegisterCredentials,
    SignInCredentials,
} from "../provider.js";
import { createSession } from "../session/index.js";

export type TestProviderOptions = {
    users?: Array<{
        email: string;
        password: string;
        user: AuthUser;
    }>;
    failRefreshTimes?: number;
    accessTokenTtlMs?: number;
};

export type TestAuthProvider = AuthProvider & {
    capabilities: Set<AuthCapability>;
    forceExpire: () => void;
    getRefreshCount: () => number;
};

export function createTestAuthProvider(options: TestProviderOptions = {}): TestAuthProvider {
    const users = new Map(
        (
            options.users ?? [
                {
                    email: "demo@example.com",
                    password: "password",
                    user: {
                        id: "user-1",
                        email: "demo@example.com",
                        displayName: "Demo User",
                        roles: ["user"],
                        permissions: ["read:profile"],
                    },
                },
            ]
        ).map((entry) => [entry.email, entry] as const),
    );
    let current: AuthSession | null = null;
    let refreshCount = 0;
    let failRefreshRemaining = options.failRefreshTimes ?? 0;
    const ttl = options.accessTokenTtlMs ?? 60_000;
    const capabilities = new Set<AuthCapability>([
        "signIn",
        "signOut",
        "register",
        "getSession",
        "refresh",
        "getUser",
        "passwordReset",
    ]);

    const issue = (user: AuthUser): AuthProviderResult => {
        const tokens = {
            accessToken: `access-${user.id}-${Date.now()}`,
            refreshToken: `refresh-${user.id}`,
            tokenType: "Bearer",
            expiresAt: Date.now() + ttl,
        };
        current = createSession({
            status: "authenticated",
            user,
            tokens,
        });
        return { session: current };
    };

    return {
        id: "test",
        capabilities,
        signIn: async (credentials: SignInCredentials) => {
            const entry = users.get(credentials.email);
            if (!entry || entry.password !== credentials.password) {
                throw createAuthError("AUTH_CREDENTIALS_INVALID", "Invalid email or password");
            }
            return issue(entry.user);
        },
        signOut: async () => {
            current = createSession({ status: "signedOut" });
        },
        register: async (credentials: RegisterCredentials) => {
            if (users.has(credentials.email)) {
                throw createAuthError("AUTH_CREDENTIALS_INVALID", "Account already exists");
            }
            const user: AuthUser = {
                id: `user-${users.size + 1}`,
                email: credentials.email,
                ...(credentials.displayName === undefined
                    ? {}
                    : { displayName: credentials.displayName }),
                roles: ["user"],
                permissions: ["read:profile"],
            };
            users.set(credentials.email, {
                email: credentials.email,
                password: credentials.password,
                user,
            });
            return issue(user);
        },
        getSession: async () => current,
        refresh: async (session) => {
            refreshCount += 1;
            if (failRefreshRemaining > 0) {
                failRefreshRemaining -= 1;
                throw createAuthError("AUTH_REFRESH_FAILED", "Forced refresh failure");
            }
            if (!session.user) {
                throw createAuthError("AUTH_INVALID_SESSION", "No user to refresh");
            }
            return issue(session.user);
        },
        getUser: async (session) => session.user,
        requestPasswordReset: async () => undefined,
        forceExpire: () => {
            if (!current?.tokens) {
                return;
            }
            current = createSession({
                status: "expired",
                user: current.user,
                tokens: { ...current.tokens, expiresAt: Date.now() - 1 },
            });
        },
        getRefreshCount: () => refreshCount,
    };
}
