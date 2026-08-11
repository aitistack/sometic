# `@sometic/auth-local`

Configurable REST auth provider adapter for [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth).

`createLocalAuthProvider` talks to your own JSON auth endpoints (sign-in, register, refresh, session, sign-out, password reset) and maps responses into Sometic sessions and tokens. It is the default path when you own the backend and do not want Firebase, Supabase, or a full OIDC stack.

The adapter exists so application code can call `createAuth({ provider })` without embedding fetch URLs and token parsing in UI layers. Endpoint paths are configurable; `mapUser`, `mapTokens`, and `mapSession` hooks cover non-standard payloads. Capabilities advertised include sign-in, register, refresh, session, and password reset.

Standout options: `baseUrl`, per-route `endpoints`, injectable `fetcher`, and tolerant token field names (`accessToken` / `access_token`, `expiresIn` / `expires_in`). Failed credential responses surface as typed `AUTH_CREDENTIALS_INVALID` errors from `@sometic/auth`.

Use with [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth), optionally [`@sometic/http`](https://www.npmjs.com/package/@sometic/http) for API calls after login, and [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) foundations. Product docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [auth providers](https://sometic.aitistack.com/packages/auth-providers/).

## Install

```bash
pnpm add @sometic/auth-local @sometic/auth
```

```bash
npm install @sometic/auth-local @sometic/auth
```

```bash
yarn add @sometic/auth-local @sometic/auth
```

## Usage

Configure the REST provider and create auth:

```ts
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";

const provider = createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    endpoints: {
        signIn: "/auth/sign-in",
        refresh: "/auth/refresh",
        session: "/auth/session",
    },
});

const auth = createAuth({
    provider,
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
await auth.signIn({ email: "user@example.com", password: "secret12" });
```

Customize user mapping when your API shape differs:

```ts
import { createLocalAuthProvider } from "@sometic/auth-local";

const provider = createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    mapUser: (payload) => {
        const data = payload as { account: { id: string; mail: string } };
        return { id: data.account.id, email: data.account.mail };
    },
});
```

## Peers / when not to use

Depends on `@sometic/auth` and `@sometic/core`. No framework peers.

Prefer [`@sometic/auth-oidc`](https://www.npmjs.com/package/@sometic/auth-oidc) for Authorization Code + PKCE against an IdP, or Firebase/Supabase adapters when those platforms own identity. Do not use this package as a generic HTTP client; use [`@sometic/http`](https://www.npmjs.com/package/@sometic/http) for app APIs.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Auth providers](https://sometic.aitistack.com/packages/auth-providers/)
- [Auth package](https://sometic.aitistack.com/packages/auth/)
- [Authentication](https://sometic.aitistack.com/authentication/)

## License

MIT
