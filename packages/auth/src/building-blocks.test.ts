import { describe, expect, it } from "vitest";
import {
    can,
    createLocalStorageAuthStorage,
    createMemoryAuthStorage,
    createPolicy,
    createSession,
    createSessionStorageAuthStorage,
    isSessionExpired,
    requireAuthenticated,
    requireClaim,
    requirePermission,
    requireRole,
    runSignInFlow,
} from "./index.js";
import { createTestAuthProvider } from "./test-provider/index.js";

describe("auth building blocks", () => {
    it("detects expiry with skew", () => {
        const session = createSession({
            status: "authenticated",
            tokens: { expiresAt: 1_000 },
        });
        expect(isSessionExpired(session, 900, 200)).toBe(true);
        expect(isSessionExpired(session, 700, 200)).toBe(false);
    });

    it("evaluates authorization policies", () => {
        const session = createSession({
            status: "authenticated",
            user: {
                id: "1",
                roles: ["admin"],
                permissions: ["write"],
                claims: { plan: "pro" },
            },
        });
        expect(can(session, requireAuthenticated())).toBe(true);
        expect(can(session, requireRole("admin"))).toBe(true);
        expect(can(session, requirePermission("write"))).toBe(true);
        expect(can(session, requireClaim("plan", "pro"))).toBe(true);
        expect(can(session, createPolicy(requireRole("admin"), requirePermission("missing")))).toBe(
            false,
        );
    });

    it("persists sessions through storage adapters", async () => {
        const memory = createMemoryAuthStorage();
        const session = createSession({ status: "authenticated", user: { id: "u1" } });
        await memory.setSession(session);
        expect(await memory.getSession()).toEqual(session);
        await memory.clearSession();
        expect(await memory.getSession()).toBeNull();

        const local = createLocalStorageAuthStorage("test.auth");
        await local.setSession(session);
        expect(await local.getSession()).toMatchObject({ status: "authenticated" });
        await local.clearSession();

        const sess = createSessionStorageAuthStorage("test.auth.session");
        await sess.setSession(session);
        expect(await sess.getSession()).toMatchObject({ user: { id: "u1" } });
        await sess.clearSession();
    });

    it("gates flows by capability", async () => {
        const provider = createTestAuthProvider();
        provider.capabilities.delete("signIn");
        await expect(
            runSignInFlow(
                {
                    provider,
                    session: createSession({ status: "anonymous" }),
                },
                { email: "demo@example.com", password: "password" },
            ),
        ).rejects.toMatchObject({ code: "AUTH_UNSUPPORTED" });
    });
});
