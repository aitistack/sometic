# Auth providers security (draft)

- Peers stay outside the adapter bundle.
- OIDC requires PKCE + state; reject redirect URI mismatches.
- Never log access/refresh tokens.
- Client adapters are not an API trust boundary.
