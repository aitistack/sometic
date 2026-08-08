# OIDC (PKCE)

`createOidcAuthProvider({ clientId, redirectUri, issuer? | endpoints, fetcher?, store? })`.

Authorization Code + S256 PKCE with Web Crypto. No mandatory OIDC SDK. State + code_verifier required; redirect URI origin/path validated.
