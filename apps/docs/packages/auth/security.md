# Auth security

## Trust boundary

Browser auth state is **untrusted**. `@sometic/auth` helps with session UX and refresh coordination, it does **not** secure APIs.

## Rules

1. **Server enforces.** `can()` / route guards only affect UI.
2. **Prefer httpOnly cookies** when your backend supports them.
3. **Document storage choice.** Memory is safer than sessionStorage; sessionStorage is safer than localStorage for XSS exposure of bearer tokens.
4. **Rotate refresh tokens** when the provider returns new tokens.
5. **No secrets in errors.** Never attach tokens to thrown errors.
6. **Dispose.** Call `auth.dispose()` to clear refresh flights and tab listeners.

See `docs/security/auth-client-boundary.md`.
