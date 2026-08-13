# HTTP client

`@sometic/http` is a fetch-first client: interceptors, retry/backoff, in-flight dedupe, typed errors, mock fetcher helpers, and an optional auth refresh queue via `@sometic/http/auth`. It does not embed Firebase, Supabase, or OIDC SDKs. `@sometic/auth` is an optional peer used only when you import the auth interceptor.

::: tip System standout: epoch ledger + policy
`createAuthInterceptor` tags `meta.sessionEpoch` and refuses replay after an epoch bump (`HTTP_SESSION_STALE`). `createPolicyInterceptor` fails closed on capability checks. Defaults: `allowAbsoluteUrl: false`, optional `maxResponseBytes`. Prefer [`createAppShell`](/guide/app-shell) / `bindAuthToHttp` for the full spine.
:::

<CopyPrompt surface="http" />

## Overview

| Concern       | API                                                      |
| ------------- | -------------------------------------------------------- |
| Create client | `createHttp(options?)`                                   |
| Verbs         | `get` / `post` / `put` / `patch` / `delete` / `request`  |
| Extend        | `client.extend(overrides)`                               |
| Interceptors  | `interceptors` option + `composeInterceptors`            |
| Auth refresh  | `createAuthInterceptor` from `@sometic/http/auth`        |
| Policy        | `createPolicyInterceptor` from `@sometic/http/auth`      |
| Transport     | `allowAbsoluteUrl` (default `false`), `maxResponseBytes` |
| Retry         | `retry` option / per-request `retry`                     |
| Dedupe        | `dedupe` option / per-request `dedupe`                   |
| Errors        | `HTTP_ERROR_CODES` / `createHttpError`                   |
| Tests         | `createMockFetcher`                                      |

### When to use

Shared HTTP behavior across Vanilla, React, and Vue without pulling Axios into every adapter, especially when paired with Sometic auth refresh.

### When not to use

- You need a full GraphQL cache layer (use a GraphQL client; optionally wrap transport)
- You want provider SDKs inside the HTTP package (they belong in `@sometic/auth-*`)

## Installation

<InstallCommands packages="@sometic/http" />

For auth interceptors also install `@sometic/auth` (optional peer):

```bash
pnpm add @sometic/auth
```

## Usage

### Create and call

::: code-group

```js [JS]
import { createHttp } from "@sometic/http";

const http = createHttp({
    baseUrl: "https://api.example.com",
    headers: { Accept: "application/json" },
    timeoutMs: 15_000,
});

const users = await http.get("/users");
const created = await http.post("/users", JSON.stringify({ name: "Ada" }), {
    headers: { "Content-Type": "application/json" },
});

http.dispose();
```

```ts [TS]
import { createHttp } from "@sometic/http";

const http = createHttp({
    baseUrl: "https://api.example.com",
    headers: { Accept: "application/json" },
    timeoutMs: 15_000,
});

const users = await http.get<User[]>("/users");
const created = await http.post<User>("/users", JSON.stringify({ name: "Ada" }), {
    headers: { "Content-Type": "application/json" },
});

http.dispose();
```

```js [Vanilla]
import { createHttp } from "@sometic/http";

const http = createHttp({
    baseUrl: "https://api.example.com",
});

const users = await http.get("/users");
http.dispose();
```


```js [CDN]
import { createHttp } from "https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.esm.js";

const http = createHttp({ baseUrl: "/api" });
const me = await http.get("/me");
```
:::

### Auth refresh queue

```ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";
import type { AuthController } from "@sometic/auth";

function createApi(auth: AuthController) {
    return createHttp({
        baseUrl: "https://api.example.com",
        interceptors: [createAuthInterceptor({ auth })],
    });
}
```

On 401 (configurable), the interceptor calls `auth.handleUnauthorized()`, shares one in-flight refresh, and replays the request once. Details: [Auth interceptors](/authentication/interceptors) and [Token refresh](/authentication/token-refresh).

## How it works

1. Merge `baseUrl`, default headers, and per-request config (`joinUrl`, `mergeHeaders`).
2. Run request interceptors in order.
3. Optionally dedupe identical in-flight requests.
4. `fetch` with timeout via composed `AbortSignal`.
5. Parse by `responseType` (`json` default).
6. Run response interceptors; on failure run error interceptors (auth may return a replay).
7. Retry according to retry policy when enabled.

Auth core never imports HTTP. HTTP optionally peers on auth. Provider SDKs never enter this package.

## API

### `createHttp`

```ts
type CreateHttpOptions = {
    baseUrl?: string;
    headers?: Record<string, string>;
    fetcher?: typeof fetch;
    timeoutMs?: number;
    interceptors?: HttpInterceptor[];
    retry?: RetryOptions | false;
    dedupe?: DedupeOptions | false;
    now?: () => number;
};

type HttpClient = {
    request: <T = unknown>(config: HttpRequestConfig) => Promise<HttpResponse<T>>;
    get: <T>(url: string, init?) => Promise<HttpResponse<T>>;
    post: <T>(url: string, body?, init?) => Promise<HttpResponse<T>>;
    put: <T>(url: string, body?, init?) => Promise<HttpResponse<T>>;
    patch: <T>(url: string, body?, init?) => Promise<HttpResponse<T>>;
    delete: <T>(url: string, init?) => Promise<HttpResponse<T>>;
    extend: (overrides: CreateHttpOptions) => HttpClient;
    dispose: () => void;
};
```

### Request config

```ts
type HttpRequestConfig = {
    method?: HttpMethod | string;
    url: string;
    headers?: Record<string, string>;
    body?: BodyInit | null;
    signal?: AbortSignal | null;
    timeoutMs?: number;
    responseType?: "json" | "text" | "blob" | "arrayBuffer" | "raw";
    retry?: boolean | number;
    dedupe?: boolean;
    authReplay?: boolean;
    meta?: Record<string, unknown>;
};
```

