# HTTP client boundary

Status: reviewed (Phase 24).

The HTTP client transports credentials the app chooses to attach. XSS that can read memory or storage can replay those credentials. Refresh queues reduce race bugs; they do not create a trust boundary.

## Auth interceptor

`createAuthInterceptor` attaches `Authorization` unless the request URL matches the default exclude list (or a custom `exclude` callback):

- `/login`
- `/signin`
- `/sign-in`
- `/refresh`
- `/register`
- `/signup`

Matching is substring-based on the lowercased URL. Login and refresh endpoints must not receive a Bearer token from this interceptor. Override `exclude` when your auth URLs differ.

On 401 (except excluded URLs), the interceptor calls `auth.handleUnauthorized()` once, then replays at most once. `HTTP_POLICY_DENIED` is UX gating in the client, not API authorization.

## Errors

Status errors include HTTP status only. They must not embed response bodies, `Authorization` headers, or tokens.

## Abort

Every network call honors `AbortSignal`. Timeouts abort via a composed signal.

## Import

Loading `@sometic/http` does not read `window` or `localStorage`.
