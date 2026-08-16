# Auth security

## Trust boundary

Browser auth state is **untrusted**. `@sometic/auth` helps with session UX and refresh coordination. It does **not** secure APIs.

## Rules

1. **Server enforces.** `can()` / `cannot()` / `authorize()` and route guards only affect UI.
2. **Prefer httpOnly cookies** when your backend supports them.
3. **Document storage choice.** Memory is safer than sessionStorage; sessionStorage is safer than localStorage for XSS exposure of bearer tokens.
4. **Rotate refresh tokens** when the provider returns new tokens.
5. **No secrets in errors.** Thrown auth errors do not attach access or refresh tokens.
6. **Dispose.** Call `auth.dispose()` to clear refresh flights and tab listeners.

## Cross-tab

The default BroadcastChannel bus posts the **full session, including tokens**, so another tab can adopt a refresh. That is the default on purpose. Set `crossTabIncludeTokens: false` if tokens must stay off the channel (peer tabs then see `tokens: null`).

## Step-up

`completeStepUp()` is not MFA. Completing a challenge requires `verifyMfa(challengeId, code)` or signing in again for reauthentication.

## OIDC

Redirect URIs must match the configured value exactly. PKCE is S256 only. The browser adapter does **not** verify `id_token` signatures or nonce.

## Import and SSR

Loading `@sometic/auth` does not read `window` or `localStorage`. Pass `environment: false` when there is no `document` (Node tests, some SSR shells).