### Response

```ts
type HttpResponse<T = unknown> = {
    data: T;
    status: number;
    headers: Headers;
    url: string;
    raw: Response;
};
```

### Interceptors

```ts
type HttpInterceptor = {
    onRequest?: (config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
    onResponse?: <T>(
        response: HttpResponse<T>,
        config: HttpRequestConfig,
    ) => HttpResponse<T> | Promise<HttpResponse<T>>;
    onError?: (error: unknown, config: HttpRequestConfig) => unknown | Promise<unknown>;
};
```

Helpers: `composeInterceptors`, `runRequestInterceptors`, `runResponseInterceptors`, `runErrorInterceptors`.

### Retry

```ts
type RetryOptions = {
    retries?: number;
    minDelayMs?: number;
    maxDelayMs?: number;
    factor?: number;
    retryOn?: (context: {
        attempt: number;
        error: unknown;
        config: HttpRequestConfig;
        response?: Response;
    }) => boolean;
    methods?: readonly string[];
};
```

Also exported: `computeRetryDelay`, `resolveRetryOptions`, `shouldRetryDefault`, `wait`.

### Dedupe

```ts
type DedupeOptions = {
    enabled?: boolean;
    methods?: readonly string[];
    includeAuthorization?: boolean;
};
```

`dedupeKey` builds the key; set `includeAuthorization` when distinct users share a client.

### Auth interceptor

```ts
import { createAuthInterceptor } from "@sometic/http/auth";

createAuthInterceptor({
    auth,
    headerName?: string;
    scheme?: string;
    isUnauthorized?: (response: { status: number }, config) => boolean;
    exclude?: (config) => boolean;
    getAccessToken?: (auth) => string | null | undefined;
});
```

### Errors

| Code                | Meaning                       |
| ------------------- | ----------------------------- |
| `HTTP_NETWORK`      | fetch failed / offline        |
| `HTTP_TIMEOUT`      | timeout fired                 |
| `HTTP_ABORTED`      | signal aborted                |
| `HTTP_STATUS`       | non-OK HTTP status            |
| `HTTP_PARSE`        | body parse failed             |
| `HTTP_UNAUTHORIZED` | auth refresh recovery failed  |
| `HTTP_DISPOSED`     | client used after `dispose()` |

```ts
import { HTTP_ERROR_CODES, createHttpError } from "@sometic/http";
```

Errors are `SometicError` instances: stable `code`, safe to log, no tokens in `details`.

## Patterns

### Extend for a service slice

```ts
const api = createHttp({ baseUrl: "https://api.example.com" });
const billing = api.extend({
    baseUrl: "https://api.example.com/billing",
    headers: { "X-Service": "billing" },
});
```

### Mock in tests

```ts
import { createHttp, createMockFetcher } from "@sometic/http";

const fetcher = createMockFetcher([
    { method: "GET", url: "/me", status: 200, body: { id: "u1" } },
    { method: "GET", url: /\/items\/\d+/, status: 404, body: { error: "missing" }, times: 1 },
]);

const http = createHttp({ baseUrl: "https://example.test", fetcher });
```

### Abort and timeout

```ts
const ac = new AbortController();
const pending = http.get("/slow", { signal: ac.signal, timeoutMs: 5_000 });
ac.abort();
```

### Custom interceptor logging

```ts
const logging: HttpInterceptor = {
    onRequest: (config) => {
        console.info(config.method ?? "GET", config.url);
        return config;
    },
    onError: (error, config) => {
        console.warn("http failed", config.url, error);
        return error;
    },
};
```

## Security

| Rule                 | Detail                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| No secrets in errors | Do not put tokens in `createHttpError` details                                                   |
| Auth peer optional   | Import `/auth` only when wiring Sometic auth                                                     |
| Cookies              | Use `fetcher` wrapper with `credentials: "include"` when same-site cookies apply                 |
| SSR                  | Pass an explicit `fetcher`; do not assume `window.fetch` at import time                          |
| CSRF                 | Cookie sessions still need server CSRF strategy; Bearer headers are not a CSRF fix by themselves |
| Provider SDKs        | Stay in auth adapters, never in HTTP                                                             |

Browser HTTP is untrusted input to your API. Status codes and bodies can be forged by XSS. Server authorization remains mandatory. See also [Auth security boundary](/authentication/).

## Edge cases

- `dispose()` rejects subsequent requests with `HTTP_DISPOSED`.
- Dedupe + auth replay: replay uses `meta.authRetried` to avoid infinite loops.
- `responseType: "raw"` returns the `Response` in `data` handling paths as configured; prefer `json` for APIs.
- Relative URLs without `baseUrl` use the request URL as given; join rules follow `joinUrl`.

## FAQ

### Why not Axios?

Fetch is ubiquitous, tree-shake friendly, and enough for interceptors + retry + dedupe. Axios remains fine if you already standardized on it; Sometic HTTP exists for a shared engine across adapters without Axios as a hard dependency.

### Does HTTP refresh tokens itself?

No. It asks `AuthController.handleUnauthorized()`. Auth talks to the provider, which keeps the auth core provider-independent.

### Is `@sometic/auth` required?

Only for `@sometic/http/auth`. Core `createHttp` works without auth.

### How do I attach non-Bearer headers?

Use a request interceptor or default `headers`. For Bearer, prefer `createAuthInterceptor`.

### Related

- [Utilities hub](/utilities/)
- [Auth interceptors](/authentication/interceptors)
- [Token refresh](/authentication/token-refresh)
- [Services HTTP](/services/http)
- [Auth service](/services/auth)
