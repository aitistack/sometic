import {
    createAuthError,
    createSession,
    type AuthCapability,
    type AuthProvider,
    type AuthSession,
    type AuthTokens,
    type AuthUser,
    type OAuthCallbackOptions,
    type OAuthStartOptions,
    type OAuthStartResult,
} from "@sometic/auth";

export type OidcEndpointConfig = {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    userInfoEndpoint?: string;
    endSessionEndpoint?: string;
};

export type OidcPkceStore = {
    get: (key: string) => string | null | Promise<string | null>;
    set: (key: string, value: string) => void | Promise<void>;
    remove: (key: string) => void | Promise<void>;
};

export type OidcAuthProviderOptions = {
    clientId: string;
    redirectUri: string;
    issuer?: string;
    endpoints?: Partial<OidcEndpointConfig>;
    scopes?: readonly string[];
    fetcher?: typeof fetch;
    store?: OidcPkceStore;
    validateRedirectUri?: (uri: string) => boolean;
};

function createMemoryStore(): OidcPkceStore {
    const map = new Map<string, string>();
    return {
        get: (key) => map.get(key) ?? null,
        set: (key, value) => {
            map.set(key, value);
        },
        remove: (key) => {
            map.delete(key);
        },
    };
}

function base64Url(bytes: ArrayBuffer | Uint8Array): string {
    const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let binary = "";
    for (const byte of view) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(size = 32): string {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return base64Url(bytes);
}

async function sha256Challenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return base64Url(digest);
}

async function resolveEndpoints(
    options: OidcAuthProviderOptions,
    fetcher: typeof fetch,
): Promise<OidcEndpointConfig> {
    if (options.endpoints?.authorizationEndpoint && options.endpoints.tokenEndpoint) {
        return {
            authorizationEndpoint: options.endpoints.authorizationEndpoint,
            tokenEndpoint: options.endpoints.tokenEndpoint,
            ...(options.endpoints.userInfoEndpoint
                ? { userInfoEndpoint: options.endpoints.userInfoEndpoint }
                : {}),
            ...(options.endpoints.endSessionEndpoint
                ? { endSessionEndpoint: options.endpoints.endSessionEndpoint }
                : {}),
        };
    }
    if (!options.issuer) {
        throw createAuthError("AUTH_INVALID_SESSION", "OIDC requires issuer or explicit endpoints");
    }
    const discoveryUrl = `${options.issuer.replace(/\/+$/, "")}/.well-known/openid-configuration`;
    const response = await fetcher(discoveryUrl);
    if (!response.ok) {
        throw createAuthError("AUTH_INVALID_SESSION", "OIDC discovery failed");
    }
    const json = (await response.json()) as Record<string, string | undefined>;
    if (!json.authorization_endpoint || !json.token_endpoint) {
        throw createAuthError("AUTH_INVALID_SESSION", "OIDC discovery missing endpoints");
    }
    return {
        authorizationEndpoint: json.authorization_endpoint,
        tokenEndpoint: json.token_endpoint,
        ...(json.userinfo_endpoint ? { userInfoEndpoint: json.userinfo_endpoint } : {}),
        ...(json.end_session_endpoint ? { endSessionEndpoint: json.end_session_endpoint } : {}),
    };
}

function mapTokenResponse(payload: Record<string, unknown>, user?: AuthUser): AuthSession {
    const accessToken = String(payload.access_token ?? "");
    if (!accessToken) {
        throw createAuthError("AUTH_INVALID_SESSION", "OIDC token response missing access_token");
    }
    const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : undefined;
    const tokens: AuthTokens = {
        accessToken,
        tokenType: typeof payload.token_type === "string" ? payload.token_type : "Bearer",
        ...(typeof payload.refresh_token === "string"
            ? { refreshToken: payload.refresh_token }
            : {}),
        ...(typeof payload.id_token === "string" ? { idToken: payload.id_token } : {}),
        ...(expiresIn === undefined ? {} : { expiresAt: Date.now() + expiresIn * 1000 }),
    };
    return createSession({
        status: "authenticated",
        user: user ?? { id: "oidc-user" },
        tokens,
    });
}

