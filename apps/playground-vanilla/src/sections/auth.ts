import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createSessionStorageAuthStorage,
    createTestAuthProvider,
    requireAuthenticated,
    requirePermission,
    type AuthController,
    type AuthStorage,
} from "@sometic/auth";
import "@sometic/elements/auth";

type StorageMode = "memory" | "session";

export function mountAuthSection(root: HTMLElement): () => void {
    const status = root.querySelector<HTMLElement>("[data-auth-status]");
    const sessionEl = root.querySelector<HTMLElement>("[data-auth-session]");
    const canEl = root.querySelector<HTMLElement>("[data-auth-can]");
    const emailInput = root.querySelector<HTMLInputElement>("[data-auth-email]");
    const passwordInput = root.querySelector<HTMLInputElement>("[data-auth-password]");
    const storageSelect = root.querySelector<HTMLSelectElement>("[data-auth-storage]");
    const authStatusEl = root.querySelector<HTMLElement & { auth: AuthController | null }>(
        "sometic-auth-status",
    );
    if (
        !status ||
        !sessionEl ||
        !canEl ||
        !emailInput ||
        !passwordInput ||
        !storageSelect ||
        !authStatusEl
    ) {
        throw new Error("Auth section nodes missing");
    }

    emailInput.value = "demo@example.com";
    passwordInput.value = "password";

    let provider = createTestAuthProvider();
    let auth: AuthController | null = null;
    let unsubscribe: (() => void) | null = null;

    const resolveStorage = (mode: StorageMode): AuthStorage => {
        if (mode === "session") {
            return createSessionStorageAuthStorage("pg.auth.session");
        }
        return createMemoryAuthStorage();
    };

    const render = (): void => {
        if (!auth) {
            return;
        }
        const session = auth.getSession();
        sessionEl.textContent = JSON.stringify(
            {
                status: session.status,
                user: session.user
                    ? {
                          id: session.user.id,
                          email: session.user.email,
                          roles: session.user.roles,
                          permissions: session.user.permissions,
                      }
                    : null,
                expiresAt: session.tokens?.expiresAt ?? null,
            },
            null,
            2,
        );
        const authenticated = auth.can(requireAuthenticated());
        const canRead = auth.can(requirePermission("read:profile"));
        canEl.textContent = `can(authenticated)=${String(authenticated)} · can(read:profile)=${String(canRead)} · UX only — not API security`;
    };

    const recreate = (mode: StorageMode): void => {
        unsubscribe?.();
        auth?.dispose();
        provider = createTestAuthProvider();
        auth = createAuth({
            provider,
            storage: resolveStorage(mode),
            crossTab: createNoopAuthBus(),
        });
        authStatusEl.auth = auth;
        unsubscribe = auth.subscribe(() => {
            render();
        });
        render();
        status.textContent = `Ready (${mode} storage · test provider)`;
    };

    recreate((storageSelect.value as StorageMode) || "memory");

    root.querySelector("[data-auth-signin]")?.addEventListener("click", () => {
        void auth
            ?.signIn({ email: emailInput.value, password: passwordInput.value })
            .then(() => {
                status.textContent = "Signed in";
            })
            .catch((error: Error) => {
                status.textContent = error.message;
            });
    });
    root.querySelector("[data-auth-signout]")?.addEventListener("click", () => {
        void auth?.signOut().then(() => {
            status.textContent = "Signed out";
        });
    });
    root.querySelector("[data-auth-refresh]")?.addEventListener("click", () => {
        void auth
            ?.refresh()
            .then(() => {
                status.textContent = "Refreshed";
            })
            .catch((error: Error) => {
                status.textContent = error.message;
            });
    });
    root.querySelector("[data-auth-expire]")?.addEventListener("click", () => {
        provider.forceExpire();
        render();
        status.textContent = "Forced access expiry (call Refresh)";
    });
    root.querySelector("[data-auth-unauthorized]")?.addEventListener("click", () => {
        void auth?.handleUnauthorized().then((session) => {
            status.textContent = `handleUnauthorized → ${session.status}`;
        });
    });
    storageSelect.addEventListener("change", () => {
        recreate((storageSelect.value as StorageMode) || "memory");
    });

    return () => {
        unsubscribe?.();
        auth?.dispose();
        authStatusEl.auth = null;
    };
}
