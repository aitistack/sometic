# Auth providers FAQ

## Why aren’t SDKs in `@sometic/auth`?

Auth core stays provider-agnostic; optional packages hold peer SDKs.

## Which should I pick?

- Own backend JSON → `auth-local`
- Already on Firebase → `auth-firebase`
- Already on Supabase → `auth-supabase`
- Generic IdP (Auth0, Keycloak, Cognito OIDC…) → `auth-oidc`

## Do I need cloud keys for local examples?

No. Use `createTestAuthProvider` or mock Local/Firebase/Supabase/OIDC responses in development.

## Is client auth secure?

No. Backends enforce access. Adapters only coordinate sessions for UX + HTTP refresh.