export function createOidcAuthProvider(options: OidcAuthProviderOptions): AuthProvider {
    const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
    const store = options.store ?? createMemoryStore();
    const scopes = options.scopes ?? ["openid", "profile", "email"];
    const validateRedirect =
        options.validateRedirectUri ??
        ((uri: string) => {
            try {
                const expected = new URL(options.redirectUri);
                const actual = new URL(uri);
                return expected.origin === actual.origin && expected.pathname === actual.pathname;
            } catch {
                return false;
            }
        });
    const capabilities = new Set<AuthCapability>([
        "oauth",
        "signOut",
        "getSession",
        "refresh",
        "getUser",
    ]);
    let cached: AuthSession | null = null;

    const tokenRequest = async (body: URLSearchParams): Promise<Record<string, unknown>> => {
        const endpoints = await resolveEndpoints(options, fetcher);
        const response = await fetcher(endpoints.tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body,
        });
        if (!response.ok) {
            throw createAuthError("AUTH_REFRESH_FAILED", "OIDC token endpoint failed");
        }
        return (await response.json()) as Record<string, unknown>;
    };

    return {
        id: "oidc",
        capabilities,
        startOAuth: async (oauth: OAuthStartOptions): Promise<OAuthStartResult> => {
            if (!validateRedirect(oauth.redirectUri)) {
                throw createAuthError("AUTH_UNAUTHORIZED", "OIDC redirectUri is not allowed");
            }
            const endpoints = await resolveEndpoints(options, fetcher);
            const state = oauth.state ?? randomString(16);
            const verifier = randomString(32);
            const challenge = await sha256Challenge(verifier);
            await store.set(`oidc:state:${state}`, state);
            await store.set(`oidc:verifier:${state}`, verifier);
            const url = new URL(endpoints.authorizationEndpoint);
            url.searchParams.set("client_id", options.clientId);
            url.searchParams.set("redirect_uri", oauth.redirectUri);
            url.searchParams.set("response_type", "code");
            url.searchParams.set("scope", (oauth.scopes ?? scopes).join(" "));
            url.searchParams.set("state", state);
            url.searchParams.set("code_challenge", challenge);
            url.searchParams.set("code_challenge_method", "S256");
            return { authorizationUrl: url.toString(), state };
        },
        completeOAuth: async (oauth: OAuthCallbackOptions) => {
            if (!validateRedirect(oauth.redirectUri)) {
                throw createAuthError("AUTH_UNAUTHORIZED", "OIDC redirectUri is not allowed");
            }
            const state = oauth.state ?? "";
            const expected = await store.get(`oidc:state:${state}`);
            const verifier = oauth.codeVerifier ?? (await store.get(`oidc:verifier:${state}`));
            await store.remove(`oidc:state:${state}`);
            await store.remove(`oidc:verifier:${state}`);
            if (!expected || expected !== state) {
                throw createAuthError("AUTH_UNAUTHORIZED", "OIDC state mismatch");
            }
            if (!verifier) {
                throw createAuthError("AUTH_UNAUTHORIZED", "OIDC code_verifier missing");
            }
            const payload = await tokenRequest(
                new URLSearchParams({
                    grant_type: "authorization_code",
                    client_id: options.clientId,
                    code: oauth.code,
                    redirect_uri: oauth.redirectUri,
                    code_verifier: verifier,
                }),
            );
            let user: AuthUser = { id: "oidc-user" };
            const endpoints = await resolveEndpoints(options, fetcher);
            if (endpoints.userInfoEndpoint && typeof payload.access_token === "string") {
                const profile = await fetcher(endpoints.userInfoEndpoint, {
                    headers: { Authorization: `Bearer ${payload.access_token}` },
                });
                if (profile.ok) {
                    const json = (await profile.json()) as Record<string, unknown>;
                    user = {
                        id: String(json.sub ?? "oidc-user"),
                        ...(typeof json.email === "string" ? { email: json.email } : {}),
                        ...(typeof json.name === "string" ? { displayName: json.name } : {}),
                    };
                }
            }
            const session = mapTokenResponse(payload, user);
            cached = session;
            return { session };
        },
        signOut: async () => {
            cached = null;
        },
        getSession: async () => cached,
        refresh: async (session) => {
            const refreshToken = session.tokens?.refreshToken;
            if (!refreshToken) {
                throw createAuthError("AUTH_REFRESH_FAILED", "OIDC refresh token missing");
            }
            const payload = await tokenRequest(
                new URLSearchParams({
                    grant_type: "refresh_token",
                    client_id: options.clientId,
                    refresh_token: refreshToken,
                }),
            );
            const next = mapTokenResponse(payload, session.user ?? { id: "oidc-user" });
            cached = next;
            return { session: next };
        },
        getUser: async (session) => session.user,
    };
}

export { createMemoryStore as createOidcMemoryStore };
