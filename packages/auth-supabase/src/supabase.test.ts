import { describe, expect, it, vi } from "vitest";
import {
    createSupabaseAuthProvider,
    type SupabaseAuthLike,
    type SupabaseSessionLike,
} from "./index.js";

const session: SupabaseSessionLike = {
    access_token: "sb-access",
    refresh_token: "sb-refresh",
    expires_in: 3600,
    token_type: "bearer",
    user: { id: "sb-1", email: "demo@example.com" },
};

function createMockAuth(): SupabaseAuthLike {
    return {
        signInWithPassword: vi.fn(async () => ({ data: { session }, error: null })),
        signUp: vi.fn(async () => ({ data: { session }, error: null })),
        signOut: vi.fn(async () => ({ error: null })),
        getSession: vi.fn(async () => ({ data: { session }, error: null })),
        refreshSession: vi.fn(async () => ({ data: { session }, error: null })),
        resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
        signInWithOAuth: vi.fn(async () => ({
            data: { url: "https://example.com/oauth" },
            error: null,
        })),
    };
}

describe("auth-supabase", () => {
    it("maps supabase sessions", async () => {
        const auth = createMockAuth();
        const provider = createSupabaseAuthProvider({ auth });
        const result = await provider.signIn!({
            email: "demo@example.com",
            password: "password",
        });
        expect(result.session.tokens?.accessToken).toBe("sb-access");
        expect(provider.capabilities.has("oauth")).toBe(true);
    });

    it("maps auth errors", async () => {
        const auth = createMockAuth();
        auth.signInWithPassword = vi.fn(async () => ({
            data: { session: null },
            error: { message: "Invalid login" },
        }));
        const provider = createSupabaseAuthProvider({ auth });
        await expect(provider.signIn!({ email: "x", password: "y" })).rejects.toMatchObject({
            code: "AUTH_CREDENTIALS_INVALID",
        });
    });
});
