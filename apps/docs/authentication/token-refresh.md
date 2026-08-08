# Token refresh

Refresh is owned by `@sometic/auth`, not by HTTP. The HTTP auth interceptor calls `auth.handleUnauthorized()` on 401; auth runs a single-flight refresh and returns the updated session.

## How it works

1. Provider declares `refresh` capability.
2. `createRefreshCoordinator` keeps **one** in-flight promise.
3. Concurrent `auth.refresh()` callers await the same flight.
4. Retries are capped; failure transitions the session toward `invalid`.
5. Success emits `tokenRefreshed` / `sessionUpdated` and persists via storage.

```ts
import { createRefreshCoordinator } from "@sometic/auth/refresh";

// Normally you do not construct this yourself; createAuth owns it.
const coordinator = createRefreshCoordinator({
    refresh: () => provider.refresh!(session),
});
```

## Controller APIs

| Method                 | When to call                                               |
| ---------------------- | ---------------------------------------------------------- |
| `refresh(reason?)`     | Explicit refresh (timer, user action, tests)               |
| `ensureFreshSession()` | Ensure not expired under skew before sensitive work        |
| `handleUnauthorized()` | HTTP 401 recovery seam (also used by `@sometic/http/auth`) |

::: code-group

```js [JS]
await auth.refresh("manual");
await auth.ensureFreshSession();
const session = await auth.handleUnauthorized();
```

```ts [TS]
import type { AuthSession } from "@sometic/auth";

await auth.refresh("manual");
await auth.ensureFreshSession();
const session: AuthSession = await auth.handleUnauthorized();
```

```js [Vanilla]
await auth.refresh("manual");
await auth.ensureFreshSession();
const session = await auth.handleUnauthorized();
```

:::

## Auto-refresh

```ts
const auth = createAuth({
    provider,
    autoRefresh: true,
    refreshIntervalMs: 60_000,
});
```

When enabled, the controller schedules refresh near expiry using `environment` visibility / online hooks when available. Pass `environment: false` in Node tests.

## Single-flight and races

```ts
await Promise.all([auth.refresh("a"), auth.refresh("b"), auth.refresh("c")]);
// One provider.refresh invocation; three awaiters share the result
```

Error codes related to refresh:

| Code                     | Meaning                                     |
| ------------------------ | ------------------------------------------- |
| `AUTH_REFRESH_FAILED`    | Provider refresh failed after retries       |
| `AUTH_REFRESH_IN_FLIGHT` | Exposed in edge diagnostics when applicable |
| `AUTH_INVALID_SESSION`   | Session cannot be refreshed                 |
| `AUTH_UNSUPPORTED`       | Provider lacks `refresh`                    |

## HTTP integration

```ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";

const http = createHttp({
    baseUrl: "https://api.example.com",
    interceptors: [createAuthInterceptor({ auth })],
});
```

On unauthorized responses (default status 401), the interceptor:

1. Skips excluded URLs (`/login`, `/sign-in`, `/refresh`, …)
2. Awaits a shared refresh via `auth.handleUnauthorized()`
3. Replays the request once (`meta.authRetried`)
4. Throws `HTTP_UNAUTHORIZED` if refresh does not restore an authenticated session

Auth core never imports `@sometic/http`. HTTP optionally peers on auth. See [Interceptors](/authentication/interceptors).

## Patterns

### Proactive before upload

```ts
await auth.ensureFreshSession();
await http.post("/uploads", formData);
```

### Force provider token (Firebase)

Firebase adapter refresh calls `user.getIdToken(true)`. Prefer `auth.refresh()` over calling the SDK directly so storage and events stay consistent.

## Edge cases

- Multi-tab: only one tab should own aggressive auto-refresh; logout broadcast prevents refresh storms after sign-out.
- Missing refresh token: provider must fail cleanly with `AUTH_REFRESH_FAILED`; UI should route to sign-in.
- Never attach tokens to thrown errors (Sometic errors omit secrets).

## FAQ

### Who owns refresh: auth or HTTP?

Auth. HTTP only detects unauthorized responses and asks auth to recover, then replays.

### Why single-flight?

Without it, parallel 401s create N refresh calls, rotate tokens incorrectly, and race storage writes.

### Can I refresh without HTTP?

Yes. Call `auth.refresh()` or enable `autoRefresh`. HTTP is optional.

### Related

- [Interceptors](/authentication/interceptors)
- [Session management](/authentication/session-management)
- [HTTP utility](/utilities/http)
