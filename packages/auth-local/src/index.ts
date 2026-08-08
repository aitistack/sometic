import {
    createAuthError,
    createSession,
    type AuthCapability,
    type AuthProvider,
    type AuthProviderResult,
    type AuthSession,
    type AuthTokens,
    type AuthUser,
    type RegisterCredentials,
    type SignInCredentials,
} from "@sometic/auth";

export type LocalAuthEndpoints = {
    signIn?: string;
    register?: string;
    refresh?: string;
    signOut?: string;
    session?: string;
    passwordReset?: string;
};

export type LocalAuthProviderOptions = {
    baseUrl: string;
    endpoints?: LocalAuthEndpoints;
    fetcher?: typeof fetch;
    mapUser?: (payload: unknown) => AuthUser;
    mapTokens?: (payload: unknown) => AuthTokens | null;
    mapSession?: (payload: unknown) => AuthSession;
};

const DEFAULT_ENDPOINTS: Required<LocalAuthEndpoints> = {
    signIn: "/auth/sign-in",
    register: "/auth/register",
    refresh: "/auth/refresh",
    signOut: "/auth/sign-out",
    session: "/auth/session",
    passwordReset: "/auth/password-reset",
};

function joinUrl(baseUrl: string, path: string): string {
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(path)) {
        return path;
    }
    return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function defaultMapUser(payload: unknown): AuthUser {
    const data = (payload ?? {}) as Record<string, unknown>;
    const user = (data.user ?? data) as Record<string, unknown>;
    const id = String(user.id ?? user.sub ?? "");
    if (!id) {
        throw createAuthError("AUTH_INVALID_SESSION", "Local auth response missing user id");
    }
    return {
        id,
        ...(typeof user.email === "string" ? { email: user.email } : {}),
        ...(typeof user.displayName === "string"
            ? { displayName: user.displayName }
            : typeof user.name === "string"
              ? { displayName: user.name }
              : {}),
        ...(Array.isArray(user.roles) ? { roles: user.roles.map(String) } : {}),
        ...(Array.isArray(user.permissions) ? { permissions: user.permissions.map(String) } : {}),
    };
}

function defaultMapTokens(payload: unknown): AuthTokens | null {
    const data = (payload ?? {}) as Record<string, unknown>;
    const tokens = (data.tokens ?? data) as Record<string, unknown>;
    const accessToken =
        typeof tokens.accessToken === "string"
            ? tokens.accessToken
            : typeof tokens.access_token === "string"
              ? tokens.access_token
              : undefined;
    if (!accessToken) {
        return null;
    }
    const expiresIn =
        typeof tokens.expiresIn === "number"
            ? tokens.expiresIn
            : typeof tokens.expires_in === "number"
              ? tokens.expires_in
              : undefined;
    return {
        accessToken,
        ...(typeof tokens.refreshToken === "string"
            ? { refreshToken: tokens.refreshToken }
            : typeof tokens.refresh_token === "string"
              ? { refreshToken: tokens.refresh_token }
              : {}),
        ...(typeof tokens.tokenType === "string"
            ? { tokenType: tokens.tokenType }
            : typeof tokens.token_type === "string"
              ? { tokenType: tokens.token_type }
              : { tokenType: "Bearer" }),
        ...(expiresIn === undefined ? {} : { expiresAt: Date.now() + expiresIn * 1000 }),
        ...(typeof tokens.expiresAt === "number" ? { expiresAt: tokens.expiresAt } : {}),
    };
}

async function readJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text) as unknown;
    } catch {
        throw createAuthError("AUTH_INVALID_SESSION", "Local auth returned non-JSON body");
    }
}

export function createLocalAuthProvider(options: LocalAuthProviderOptions): AuthProvider {
    const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
    const endpoints = { ...DEFAULT_ENDPOINTS, ...options.endpoints };
    const mapUser = options.mapUser ?? defaultMapUser;
    const mapTokens = options.mapTokens ?? defaultMapTokens;
    const capabilities = new Set<AuthCapability>([
        "signIn",
        "signOut",
        "register",
        "getSession",
        "refresh",
        "getUser",
        "passwordReset",
    ]);

    const toResult = (payload: unknown): AuthProviderResult => {
        if (options.mapSession) {
            return { session: options.mapSession(payload) };
        }
        const user = mapUser(payload);
        const tokens = mapTokens(payload);
        return {
            session: createSession({
                status: "authenticated",
                user,
                tokens,
            }),
        };
    };

    const request = async (
        path: string,
        init?: RequestInit & { allowUnauthorized?: boolean },
    ): Promise<unknown> => {
        const response = await fetcher(joinUrl(options.baseUrl, path), {
            ...init,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...(init?.headers ?? {}),
            },
        });
        if (response.status === 401 || response.status === 403) {
            throw createAuthError("AUTH_CREDENTIALS_INVALID", "Local auth rejected credentials");
        }
        if (!response.ok) {
            throw createAuthError("AUTH_INVALID_SESSION", `Local auth failed (${response.status})`);
        }
        return readJson(response);
    };

    return {
        id: "local",
        capabilities,
        signIn: async (credentials: SignInCredentials) =>
            toResult(
                await request(endpoints.signIn, {
                    method: "POST",
                    body: JSON.stringify(credentials),
                }),
            ),
        register: async (credentials: RegisterCredentials) =>
            toResult(
                await request(endpoints.register, {
                    method: "POST",
                    body: JSON.stringify(credentials),
                }),
            ),
        signOut: async (session) => {
            const token = session.tokens?.accessToken;
            await request(endpoints.signOut, {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: JSON.stringify({}),
            });
        },
        getSession: async () => {
            try {
                const payload = await request(endpoints.session, { method: "GET" });
                return toResult(payload).session;
            } catch {
                return null;
            }
        },
        refresh: async (session) => {
            const refreshToken = session.tokens?.refreshToken;
            if (!refreshToken) {
                throw createAuthError("AUTH_REFRESH_FAILED", "Missing refresh token");
            }
            return toResult(
                await request(endpoints.refresh, {
                    method: "POST",
                    body: JSON.stringify({ refreshToken }),
                }),
            );
        },
        getUser: async (session) => session.user,
        requestPasswordReset: async (email) => {
            await request(endpoints.passwordReset, {
                method: "POST",
                body: JSON.stringify({ email }),
            });
        },
    };
}
