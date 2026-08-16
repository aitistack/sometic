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
        await expect(auth.completeStepUp()).rejects.toMatchObject({
            code: "AUTH_UNSUPPORTED",
        });
        expect(auth.getSession().status).toBe("reauthenticationRequired");
        const completed = await auth.signIn({
            email: "demo@example.com",
            password: "password",
        });
        expect(completed.status).toBe("authenticated");
        auth.dispose();
    });

    it("does not leak provider token strings on refresh failure", async () => {
        const leaked = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIn0.leak-token";
        const provider = createTestAuthProvider({ accessTokenTtlMs: 1 });
        provider.refresh = async () => {
            throw new Error(`upstream Bearer ${leaked}`);
        };
        const auth = createAuth({
            provider,
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        provider.forceExpire();
        try {
            await auth.refresh();
            throw new Error("expected refresh to fail");
        } catch (error) {
            expect(error).toMatchObject({ code: "AUTH_REFRESH_FAILED" });
            const record = error as { message?: string; details?: unknown };
            const serialized = `${record.message ?? ""} ${JSON.stringify(record.details ?? {})}`;
            expect(serialized).not.toContain(leaked);
            expect(serialized).not.toContain("Bearer ");
            expect(record.details).toBeUndefined();
        }
        auth.dispose();
    });

    it("omits tokens from cross-tab session payloads when opted out", async () => {
        const posted: unknown[] = [];
        const bus = {
            post: (message: unknown) => {
                posted.push(message);
            },
            subscribe: () => () => undefined,
            dispose: () => undefined,
        };
        const auth = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: bus as never,
            crossTabIncludeTokens: false,
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        const sessionMessage = posted.find(
            (message) =>
                typeof message === "object" &&
                message !== null &&
                "type" in message &&
                (message as { type: string }).type === "session",
        ) as { session: { tokens: unknown } } | undefined;
        expect(sessionMessage?.session.tokens).toBeNull();
        expect(auth.getAccessToken()).toBeTruthy();
        auth.dispose();
    });

    it("does not read document when environment is false", () => {
        const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, "document");
        let documentReads = 0;
        Object.defineProperty(globalThis, "document", {
            configurable: true,
            get() {
                documentReads += 1;
                return documentDescriptor?.value;
            },
        });
        const auth = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        expect(documentReads).toBe(0);
        auth.dispose();
        if (documentDescriptor) {
            Object.defineProperty(globalThis, "document", documentDescriptor);
        } else {
            Reflect.deleteProperty(globalThis, "document");
        }
    });
});
