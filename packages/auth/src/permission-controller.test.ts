import { describe, expect, it } from "vitest";
import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createPermissionController,
    createTestAuthProvider,
} from "./index.js";

describe("permission controller", () => {
    it("grants resource-scoped permissions beyond session claims", async () => {
        const auth = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        const permissions = createPermissionController({ auth });
        expect(permissions.can("read:profile")).toBe(true);
        expect(permissions.can({ permission: "docs:edit", resource: "doc-1" })).toBe(false);
        permissions.grant({ permission: "docs:edit", resource: "doc-1" });
        expect(permissions.can({ permission: "docs:edit", resource: "doc-1" })).toBe(true);
        expect(permissions.can({ permission: "docs:edit", resource: "doc-2" })).toBe(false);
        permissions.revoke({ permission: "docs:edit", resource: "doc-1" });
        expect(permissions.can({ permission: "docs:edit", resource: "doc-1" })).toBe(false);
        permissions.dispose();
        auth.dispose();
    });

    it("require throws when unauthorized", async () => {
        const auth = createAuth({
            provider: createTestAuthProvider(),
            storage: createMemoryAuthStorage(),
            crossTab: createNoopAuthBus(),
            environment: false,
        });
        await auth.signIn({ email: "demo@example.com", password: "password" });
        const permissions = createPermissionController({ auth });
        expect(() => permissions.require("admin")).toThrow(/Not authorized/);
        permissions.dispose();
        auth.dispose();
    });
});
