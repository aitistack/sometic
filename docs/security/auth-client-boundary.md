# Auth client boundary

Status: reviewed (Phase 24).

Client-side auth orchestration is a **convenience and UX layer**. Attackers who can run script in the page can:

- Read tokens from any non-httpOnly storage
- Call `can()` and ignore the result
- Trigger refresh or sign-out
- Read a default `BroadcastChannel` session payload if it includes tokens

Mitigations live primarily on the server (httpOnly session cookies, CSRF, short-lived access tokens, refresh-token binding, anomaly detection).

## Storage

`createMemoryAuthStorage` is the safest default for XSS (tokens die with the tab). `sessionStorage` and `localStorage` adapters exist for reload survival; XSS can still read them. Document the choice in the app, not only in this file.

## Cross-tab bus

The default `BroadcastChannel` bus posts the **full session**, including tokens, so peer tabs can adopt a refreshed session. That is intentional and unchanged. Apps that must not put bearer tokens on a broadcast channel should set `crossTabIncludeTokens: false` (peer tabs then receive `tokens: null` and must hydrate from their own storage) or supply a custom bus.

## Step-up

`completeStepUp()` is not MFA. Completing a step-up requires a provider round-trip (`verifyMfa` with `challengeId` and `code`, or `signIn` again for reauthentication). Flipping `mfaRequired` / `reauthenticationRequired` to `authenticated` in memory is rejected.

## Errors

Refresh and provider failures must not attach access tokens, refresh tokens, or `Authorization` values to `message` or `details`.

## Import and SSR

Loading `@sometic/auth` does not read `window` or `localStorage`. `createAuth({ environment: false })` does not require `document`.
