# HTTP service

`@sometic/http` provides `createHttp`: a fetch-first client with interceptors, retry, dedupe, typed errors, and optional auth refresh via `@sometic/http/auth`.

This page is the services-hub summary. Full guide: [HTTP utility](/utilities/http).

## Overview

| Piece                | Role                                |
| -------------------- | ----------------------------------- |
| `createHttp`         | Build a disposable client           |
| Interceptors         | Request / response / error hooks    |
| `@sometic/http/auth` | Optional Sometic auth refresh queue |
| `createMockFetcher`  | Deterministic tests                 |

### When to use

- Browser or SSR apps that want a thin fetch wrapper with typed errors
- Coordinating 401 recovery with `@sometic/auth` without embedding provider SDKs
- Injecting a custom `fetcher` for Node, edge, or mocks

### When not to use

- You already standardize on another HTTP stack and only need auth session APIs
- GraphQL clients with their own link chains (compose carefully; do not assume this replaces them)
- Treating client HTTP status handling as server authorization

## Installation

::: code-group

```bash [npm]
npm install @sometic/http
```

```bash [pnpm]
pnpm add @sometic/http
```

```bash [yarn]
yarn add @sometic/http
```

```bash [bun]
bun add @sometic/http
```

:::

Optional peer for auth interceptors: `@sometic/auth`.

## Usage

```ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";

const http = createHttp({
    baseUrl: "https://api.example.com",
    timeoutMs: 15_000,
    interceptors: [createAuthInterceptor({ auth })],
});

const { data, status } = await http.get<Profile>("/me");
const created = await http.post("/items", JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
});

http.dispose();
```

## Key APIs

```ts
createHttp(options?: CreateHttpOptions): HttpClient
```

| Option         | Role                             |
| -------------- | -------------------------------- |
| `baseUrl`      | Prefix for relative URLs         |
| `headers`      | Default headers                  |
| `fetcher`      | Injectable `fetch` (SSR / mocks) |
| `timeoutMs`    | Default timeout                  |
| `interceptors` | Request / response / error hooks |
| `retry`        | Backoff policy or `false`        |
| `dedupe`       | In-flight dedupe or `false`      |

Client methods: `request`, `get`, `post`, `put`, `patch`, `delete`, `extend`, `dispose`.

## Auth refresh queue

On unauthorized responses, `createAuthInterceptor`:

1. Joins a single refresh flight via `auth.handleUnauthorized()`
2. Replays the request once (`meta.authRetried`)
3. Surfaces `HTTP_UNAUTHORIZED` if the session is not restored

Auth core never imports HTTP. Provider SDKs stay in auth adapters. See [Interceptors](/authentication/interceptors).

## Errors

| Code                | Meaning              |
| ------------------- | -------------------- |
| `HTTP_NETWORK`      | Network failure      |
| `HTTP_TIMEOUT`      | Timeout              |
| `HTTP_ABORTED`      | Aborted              |
| `HTTP_STATUS`       | Non-OK status        |
| `HTTP_PARSE`        | Body parse failure   |
| `HTTP_UNAUTHORIZED` | Auth recovery failed |
| `HTTP_DISPOSED`     | Used after dispose   |

## How it works

`createHttp` wraps an injectable `fetcher` (defaulting to platform `fetch` when present). Interceptors form a pipeline around request execution. Retry and dedupe are opt-in policies on the client, not global singletons. `extend` derives a child client with merged defaults; `dispose` cancels in-flight bookkeeping the client owns.

## Security

Do not log tokens. Prefer credentialed `fetcher` wrappers for cookie sessions. SSR must pass an explicit `fetcher`. Client HTTP does not replace server authorization.

## Edge cases

| Edge                                | Behavior                          |
| ----------------------------------- | --------------------------------- |
| Call after `dispose`                | `HTTP_DISPOSED`                   |
| Parallel 401s with auth interceptor | One refresh flight; single replay |
| Relative URL without `baseUrl`      | Passed through to `fetcher` as-is |
| Custom parse failures               | `HTTP_PARSE`                      |

## FAQ

### Is auth required to use HTTP?

No. Import `@sometic/http/auth` only when wiring Sometic auth.

### How do I mock?

`createMockFetcher(handlers)` or inject a custom `fetcher`.

### Does this bundle Axios?

No. Fetch-first by design.

### Where is the longer guide?

[HTTP utility](/utilities/http) under Utilities.

### SSR?

Pass `fetcher` explicitly. Do not assume `globalThis.fetch` exists at import time in every runtime.

## Related

- [HTTP utility (full)](/utilities/http)
- [Utilities hub](/utilities/)
- [Auth service](/services/auth)
- [Token refresh](/authentication/token-refresh)
- [Interceptors](/authentication/interceptors)
- [Services index](/services/)
- [Package index](/api/packages)
