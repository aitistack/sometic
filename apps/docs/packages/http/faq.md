# HTTP FAQ

## Why fetch-first instead of Axios?

Native `fetch` is everywhere modern apps run. Axios stays out of the default graph; an optional adapter can come later without reshaping the core.

## Does `@sometic/http` pull auth?

No. Auth is an optional peer used only by `@sometic/http/auth`.

## How does the refresh queue work?

On 401 (excluding login/refresh URLs), the interceptor calls `auth.handleUnauthorized()` once. Concurrent waiters share that flight, then each request replays at most once.

Login and refresh URLs also skip the Bearer header. Matching is a substring check for `/login`, `/signin`, `/sign-in`, `/refresh`, `/register`, and `/signup`. Override `exclude` when your routes differ.

## Do HTTP errors include response bodies?

No. Status errors carry `{ status }` only. Tokens and `Authorization` values stay out of thrown errors.

## Is the policy interceptor authorization?

No. `createPolicyInterceptor` is UX gating in the client. APIs must still enforce access.

## Is retry safe for POST?

Default retry methods are GET/HEAD/OPTIONS only. Opt in for unsafe methods deliberately.
