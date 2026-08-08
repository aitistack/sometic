# HTTP API

| Export                             | Role                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `createHttp(options)`              | Client with `request` / `get` / `post` / `put` / `patch` / `delete` / `extend` / `dispose` |
| `createMockFetcher`                | Deterministic test transport                                                               |
| `createAuthInterceptor` (`./auth`) | Bearer attach + 401 refresh queue                                                          |
| Retry helpers (`./retry`)          | Backoff + Retry-After                                                                      |

Errors: `HTTP_NETWORK`, `HTTP_TIMEOUT`, `HTTP_ABORTED`, `HTTP_STATUS`, `HTTP_PARSE`, `HTTP_UNAUTHORIZED`, `HTTP_DISPOSED`.
