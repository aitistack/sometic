import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createOidcAuthProvider,
    createOidcMemoryStore,
    createOidcSessionStorageStore,
} from "./index.js";

describe("auth-oidc", () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it("starts PKCE authorize URL and completes token exchange", async () => {
        const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = String(input);
            if (url.includes("/token") && init?.method === "POST") {
                return new Response(
                    JSON.stringify({
                        access_token: "at",
                        refresh_token: "rt",
                        expires_in: 3600,
                        token_type: "Bearer",
                    }),
                    { status: 200, headers: { "Content-Type": "application/json" } },
                );
            }
            if (url.includes("/userinfo")) {
                return new Response(
                    JSON.stringify({ sub: "oidc-1", email: "a@b.co", name: "Ada" }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
            return new Response("{}", { status: 404 });
        }) as unknown as typeof fetch;

        const provider = createOidcAuthProvider({
            clientId: "spa",
            redirectUri: "https://app.test/callback",
            endpoints: {
                authorizationEndpoint: "https://issuer.test/authorize",
                tokenEndpoint: "https://issuer.test/token",
                userInfoEndpoint: "https://issuer.test/userinfo",
            },
            fetcher,
        });

        const start = await provider.startOAuth!({
            provider: "oidc",
            redirectUri: "https://app.test/callback",
        });
        expect(start.authorizationUrl).toContain("code_challenge=");
        expect(start.authorizationUrl).toContain("code_challenge_method=S256");

        const completed = await provider.completeOAuth!({
            provider: "oidc",
            redirectUri: "https://app.test/callback",
            code: "auth-code",
            state: start.state,
        });
        expect(completed.session.tokens?.accessToken).toBe("at");
        expect(completed.session.user?.id).toBe("oidc-1");
    });

    it("rejects state mismatch", async () => {
        const provider = createOidcAuthProvider({
            clientId: "spa",
            redirectUri: "https://app.test/callback",
            endpoints: {
                authorizationEndpoint: "https://issuer.test/authorize",
                tokenEndpoint: "https://issuer.test/token",
            },
            fetcher: vi.fn() as unknown as typeof fetch,
        });
        await provider.startOAuth!({
            provider: "oidc",
            redirectUri: "https://app.test/callback",
            state: "good",
        });
        await expect(
            provider.completeOAuth!({
                provider: "oidc",
                redirectUri: "https://app.test/callback",
                code: "x",
                state: "bad",
            }),
        ).rejects.toMatchObject({ code: "AUTH_UNAUTHORIZED" });
    });

    it("rejects redirectUri query-string mismatch", async () => {
        const provider = createOidcAuthProvider({
            clientId: "spa",
            redirectUri: "https://app.test/callback",
            endpoints: {
                authorizationEndpoint: "https://issuer.test/authorize",
                tokenEndpoint: "https://issuer.test/token",
            },
            store: createOidcMemoryStore(),
            fetcher: vi.fn() as unknown as typeof fetch,
        });
        await expect(
            provider.startOAuth!({
                provider: "oidc",
                redirectUri: "https://app.test/callback?next=https://evil.test",
            }),
        ).rejects.toMatchObject({ code: "AUTH_UNAUTHORIZED" });
    });

    it("rejects plain PKCE", async () => {
        const provider = createOidcAuthProvider({
            clientId: "spa",
            redirectUri: "https://app.test/callback",
            endpoints: {
                authorizationEndpoint: "https://issuer.test/authorize",
                tokenEndpoint: "https://issuer.test/token",
            },
            store: createOidcMemoryStore(),
            fetcher: vi.fn() as unknown as typeof fetch,
        });
        await expect(
            provider.startOAuth!({
                provider: "oidc",
                redirectUri: "https://app.test/callback",
                codeChallengeMethod: "plain",
            }),
        ).rejects.toMatchObject({ code: "AUTH_UNAUTHORIZED" });
    });

    it("persists PKCE verifier in sessionStorage across provider instances", async () => {
        const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = String(input);
            if (url.includes("/token") && init?.method === "POST") {
                return new Response(
                    JSON.stringify({
                        access_token: "at",
                        token_type: "Bearer",
                    }),
                    { status: 200, headers: { "Content-Type": "application/json" } },
                );
            }
            return new Response("{}", { status: 404 });
        }) as unknown as typeof fetch;
        const endpoints = {
            authorizationEndpoint: "https://issuer.test/authorize",
            tokenEndpoint: "https://issuer.test/token",
        };
        const starter = createOidcAuthProvider({
            clientId: "spa",
            redirectUri: "https://app.test/callback",
            endpoints,
            fetcher,
        });
        const start = await starter.startOAuth!({
            provider: "oidc",
            redirectUri: "https://app.test/callback",
        });
        expect(start.authorizationUrl).toContain("code_challenge_method=S256");
        expect(createOidcSessionStorageStore()).not.toBeNull();
        const completer = createOidcAuthProvider({
            clientId: "spa",
            redirectUri: "https://app.test/callback",
            endpoints,
            fetcher,
        });
        const completed = await completer.completeOAuth!({
            provider: "oidc",
            redirectUri: "https://app.test/callback",
            code: "auth-code",
            state: start.state,
        });
        expect(completed.session.tokens?.accessToken).toBe("at");
    });
});
