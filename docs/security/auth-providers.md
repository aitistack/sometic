# Auth providers security

Status: reviewed (Phase 24).

- Provider SDKs stay outside `@sometic/auth` and are peers of optional adapter packages.
- Client adapters are not an API trust boundary. Resource servers still authorize.

## OIDC (`@sometic/auth-oidc`)

- PKCE is S256 only. Empty verifiers and `plain` are rejected.
- Default `redirectUri` matching is **exact** (full URI string), not origin plus pathname. Query-string-tolerant matching was a security hole.
- When `sessionStorage` exists, the PKCE verifier is persisted there so a full-page redirect can complete the code exchange. Inject a custom `store` when you need a different persistence story. Memory-only stores lose the verifier across navigations.
- Discovery, token, and userinfo requests pass `AbortSignal`.
- The browser adapter does **not** verify `id_token` signatures or nonce. Treat ID tokens as opaque until a backend or a dedicated verifier checks them.

## Supabase (`@sometic/auth-supabase`)

- `redirectTo` / `redirectUri` must pass the allowlist. Default: exact match against a configured `redirectUri`, or `http:` / `https:` only when no expected URI is configured. `javascript:` and other schemes are rejected.

## Local REST (`@sometic/auth-local`)

- Absolute `endpoints.*` URLs are refused unless `allowAbsoluteEndpoints: true`.
- Network calls use `AbortSignal` (timeout plus optional caller signal).

## Tokens

Never log access or refresh tokens. Provider error messages that look like secrets are omitted from auth `details`.
