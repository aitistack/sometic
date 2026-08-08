# Auth HTTP interceptors

Wire `@sometic/http` to an `AuthController` so requests carry Bearer tokens and 401 responses trigger a single refresh + replay. Auth owns refresh; HTTP must not import provider SDKs.

## Install

```bash
pnpm add @sometic/http @sometic/auth
```

`@sometic/auth` is an optional peer of HTTP. Import the auth subpath explicitly:

```ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";
```

## Basic wiring

::: code-group

```js [JS]
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";

const http = createHttp({
    baseUrl: "https://api.example.com",
    interceptors: [
        createAuthInterceptor({
            auth,
            headerName: "Authorization",
            scheme: "Bearer",
        }),
    ],
});

const { data } = await http.get("/me");
```

```ts [TS]
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";
import type { AuthController } from "@sometic/auth";

declare const auth: AuthController;

const http = createHttp({
    baseUrl: "https://api.example.com",
    interceptors: [
        createAuthInterceptor({
            auth,
            headerName: "Authorization",
            scheme: "Bearer",
        }),
    ],
});

const { data } = await http.get<{ me: string }>("/me");
```

```js [Vanilla]
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";

const http = createHttp({
    baseUrl: "https://api.example.com",
    interceptors: [
        createAuthInterceptor({
            auth,
            headerName: "Authorization",
            scheme: "Bearer",
        }),
    ],
});

const { data } = await http.get("/me");
```

:::

## Options

```ts
type AuthInterceptorOptions = {
    auth: AuthController;
    headerName?: string; // default Authorization
    scheme?: string; // default Bearer
    isUnauthorized?: (response: { status: number }, config: HttpRequestConfig) => boolean;
    exclude?: (config: HttpRequestConfig) => boolean;
    getAccessToken?: (auth: AuthController) => string | null | undefined;
};
```

| Option           | Default behavior                                                                    |
| ---------------- | ----------------------------------------------------------------------------------- |
| `isUnauthorized` | Status `401`                                                                        |
| `exclude`        | URLs containing `/login`, `/signin`, `/sign-in`, `/refresh`, `/register`, `/signup` |
| `getAccessToken` | `auth.getSession().tokens?.accessToken`                                             |

## Refresh queue behavior

1. `onRequest` attaches `Authorization: Bearer <token>` when a token exists.
2. On error with unauthorized status (and not excluded, and not already retried):
    - Start or join a shared `refreshInflight` promise
    - Call `auth.handleUnauthorized()`
    - If session is not authenticated / refreshing, throw `HTTP_UNAUTHORIZED`
3. Return an internal replay request with `meta.authRetried: true` so the client retries once with the new token.

Concurrent 401s share one refresh. That pairs with auth’s single-flight coordinator.

## Custom unauthorized detection

Some APIs return 403 or a JSON body code:

```ts
createAuthInterceptor({
    auth,
    isUnauthorized: ({ status }, config) =>
        status === 401 || (status === 403 && config.meta?.treatForbiddenAsAuth === true),
});
```

## Exclude auth endpoints

```ts
createAuthInterceptor({
    auth,
    exclude: (config) => config.url.includes("/oauth/") || config.url.includes("/public/"),
});
```

Avoid attaching Bearer tokens to credential exchange endpoints and avoid refresh loops on the refresh URL itself.

## Compose with other interceptors

```ts
import { createHttp, composeInterceptors } from "@sometic/http";

const http = createHttp({
    interceptors: [loggingInterceptor, createAuthInterceptor({ auth }), metricsInterceptor],
});
```

Order matters: auth should usually run after headers you want on the wire, and before code that assumes a successful body.

## Patterns

### Cookie sessions

If cookies are httpOnly and same-site, you may omit Bearer attachment:

```ts
createAuthInterceptor({
    auth,
    getAccessToken: () => null,
    // still use handleUnauthorized if your API signals soft expiry via 401
});
```

Or skip the interceptor and call `auth.handleUnauthorized()` from a custom `onError`.

### Per-request opt-out

```ts
await http.get("/health", { meta: { authRetried: true } }); // skips refresh replay path
```

Prefer `exclude` for stable public routes.

## Edge cases

- No token + protected route: request goes without Authorization; server 401 may still attempt refresh if a refresh token exists in storage.
- Refresh failure: session moves invalid; interceptor surfaces `HTTP_UNAUTHORIZED`.
- Disposed auth or HTTP client: subsequent calls fail with disposed codes.

## FAQ

### Why not put Firebase refresh inside HTTP?

Dependency direction: adapters → features → foundation. HTTP may optionally peer on auth. Auth never depends on HTTP. Provider SDKs stay in `@sometic/auth-*`.

### Does retry (network) replace auth replay?

No. Retry/backoff handles transient network and selected status codes. Auth replay is a separate one-shot after `handleUnauthorized`.

### Related

- [Token refresh](/authentication/token-refresh)
- [HTTP utility](/utilities/http)
- [Configuration](/authentication/configuration)
