# Auth troubleshooting

Practical failure modes for `@sometic/auth` and provider adapters. Client auth is a UX and refresh layer; API security failures are server issues.

## Error codes

| Code                       | Typical cause                             | What to do                                            |
| -------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| `AUTH_UNSUPPORTED`         | Flow not in provider capabilities         | Check matrix; call `auth.supports("oauth")` before UI |
| `AUTH_CREDENTIALS_INVALID` | Bad password / provider reject            | Show form error; do not log secrets                   |
| `AUTH_INVALID_SESSION`     | Missing user id / token payload           | Fix mapper or provider session endpoint               |
| `AUTH_REFRESH_FAILED`      | Refresh endpoint / SDK failed             | Route to sign-in; clear storage                       |
| `AUTH_STORAGE_FAILED`      | Storage get/set threw                     | Check quota / private mode / custom adapter           |
| `AUTH_DISPOSED`            | Used after `dispose()`                    | Create a new controller; fix lifecycle                |
| `AUTH_UNAUTHORIZED`        | `assertAuthorized` failed                 | UX only; server must still enforce                    |
| `HTTP_UNAUTHORIZED`        | Refresh after 401 did not restore session | Sign-in again; verify refresh capability              |

## Capability mismatches

**Symptom:** `AUTH_UNSUPPORTED` on register, OAuth, or MFA.

**Check:**

```ts
auth.supports("register");
auth.supports("oauth");
```

OIDC has OAuth but not password `signIn`. Local has password flows but not OAuth unless you extend endpoints. See the [capability matrix](/authentication/).

## Refresh loops

**Symptom:** Endless `/refresh` or 401 storms.

**Causes:**

- Auth interceptor not excluding the refresh URL
- Provider refresh returns 401 and HTTP retries forever without `authRetried`
- Multi-tab each calling refresh on logout

**Fix:** Use `createAuthInterceptor` defaults (excludes `/refresh`), rely on single-flight, and ensure logout broadcasts clear peers.

## Tokens missing after reload

**Symptom:** Signed in, reload, signed out.

**Cause:** Memory storage or SSR without hydrate.

**Fix:** `createSessionStorageAuthStorage` / `createLocalStorageAuthStorage`, or cookie sessions + `hydrate` from server.

## Firebase / Supabase peer missing

**Symptom:** Runtime cannot resolve `firebase` or `@supabase/supabase-js`.

**Cause:** Optional peers not installed in the app.

**Fix:** Install the peer alongside `@sometic/auth-firebase` or `@sometic/auth-supabase`. Core `@sometic/auth` never installs them.

## Wrong user mapping

**Symptom:** `AUTH_INVALID_SESSION` “missing user id”.

**Cause:** Local mapper expects `user.id` / `sub`; API returns another shape.

**Fix:** Pass `mapUser` / `mapSession` into `createLocalAuthProvider`.

## OIDC redirect failures

**Symptom:** Callback errors or PKCE store miss.

**Causes:**

- `redirectUri` mismatch (origin/path)
- Memory PKCE store lost across full page redirect (use durable `OidcPkceStore`)
- Discovery URL wrong (`issuer` trailing slash / missing `.well-known`)

**Fix:** Align redirect URIs, persist verifier in `sessionStorage` via custom store, or pass explicit `endpoints`.

## SSR / import-time crashes

**Symptom:** `window is not defined` or storage access at import.

**Cause:** Constructing storage or broadcast bus at module top level in SSR.

**Fix:** Create auth inside bootstrap; use memory storage on server; pass `environment: false` in Node tests. Sometic packages avoid browser globals at import time; app code must too.

## `can()` allows UI but API returns 403

Expected. Client policies are UX only. Fix server authorization / RLS / gateway policies. Do not “fix” security by tightening only `can()`.

## Disposal and HMR

**Symptom:** `AUTH_DISPOSED` after hot reload.

**Fix:** Dispose previous controller before creating a new one in HMR handlers; avoid sharing disposed singletons.

## Checklist

1. Provider package installed and correct peer present
2. `await auth.whenReady()` before relying on session
3. Capability gated UI uses `supports`
4. HTTP uses `createAuthInterceptor` once
5. Storage choice matches security FAQ
6. Server enforces authorization

## FAQ

### Where should I log failures?

Log `error.code` and safe messages. Never attach access or refresh tokens to logs or error `details`.

### How do I reproduce refresh races in tests?

`createTestAuthProvider` supports deterministic expiry and refresh failure counts without cloud keys.

### Related

- [Installation](/authentication/installation)
- [Token refresh](/authentication/token-refresh)
- [Interceptors](/authentication/interceptors)
- [Authorization](/authentication/authorization)
