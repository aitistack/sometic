# @sometic/auth-oidc

OIDC Authorization Code + PKCE (`fetch` + Web Crypto). No OIDC SDK peer.

```ts
import { createOidcAuthProvider } from "@sometic/auth-oidc";

const provider = createOidcAuthProvider({
    clientId: "spa",
    redirectUri: "https://app.example.com/callback",
    issuer: "https://idp.example.com",
});
```

Docs: [OIDC adapter](https://sometic.aitistack.com/authentication/oidc)
