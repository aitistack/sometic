# Auth FAQ

## Why is Firebase / Supabase / OIDC not in `@sometic/auth`?

Auth core is provider-independent. SDKs live in optional `@sometic/auth-*` packages so apps only pay for the providers they use. See [Auth providers](/packages/auth-providers/).

## Is `can()` / `authorize()` secure?

**No.** Client authorization helpers are **UX only**. APIs must enforce authorization on the server.

## Where do tokens live?

Wherever the storage adapter writes them:

- `createMemoryAuthStorage`, SSR-safe, lost on reload
- `createSessionStorageAuthStorage`, tab-scoped; XSS can still read it
- `createLocalStorageAuthStorage`, durable; highest XSS risk for bearer tokens

## How does refresh dedupe work?

`createRefreshCoordinator` keeps a single in-flight promise. Concurrent `auth.refresh()` callers await the same flight. Retries are capped; failure transitions the session to `invalid`.

## When does HTTP plug in?

`@sometic/http/auth` calls `auth.handleUnauthorized()` on 401 responses. Auth owns refresh; HTTP must not import provider SDKs.

## Is auth a UI library?

No. `@sometic/auth` is headless orchestration only, no login forms or components. Professional surfaces include session readiness (`whenReady`), token helpers, events (`on("signedIn")`), password/email/OAuth/MFA/revoke capability-gated flows, proactive refresh hooks, and UX-only `can()`.

## Why a test provider?

`createTestAuthProvider` is deterministic for unit tests (forced expiry, refresh failure counts) without shipping a fake Firebase.

## Multi-tab logout

Sign-out broadcasts `{ type: "logout" }` on the cross-tab bus so peer tabs clear session without starting a refresh storm.
