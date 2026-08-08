import { describe, expect, it, vi } from "vitest";
import { createFirebaseAuthProvider, type FirebaseAuthLike } from "./index.js";

function createMockAuth(): FirebaseAuthLike {
    const user = {
        uid: "fb-1",
        email: "demo@example.com",
        displayName: "Demo",
        getIdToken: vi.fn(async () => "firebase-token"),
    };
    return {
        currentUser: user,
        signInWithEmailAndPassword: vi.fn(async () => ({ user })),
        createUserWithEmailAndPassword: vi.fn(async () => ({ user })),
        signOut: vi.fn(async () => undefined),
        sendPasswordResetEmail: vi.fn(async () => undefined),
        sendEmailVerification: vi.fn(async () => undefined),
    };
}

describe("auth-firebase", () => {
    it("maps firebase user sessions", async () => {
        const auth = createMockAuth();
        const provider = createFirebaseAuthProvider({ auth });
        const result = await provider.signIn!({
            email: "demo@example.com",
            password: "password",
        });
        expect(result.session.user?.id).toBe("fb-1");
        expect(result.session.tokens?.accessToken).toBe("firebase-token");
        expect(provider.capabilities.has("refresh")).toBe(true);
    });

    it("maps sign-in failures", async () => {
        const auth = createMockAuth();
        auth.signInWithEmailAndPassword = vi.fn(async () => {
            throw new Error("bad");
        });
        const provider = createFirebaseAuthProvider({ auth });
        await expect(provider.signIn!({ email: "x", password: "y" })).rejects.toMatchObject({
            code: "AUTH_CREDENTIALS_INVALID",
        });
    });
});
