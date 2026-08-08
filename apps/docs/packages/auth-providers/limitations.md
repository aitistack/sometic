# Auth provider limitations

| Adapter  | Intentional limits                                                                           |
| -------- | -------------------------------------------------------------------------------------------- |
| local    | No OAuth/MFA unless you extend endpoints; assumes JSON REST shapes (use mappers)             |
| firebase | Email/password + session/refresh/password-reset/email-verify first; phone/MFA UI not wrapped |
| supabase | OAuth only when `signInWithOAuth` exists on the injected client                              |
| oidc     | SPA PKCE only, no resource-owner password; discovery optional                                |
| test     | In-memory; not for production                                                                |

Client adapters do **not** secure APIs. Backends enforce authorization.
