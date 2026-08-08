import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createTestAuthProvider,
    type AuthController,
    type AuthProvider,
} from "@sometic/auth";
import { createFirebaseAuthProvider, type FirebaseAuthLike } from "@sometic/auth-firebase";
import { createLocalAuthProvider } from "@sometic/auth-local";
import { createOidcAuthProvider } from "@sometic/auth-oidc";
import {
    createSupabaseAuthProvider,
    type SupabaseAuthLike,
    type SupabaseSessionLike,
} from "@sometic/auth-supabase";

type ProviderKind = "test" | "local" | "firebase" | "supabase" | "oidc";

function createLocalMockFetcher(): typeof fetch {
    const users = new Map([
        ["demo@example.com", { password: "password", id: "local-1", email: "demo@example.com" }],
    ]);
    let refresh = "local-refresh";
    return (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, string>) : {};
        const email = body.email ?? "";
        const password = body.password ?? "";
        if (url.includes("/auth/sign-in") || url.includes("/auth/register")) {
            const existing = users.get(email);
            if (url.includes("/auth/register")) {
                users.set(email, {
                    password,
                    id: `local-${users.size + 1}`,
                    email,
                });
            } else if (!existing || existing.password !== password) {
                return new Response(null, { status: 401 });
            }
            const user = users.get(email)!;
            refresh = `local-refresh-${Date.now()}`;
            return new Response(
                JSON.stringify({
                    user: { id: user.id, email: user.email, roles: ["user"] },
                    tokens: {
                        access_token: `local-access-${user.id}`,
                        refresh_token: refresh,
                        expires_in: 3600,
                    },
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }
        if (url.includes("/auth/refresh")) {
            return new Response(
                JSON.stringify({
                    user: { id: "local-1", email: "demo@example.com" },
                    tokens: {
                        access_token: `local-access-refreshed`,
                        refresh_token: body.refreshToken,
                        expires_in: 3600,
                    },
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }
        if (url.includes("/auth/sign-out") || url.includes("/auth/password-reset")) {
            return new Response("{}", {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
        if (url.includes("/auth/session")) {
            return new Response(null, { status: 401 });
        }
        return new Response(null, { status: 404 });
    }) as typeof fetch;
}

function createFirebaseMock(): FirebaseAuthLike {
    let current: {
        uid: string;
        email: string;
        displayName: string;
        getIdToken: (force?: boolean) => Promise<string>;
    } | null = null;
    const makeUser = (email: string) => ({
        uid: "fb-demo",
        email,
        displayName: "Firebase Demo",
        getIdToken: async (force?: boolean) =>
            `firebase-token${force ? "-forced" : ""}-${Date.now()}`,
    });
    return {
        get currentUser() {
            return current;
        },
        signInWithEmailAndPassword: async (email, password) => {
            if (password !== "password") {
                throw new Error("bad");
            }
            current = makeUser(email);
            return { user: current };
        },
        createUserWithEmailAndPassword: async (email) => {
            current = makeUser(email);
            return { user: current };
        },
        signOut: async () => {
            current = null;
        },
        sendPasswordResetEmail: async () => undefined,
        sendEmailVerification: async () => undefined,
    };
}

function createSupabaseMock(): SupabaseAuthLike {
    const session = (email: string): SupabaseSessionLike => ({
        access_token: `sb-${Date.now()}`,
        refresh_token: "sb-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: { id: "sb-demo", email },
    });
    let current: SupabaseSessionLike | null = null;
    return {
        signInWithPassword: async ({ email, password }) => {
            if (password !== "password") {
                return { data: { session: null }, error: { message: "Invalid" } };
            }
            current = session(email);
            return { data: { session: current }, error: null };
        },
        signUp: async ({ email }) => {
            current = session(email);
            return { data: { session: current }, error: null };
        },
        signOut: async () => {
            current = null;
            return { error: null };
        },
        getSession: async () => ({ data: { session: current }, error: null }),
        refreshSession: async () => {
            if (!current) {
                return { data: { session: null }, error: { message: "none" } };
            }
            current = session(current.user.email ?? "demo@example.com");
            return { data: { session: current }, error: null };
        },
        resetPasswordForEmail: async () => ({ data: {}, error: null }),
        signInWithOAuth: async () => ({
            data: { url: "https://supabase.demo/oauth" },
            error: null,
        }),
    };
}

function createOidcMockFetcher(): typeof fetch {
    return (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/token") && init?.method === "POST") {
            return new Response(
                JSON.stringify({
                    access_token: `oidc-${Date.now()}`,
                    refresh_token: "oidc-refresh",
                    expires_in: 3600,
                    token_type: "Bearer",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }
        if (url.includes("/userinfo")) {
            return new Response(
                JSON.stringify({
                    sub: "oidc-demo",
                    email: "demo@example.com",
                    name: "OIDC Demo",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }
        return new Response(null, { status: 404 });
    }) as typeof fetch;
}

export function mountAuthProvidersSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-providers-status]");
    const sessionEl = root.querySelector<HTMLElement>("[data-providers-session]");
    const select = root.querySelector<HTMLSelectElement>("[data-providers-select]");
    const caps = root.querySelector<HTMLElement>("[data-providers-caps]");
    const emailInput = root.querySelector<HTMLInputElement>("[data-providers-email]");
    const passwordInput = root.querySelector<HTMLInputElement>("[data-providers-password]");
    const oauthOut = root.querySelector<HTMLElement>("[data-providers-oauth]");
    if (!status || !sessionEl || !select || !caps || !emailInput || !passwordInput || !oauthOut) {
        throw new Error("Auth providers section nodes missing");
    }

    emailInput.value = "demo@example.com";
    passwordInput.value = "password";

    let auth: AuthController | null = null;
    let unsubscribe: (() => void) | null = null;
    let oidcState: string | null = null;

    const render = (): void => {
        if (!auth) {
            return;
        }
        const session = auth.getSession();
        sessionEl.textContent = JSON.stringify(
            {
                provider: auth.providerId,
                status: session.status,
                user: session.user,
                accessToken: session.tokens?.accessToken
                    ? `${session.tokens.accessToken.slice(0, 18)}…`
                    : null,
            },
            null,
            2,
        );
        const list = [
            "signIn",
            "signOut",
            "register",
            "getSession",
            "refresh",
            "getUser",
            "passwordReset",
            "emailVerification",
            "oauth",
            "mfa",
            "revokeSession",
        ] as const;
        caps.textContent = `capabilities: ${list.filter((item) => auth!.supports(item)).join(", ")}`;
    };

    const createProvider = (kind: ProviderKind): AuthProvider => {
        if (kind === "test") {
            return createTestAuthProvider();
        }
        if (kind === "local") {
            return createLocalAuthProvider({
                baseUrl: "https://local.demo",
                fetcher: createLocalMockFetcher(),
            });
        }
        if (kind === "firebase") {
            return createFirebaseAuthProvider({ auth: createFirebaseMock() });
        }
        if (kind === "supabase") {
            return createSupabaseAuthProvider({ auth: createSupabaseMock() });
        }
        return createOidcAuthProvider({
            clientId: "playground-spa",
            redirectUri: "https://playground.local/callback",
            endpoints: {
                authorizationEndpoint: "https://oidc.demo/authorize",
                tokenEndpoint: "https://oidc.demo/token",
                userInfoEndpoint: "https://oidc.demo/userinfo",
            },
            fetcher: createOidcMockFetcher(),
        });
    };

    const recreate = (kind: ProviderKind): void => {
        unsubscribe?.();
        auth?.dispose();
        auth = createAuth({
            provider: createProvider(kind),
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        unsubscribe = auth.subscribe(() => {
            render();
        });
        oidcState = null;
        oauthOut.textContent = "";
        status.textContent = `Active provider: ${kind} (in-playground mocks — no cloud keys)`;
        render();
    };

    recreate((select.value as ProviderKind) || "test");
    select.addEventListener("change", () => {
        recreate((select.value as ProviderKind) || "test");
    });

    root.querySelector("[data-providers-signin]")?.addEventListener("click", () => {
        void auth
            ?.signIn({ email: emailInput.value, password: passwordInput.value })
            .then(() => {
                status.textContent = `Signed in via ${auth?.providerId}`;
            })
            .catch((error: Error) => {
                status.textContent = error.message;
            });
    });
    root.querySelector("[data-providers-signout]")?.addEventListener("click", () => {
        void auth?.signOut().then(() => {
            status.textContent = "Signed out";
        });
    });
    root.querySelector("[data-providers-refresh]")?.addEventListener("click", () => {
        void auth
            ?.refresh()
            .then(() => {
                status.textContent = "Refreshed";
            })
            .catch((error: Error) => {
                status.textContent = error.message;
            });
    });
    root.querySelector("[data-providers-oauth-start]")?.addEventListener("click", () => {
        void auth
            ?.startOAuth({
                provider: "oidc",
                redirectUri: "https://playground.local/callback",
            })
            .then((result) => {
                oidcState = result.state;
                oauthOut.textContent = result.authorizationUrl;
                status.textContent = "OAuth started — click Complete OAuth (mock code)";
            })
            .catch((error: Error) => {
                status.textContent = error.message;
            });
    });
    root.querySelector("[data-providers-oauth-complete]")?.addEventListener("click", () => {
        if (!oidcState) {
            status.textContent = "Start OAuth first";
            return;
        }
        void auth
            ?.completeOAuth({
                provider: "oidc",
                redirectUri: "https://playground.local/callback",
                code: "playground-code",
                state: oidcState,
            })
            .then(() => {
                status.textContent = "OAuth completed (mock token exchange)";
            })
            .catch((error: Error) => {
                status.textContent = error.message;
            });
    });

    return () => {
        unsubscribe?.();
        auth?.dispose();
    };
}
