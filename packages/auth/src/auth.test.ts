import { describe, expect, it, vi } from "vitest";
import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createPolicy,
    createTestAuthProvider,
    requireAuthenticated,
    requirePermission,
} from "./index.js";

describe("auth orchestration", () => {
    it("signs in and exposes authorization helpers", async () => {
        const provider = createTestAuthProvider();
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        const session = await auth.signIn({
            email: "demo@example.com",
            password: "password",
        });
        expect(session.status).toBe("authenticated");
        expect(auth.can(requireAuthenticated())).toBe(true);
        expect(auth.can(requirePermission("read:profile"))).toBe(true);
        expect(auth.can(createPolicy(requireAuthenticated(), requirePermission("admin")))).toBe(
            false,
        );
        await auth.signOut();
        expect(auth.getSession().status).toBe("signedOut");
        auth.dispose();
    });

    it("dedupes concurrent refresh calls", async () => {
        const provider = createTestAuthProvider({ accessTokenTtlMs: 1 });
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            skewMs: 0,
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        provider.forceExpire();
        const [a, b] = await Promise.all([auth.refresh(), auth.refresh()]);
        expect(a.status).toBe("authenticated");
        expect(b.status).toBe("authenticated");
        expect(provider.getRefreshCount()).toBe(1);
        auth.dispose();
    });

    it("handles unauthorized via refresh seam", async () => {
        const provider = createTestAuthProvider({ failRefreshTimes: 2, accessTokenTtlMs: 1 });
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        const session = await auth.handleUnauthorized();
        expect(session.status).toBe("invalid");
        auth.dispose();
    });

    it("broadcasts logout across tabs", async () => {
        const listeners = new Set<(message: unknown) => void>();
        const bus = {
            post: (message: unknown) => {
                for (const listener of listeners) {
                    listener(message);
                }
            },
            subscribe: (listener: (message: unknown) => void) => {
                listeners.add(listener);
                return () => {
                    listeners.delete(listener);
                };
            },
            dispose: () => {
                listeners.clear();
            },
        };
        const provider = createTestAuthProvider();
        const authA = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: bus as never,
            environment: false,
        });
        const authB = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: bus as never,
            environment: false,
        });
        await authA.signIn({ email: "demo@example.com", password: "password" });
        await authB.hydrate({
            status: "authenticated",
            user: { id: "user-1" },
            tokens: null,
            updatedAt: Date.now(),
            epoch: 1,
        });
        await authA.signOut();
        await vi.waitFor(() => {
            expect(authB.getSession().status).toBe("signedOut");
        });
        authA.dispose();
        authB.dispose();
    });

    it("rejects unsupported capabilities", async () => {
        const provider = createTestAuthProvider();
        provider.capabilities.delete("register");
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        await expect(
            auth.register({ email: "new@example.com", password: "password" }),
        ).rejects.toMatchObject({ code: "AUTH_UNSUPPORTED" });
        auth.dispose();
    });

    it("bumps session epoch on sign-in and sign-out but not on refresh", async () => {
        const provider = createTestAuthProvider({ accessTokenTtlMs: 1 });
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            skewMs: 0,
            environment: false,
        });
        expect(auth.getEpoch()).toBe(0);
        await auth.signIn({ email: "demo@example.com", password: "password" });
        const signedInEpoch = auth.getEpoch();
        expect(signedInEpoch).toBeGreaterThan(0);
        provider.forceExpire();
        await auth.refresh();
        expect(auth.getEpoch()).toBe(signedInEpoch);
        await auth.signOut();
        expect(auth.getEpoch()).toBeGreaterThan(signedInEpoch);
        auth.dispose();
    });

    it("supports reauthentication step-up without bumping epoch", async () => {
        const provider = createTestAuthProvider();
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        const epoch = auth.getEpoch();
        const stepped = await auth.requestStepUp({ reason: "reauthentication" });
        expect(stepped.session.status).toBe("reauthenticationRequired");
        expect(auth.getEpoch()).toBe(epoch);
        const completed = await auth.completeStepUp();
        expect(completed.status).toBe("authenticated");
        expect(auth.getEpoch()).toBe(epoch);
        auth.dispose();
    });
});
