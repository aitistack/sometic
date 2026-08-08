# Session management

Sessions are the source of truth for UX: status, user, tokens, and readiness. `@sometic/auth` hydrates from storage, keeps a single in-memory snapshot, and notifies subscribers.

## Session model

```ts
import {
    createSession,
    createAnonymousSession,
    createSignedOutSession,
    isAuthenticatedStatus,
    isSessionExpired,
    sessionExpiresAt,
} from "@sometic/auth/session";
```

Typical statuses include authenticated, signed-out / anonymous, refreshing, and invalid (after failed refresh). Prefer controller helpers over hand-rolled status checks:

::: code-group

```js [JS]
import { createAuth, createTestAuthProvider } from "@sometic/auth";

const auth = createAuth({ provider: createTestAuthProvider() });

await auth.whenReady();
auth.isAuthenticated();
auth.getUser();
auth.getAccessToken();
auth.getRefreshToken();
auth.getSession();
```

```ts [TS]
import { createAuth, createTestAuthProvider } from "@sometic/auth";
import type { AuthController, AuthSession, AuthUser } from "@sometic/auth";

const auth: AuthController = createAuth({ provider: createTestAuthProvider() });

const session: AuthSession = await auth.whenReady();
const authenticated: boolean = auth.isAuthenticated();
const user: AuthUser | null = auth.getUser();
const accessToken: string | null = auth.getAccessToken();
const refreshToken: string | null = auth.getRefreshToken();

console.log(session.status, authenticated, user?.id, accessToken, refreshToken);
```

```js [Vanilla]
import { createAuth, createTestAuthProvider } from "@sometic/auth";

const auth = createAuth({ provider: createTestAuthProvider() });

await auth.whenReady();
auth.isAuthenticated();
auth.getUser();
auth.getAccessToken();
auth.getRefreshToken();
auth.getSession();
```

:::

## Hydration

On `createAuth`, the controller loads from storage (if any), optionally asks the provider for `getSession`, and resolves `ready` / `whenReady()` when settled.

```ts
const session = await auth.whenReady();
if (!auth.isReady()) {
    // still hydrating (rare after await)
}
```

### Inject a known session

```ts
await auth.hydrate(
    createSession({
        status: "authenticated",
        user: { id: "u1", email: "a@example.com" },
        tokens: { accessToken: "…", tokenType: "Bearer" },
    }),
);
```

Use hydrate for SSR transfer, deep-link restore, or test fixtures. Prefer provider `getSession` for live backends.

## Subscribe and events

```ts
const stop = auth.subscribe((session) => {
    console.log(session.status, session.user?.id);
});

const off = auth.on("signedIn", (session) => {
    analytics.identify(session.user?.id);
});

auth.on("signedOut", () => {
    router.navigate("/login");
});

auth.on("tokenRefreshed", () => {
    /* optional metrics */
});

auth.on("error", ({ error, session }) => {
    report(error, session.status);
});

auth.on("ready", () => {
    /* first hydration complete */
});

auth.on("sessionUpdated", () => {
    /* any mutation */
});
```

Unsubscribe with the returned functions. Always `auth.dispose()` on app teardown to clear refresh flights and tab listeners.

## Sign-in and sign-out

```ts
await auth.signIn({ email: "user@example.com", password: "secret" });
await auth.signOut();
```

Sign-out clears local session, calls provider `signOut` when supported, and broadcasts `{ type: "logout" }` on the cross-tab bus so peer tabs clear without a refresh storm.

## Multi-tab behavior

| Message   | Effect                                               |
| --------- | ---------------------------------------------------- |
| `logout`  | Peer tabs clear authenticated state                  |
| `session` | Peer tabs may adopt session snapshot (bus-dependent) |

Disable with `crossTab: false` or `createNoopAuthBus()` when tabs must stay isolated (rare).

## Expiry helpers

```ts
const session = auth.getSession();
if (isSessionExpired(session, { now: Date.now(), skewMs: 30_000 })) {
    await auth.ensureFreshSession();
}
```

`skewMs` on `createAuth` makes proactive refresh treat near-expiry as expired.

## Patterns

### Gate UI on readiness

```ts
await auth.whenReady();
if (!auth.isAuthenticated()) {
    location.assign("/login");
}
```

### React / Vue

Use `@sometic/react/auth` or `@sometic/vue/auth` so components re-render on `subscribe` without hand-wiring. The controller remains the same instance.

## Edge cases

- Concurrent `signIn` / `signOut`: last completed write wins; dispose mid-flight rejects with `AUTH_DISPOSED`.
- Empty storage + anonymous provider session: `isAuthenticated()` is false; do not treat missing tokens as authenticated.
- Clock skew: rely on `skewMs` and server `expiresAt`, not client wall clock alone for security decisions (server still enforces).

## FAQ

### Is `getSession()` reactive?

It returns the current snapshot. For updates, use `subscribe` or `on`.

### Memory storage and reload

Memory sessions disappear on full reload. Use session/local storage or server cookies if you need durability.

### Multi-tab logout storms

Sometic posts a single logout message; peers clear without each starting refresh. Do not also call `refresh()` from every tab on logout.

### Related

- [Token refresh](/authentication/token-refresh)
- [Configuration](/authentication/configuration)
- [Authorization](/authentication/authorization)
