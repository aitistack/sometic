# HTTP security

- Client HTTP does not secure APIs. Backends still authorize every request.
- `createAuthInterceptor` attaches Bearer tokens except on the default exclude list: `/login`, `/signin`, `/sign-in`, `/refresh`, `/register`, `/signup` (substring match on the URL). Override `exclude` when your auth URLs differ.
- Status errors include HTTP status only. They do not embed response bodies, `Authorization` headers, or tokens.
- `createPolicyInterceptor` is UX gating in the client, not API authorization.
- Every network call honors `AbortSignal`.
- Loading `@sometic/http` does not read `window` or `localStorage`.
