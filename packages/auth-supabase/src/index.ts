import {
    createAuthError,
    createSession,
    type AuthCapability,
    type AuthProvider,
    type AuthProviderResult,
    type AuthTokens,
    type AuthUser,
    type OAuthStartOptions,
    type OAuthStartResult,
} from "@sometic/auth";

export type SupabaseUserLike = {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
};

export type SupabaseSessionLike = {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
    expires_in?: number;
    token_type?: string;
    user: SupabaseUserLike;
};

export type SupabaseAuthLike = {
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<{
        data: { session: SupabaseSessionLike | null };
        error: { message: string } | null;
    }>;
    signUp: (credentials: {
        email: string;
        password: string;
        options?: { data?: Record<string, unknown> };
    }) => Promise<{
        data: { session: SupabaseSessionLike | null };
        error: { message: string } | null;
    }>;
    signOut: () => Promise<{ error: { message: string } | null }>;
    getSession: () => Promise<{
        data: { session: SupabaseSessionLike | null };
        error: { message: string } | null;
    }>;
    refreshSession: () => Promise<{
        data: { session: SupabaseSessionLike | null };
        error: { message: string } | null;
    }>;
    resetPasswordForEmail: (
        email: string,
    ) => Promise<{ data: unknown; error: { message: string } | null }>;
    signInWithOAuth?: (options: {
        provider: string;
        options?: { redirectTo?: string; scopes?: string };
    }) => Promise<{ data: { url: string | null }; error: { message: string } | null }>;
};

export type SupabaseAuthProviderOptions = {
    auth: SupabaseAuthLike;
    mapUser?: (user: SupabaseUserLike) => AuthUser;
};

function defaultMapUser(user: SupabaseUserLike): AuthUser {
    const displayName = user.user_metadata?.displayName ?? user.user_metadata?.full_name;
    return {
        id: user.id,
        ...(user.email ? { email: user.email } : {}),
        ...(typeof displayName === "string" ? { displayName } : {}),
    };
}

function mapSession(
    session: SupabaseSessionLike,
    mapUser: (user: SupabaseUserLike) => AuthUser,
): AuthProviderResult {
    const tokens: AuthTokens = {
        accessToken: session.access_token,
        tokenType: session.token_type ?? "Bearer",
        ...(session.refresh_token ? { refreshToken: session.refresh_token } : {}),
        ...(session.expires_at
            ? { expiresAt: session.expires_at * (session.expires_at < 1e12 ? 1000 : 1) }
            : session.expires_in
              ? { expiresAt: Date.now() + session.expires_in * 1000 }
              : {}),
    };
    return {
        session: createSession({
            status: "authenticated",
            user: mapUser(session.user),
            tokens,
        }),
    };
}

export function createSupabaseAuthProvider(options: SupabaseAuthProviderOptions): AuthProvider {
    const mapUser = options.mapUser ?? defaultMapUser;
    const capabilities = new Set<AuthCapability>([
        "signIn",
        "signOut",
        "register",
        "getSession",
        "refresh",
        "getUser",
        "passwordReset",
    ]);
    if (options.auth.signInWithOAuth) {
        capabilities.add("oauth");
    }

    return {
        id: "supabase",
        capabilities,
        signIn: async (credentials) => {
            const { data, error } = await options.auth.signInWithPassword(credentials);
            if (error || !data.session) {
                throw createAuthError("AUTH_CREDENTIALS_INVALID", "Supabase sign-in failed");
            }
            return mapSession(data.session, mapUser);
        },
        register: async (credentials) => {
            const { data, error } = await options.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                ...(credentials.displayName
                    ? { options: { data: { displayName: credentials.displayName } } }
                    : {}),
            });
            if (error || !data.session) {
                throw createAuthError("AUTH_CREDENTIALS_INVALID", "Supabase register failed");
            }
            return mapSession(data.session, mapUser);
        },
        signOut: async () => {
            const { error } = await options.auth.signOut();
            if (error) {
                throw createAuthError("AUTH_INVALID_SESSION", "Supabase sign-out failed");
            }
        },
        getSession: async () => {
            const { data, error } = await options.auth.getSession();
            if (error || !data.session) {
                return null;
            }
            return mapSession(data.session, mapUser).session;
        },
        refresh: async () => {
            const { data, error } = await options.auth.refreshSession();
            if (error || !data.session) {
                throw createAuthError("AUTH_REFRESH_FAILED", "Supabase refresh failed");
            }
            return mapSession(data.session, mapUser);
        },
        getUser: async (session) => session.user,
        requestPasswordReset: async (email) => {
            const { error } = await options.auth.resetPasswordForEmail(email);
            if (error) {
                throw createAuthError("AUTH_INVALID_SESSION", "Supabase password reset failed");
            }
        },
        startOAuth: async (oauth: OAuthStartOptions): Promise<OAuthStartResult> => {
            if (!options.auth.signInWithOAuth) {
                throw createAuthError("AUTH_UNSUPPORTED", "Supabase OAuth unavailable");
            }
            const { data, error } = await options.auth.signInWithOAuth({
                provider: oauth.provider,
                options: {
                    redirectTo: oauth.redirectUri,
                    ...(oauth.scopes ? { scopes: oauth.scopes.join(" ") } : {}),
                },
            });
            if (error || !data.url) {
                throw createAuthError("AUTH_INVALID_SESSION", "Supabase OAuth start failed");
            }
            return {
                authorizationUrl: data.url,
                state: oauth.state ?? "",
            };
        },
    };
}
