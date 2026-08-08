import { describe, expect, it, vi } from "vitest";
import { createAuth, createMemoryAuthStorage, createNoopAuthBus } from "@sometic/auth";
import { createLocalAuthProvider } from "./index.js";

describe("auth-local", () => {
    it("signs in through configurable REST endpoints", async () => {
        const fetcher = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            expect(url).toContain("https://api.test/auth/sign-in");
            return new Response(
                JSON.stringify({
                    user: { id: "u1", email: "a@b.co", roles: ["user"] },
                    tokens: {
                        access_token: "access",
                        refresh_token: "refresh",
                        expires_in: 3600,
                    },
                }),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        }) as unknown as typeof fetch;

        const provider = createLocalAuthProvider({
            baseUrl: "https://api.test",
            fetcher,
        });
        expect(provider.capabilities.has("signIn")).toBe(true);
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        const session = await auth.signIn({ email: "a@b.co", password: "x" });
        expect(session.user?.id).toBe("u1");
        expect(session.tokens?.accessToken).toBe("access");
        auth.dispose();
    });

    it("maps credential failures", async () => {
        const fetcher = vi.fn(
            async () => new Response(null, { status: 401 }),
        ) as unknown as typeof fetch;
        const provider = createLocalAuthProvider({
            baseUrl: "https://api.test",
            fetcher,
        });
        await expect(provider.signIn!({ email: "a@b.co", password: "bad" })).rejects.toMatchObject({
            code: "AUTH_CREDENTIALS_INVALID",
        });
    });
});
