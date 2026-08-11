# `@sometic/auth-oidc`

OIDC Authorization Code + PKCE provider for [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth).

`createOidcAuthProvider` implements browser-friendly OpenID Connect: discovery or explicit endpoints, PKCE challenge storage, `startOAuth` / `completeOAuth`, token refresh, and optional userinfo mapping. No proprietary IdP SDK is required; it uses `fetch` and Web Crypto.

Use this when your identity provider speaks OIDC (Auth0, Keycloak, Cognito hosted UI, Okta, etc.) and you want Sometic session orchestration without embedding vendor clients. Redirect URI validation is enabled by default; PKCE verifiers can use the built-in memory store or a custom `OidcPkceStore`.

Standout options: `clientId`, `redirectUri`, `issuer` discovery, explicit `endpoints`, injectable `fetcher` / `store`, and `scopes` (default `openid profile email`). Capabilities focus on OAuth, refresh, session, and sign-out rather than password sign-in.

Works with [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth), [`@sometic/http`](https://www.npmjs.com/package/@sometic/http) for API calls after login, and [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [auth providers](https://sometic.aitistack.com/packages/auth-providers/).

## Install

```bash
pnpm add @sometic/auth-oidc @sometic/auth
```

```bash
npm install @sometic/auth-oidc @sometic/auth
```

```bash
yarn add @sometic/auth-oidc @sometic/auth
```

## Usage

Configure OIDC and start the authorize redirect:

```ts
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createOidcAuthProvider } from "@sometic/auth-oidc";

const provider = createOidcAuthProvider({
    clientId: "my-spa",
    redirectUri: "https://app.example.com/oauth/callback",
    issuer: "https://auth.example.com",
    scopes: ["openid", "profile", "email"],
});

const auth = createAuth({
    provider,
    storage: createMemoryAuthStorage(),
});

const { authorizationUrl, state } = await auth.startOAuth({
    provider: "oidc",
    redirectUri: "https://app.example.com/oauth/callback",
});
window.location.assign(authorizationUrl);
```

Complete the callback with the authorization code:

```ts
await auth.completeOAuth({
    provider: "oidc",
    code: new URLSearchParams(location.search).get("code") ?? "",
    state: new URLSearchParams(location.search).get("state") ?? "",
    redirectUri: "https://app.example.com/oauth/callback",
});
```

## Peers / when not to use

Depends on `@sometic/auth` and `@sometic/core`. Requires Web Crypto (`crypto.subtle`) for PKCE.

Prefer [`@sometic/auth-local`](https://www.npmjs.com/package/@sometic/auth-local) for first-party password APIs, or platform adapters for Firebase/Supabase. Do not use this package for resource-owner password grants; it is Authorization Code + PKCE oriented.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Auth providers](https://sometic.aitistack.com/packages/auth-providers/)
- [Auth package](https://sometic.aitistack.com/packages/auth/)
- [Authentication](https://sometic.aitistack.com/authentication/)

## License

MIT
