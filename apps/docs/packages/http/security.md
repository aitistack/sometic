# HTTP security

- Prefer explicit auth interceptors with exclude lists for login/refresh endpoints.
- Normalize errors without embedding tokens or secrets.
- AbortSignal support on every network call.
- Client HTTP does not secure APIs, backends still authorize.

See `docs/security/http-client-boundary.md`.
