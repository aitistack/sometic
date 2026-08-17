# OIDC auth provider

`@sometic/auth-oidc` implements OAuth 2.0 Authorization Code + PKCE for SPA clients. It uses `fetch` and Web Crypto. No Auth0/Keycloak SDK is required. `@sometic/auth` core stays free of OIDC lock-in; this adapter is optional.

## When to use

- Auth0, Keycloak, Cognito (OIDC), Okta, or any standards-based IdP
- Browser SPAs that must not use resource-owner password grant

## When not to use

- Email/password against your own API → [Local](/authentication/local-provider)
- You already live inside Firebase / Supabase Auth SDKs → those adapters
- Confidential server-side code flow (this adapter is SPA PKCE)

## Installation

<InstallCommands packages="@sometic/auth @sometic/auth-oidc" />

No optional peer SDK.

## Usage

::: code-group

```js [JS]
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createOidcAuthProvider } from "@sometic/auth-oidc";

const provider = createOidcAuthProvider({
    clientId: "my-spa",
    redirectUri: "https://app.example.com/oauth/callback",
    issuer: "https://id.example.com/realms/app",
    scopes: ["openid", "profile", "email", "offline_access"],
});

const auth = createAuth({
    provider,
    storage: createSessionStorageAuthStorage(),
});

const { authorizationUrl } = await auth.startOAuth({
    provider: "oidc",
    redirectUri: "https://app.example.com/oauth/callback",
});
location.assign(authorizationUrl);

await auth.completeOAuth({
    provider: "oidc",
    redirectUri: "https://app.example.com/oauth/callback",
    code: new URLSearchParams(location.search).get("code") ?? "",
    state: new URLSearchParams(location.search).get("state") ?? "",
});
```

```ts [TS]
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createOidcAuthProvider } from "@sometic/auth-oidc";
import type { AuthController } from "@sometic/auth";

const provider = createOidcAuthProvider({
    clientId: "my-spa",
    redirectUri: "https://app.example.com/oauth/callback",
    issuer: "https://id.example.com/realms/app",
    scopes: ["openid", "profile", "email", "offline_access"] as const,
});

const auth: AuthController = createAuth({
    provider,
    storage: createSessionStorageAuthStorage(),
});

const { authorizationUrl } = await auth.startOAuth({
    provider: "oidc",
    redirectUri: "https://app.example.com/oauth/callback",
});
location.assign(authorizationUrl);

await auth.completeOAuth({
    provider: "oidc",
    redirectUri: "https://app.example.com/oauth/callback",
    code: new URLSearchParams(location.search).get("code") ?? "",
    state: new URLSearchParams(location.search).get("state") ?? "",
});
```

```js [Vanilla]
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createOidcAuthProvider } from "@sometic/auth-oidc";

const provider = createOidcAuthProvider({
    clientId: "my-spa",
    redirectUri: "https://app.example.com/oauth/callback",
    issuer: "https://id.example.com/realms/app",
    scopes: ["openid", "profile", "email", "offline_access"],
});

const auth = createAuth({
    provider,
    storage: createSessionStorageAuthStorage(),
});

const { authorizationUrl } = await auth.startOAuth({
    provider: "oidc",
    redirectUri: "https://app.example.com/oauth/callback",
});
location.assign(authorizationUrl);

await auth.completeOAuth({
    provider: "oidc",
    redirectUri: "https://app.example.com/oauth/callback",
    code: new URLSearchParams(location.search).get("code") ?? "",
    state: new URLSearchParams(location.search).get("state") ?? "",
});
```

:::

## Options

```ts
type OidcAuthProviderOptions = {
    clientId: string;
    redirectUri: string;
    issuer?: string;
    endpoints?: Partial<{
        authorizationEndpoint: string;
        tokenEndpoint: string;
        userInfoEndpoint?: string;
        endSessionEndpoint?: string;
    }>;
    scopes?: readonly string[];
    fetcher?: typeof fetch;
    store?: OidcPkceStore;
    validateRedirectUri?: (uri: string) => boolean;
    signal?: AbortSignal;
    timeoutMs?: number;
};
```

Provide either `issuer` (discovery at `/.well-known/openid-configuration`) or explicit `authorizationEndpoint` + `tokenEndpoint`.

Default scopes: `openid profile email`.

## PKCE store

When `sessionStorage` exists, the default store persists verifier and state there so a full-page IdP redirect can complete. Inject `store` to override. Memory-only stores lose the verifier across navigations (fine for tests).

## Capabilities

| Capability                                 | Supported |
| ------------------------------------------ | --------- |
| oauth                                      | ✓         |
| signOut / getSession / refresh / getUser   | ✓         |
| password signIn / register / passwordReset | no        |
| mfa                                        | no        |

Password grant is intentionally unsupported for SPAs.

## Redirect validation

Default `validateRedirectUri` requires an **exact** match with the configured `redirectUri` (full URI string). Query strings, fragments, and `javascript:` URLs do not match. Override only when you understand open-redirect risks.

The browser adapter does **not** verify `id_token` signatures or nonce. Treat ID tokens as opaque until your backend (or a dedicated verifier) checks them.

## Patterns

### Explicit endpoints (no discovery)

```ts
createOidcAuthProvider({
    clientId: "my-spa",
    redirectUri: "https://app.example.com/callback",
    endpoints: {
        authorizationEndpoint: "https://id.example.com/authorize",
        tokenEndpoint: "https://id.example.com/oauth/token",
        userInfoEndpoint: "https://id.example.com/userinfo",
        endSessionEndpoint: "https://id.example.com/logout",
    },
});
```

### HTTP APIs after login

```ts
import { createAuthInterceptor } from "@sometic/http/auth";
import { createHttp } from "@sometic/http";

const http = createHttp({
    interceptors: [createAuthInterceptor({ auth })],
});
```

## Limitations

- SPA PKCE only; no resource-owner password
- Discovery optional but required if endpoints omitted
- MFA not wrapped
- Client adapter does not secure APIs; configure IdP and resource servers correctly

## FAQ

### Why no Auth0 SDK?

Keeps the adapter standards-based and peer-free. You can still use Auth0 as the IdP via OIDC discovery.

### Callback loses login state

The default store uses `sessionStorage` when it exists. If you passed a memory `store`, the verifier is gone after a full-page redirect.

### Related

- [Local provider](/authentication/local-provider)
- [Token refresh](/authentication/token-refresh)
- [Troubleshooting](/authentication/troubleshooting)
- [Capability matrix](/authentication/)
