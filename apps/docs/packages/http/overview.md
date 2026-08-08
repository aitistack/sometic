# HTTP overview

`createHttp` is a fetch-first client: base URL, headers, interceptors, retry/backoff, in-flight dedupe, AbortSignal/timeouts, and typed errors.

Auth is optional. Use `@sometic/http/auth` → `createAuthInterceptor(auth)` to attach bearer tokens and queue requests across `auth.handleUnauthorized()`.
