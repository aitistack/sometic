# Local REST

`createLocalAuthProvider({ baseUrl, endpoints?, fetcher? })` talks JSON REST.

Default paths: `/auth/sign-in`, `/register`, `/refresh`, `/sign-out`, `/session`, `/password-reset`.

No Firebase/Supabase SDK. Map responses with `mapUser` / `mapTokens` / `mapSession` if your API shape differs.
