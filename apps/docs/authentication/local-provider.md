# Local auth provider

`@sometic/auth-local` adapts a JSON REST backend to the Sometic `AuthProvider` contract. No Firebase or Supabase SDK. You own the HTTP shapes; optional mappers normalize responses.

## When to use

- First-party API with email/password (and optional register / refresh / reset)
- Full control over token format and session endpoints
- Apps that must avoid cloud auth SDKs

## When not to use

- You already standardize on Firebase / Supabase / OIDC IdP (use those adapters)
- You need browser OAuth against a third-party IdP (use [OIDC](/authentication/oidc) or Supabase OAuth)

## Installation

<InstallCommands packages="@sometic/auth @sometic/auth-local" />

No optional peer SDK.

## Usage

::: code-group

```js [JS]
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";

const provider = createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    endpoints: {
        signIn: "/auth/sign-in",
        register: "/auth/register",
        refresh: "/auth/refresh",
        signOut: "/auth/sign-out",
        session: "/auth/session",
        passwordReset: "/auth/password-reset",
    },
});

const auth = createAuth({
    provider,
    storage: createSessionStorageAuthStorage(),
    autoRefresh: true,
});

await auth.signIn({ email: "user@example.com", password: "secret" });
```

```ts [TS]
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";
import type { AuthController } from "@sometic/auth";

const provider = createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    endpoints: {
        signIn: "/auth/sign-in",
        register: "/auth/register",
        refresh: "/auth/refresh",
        signOut: "/auth/sign-out",
        session: "/auth/session",
        passwordReset: "/auth/password-reset",
    },
});

const auth: AuthController = createAuth({
    provider,
    storage: createSessionStorageAuthStorage(),
    autoRefresh: true,
});

await auth.signIn({ email: "user@example.com", password: "secret" });
```

```js [Vanilla]
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";

const provider = createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    endpoints: {
        signIn: "/auth/sign-in",
        register: "/auth/register",
        refresh: "/auth/refresh",
        signOut: "/auth/sign-out",
        session: "/auth/session",
        passwordReset: "/auth/password-reset",
    },
});

const auth = createAuth({
    provider,
    storage: createSessionStorageAuthStorage(),
    autoRefresh: true,
});

await auth.signIn({ email: "user@example.com", password: "secret" });
```

:::

## Options

```ts
type LocalAuthProviderOptions = {
    baseUrl: string;
    endpoints?: {
        signIn?: string;
        register?: string;
        refresh?: string;
        signOut?: string;
        session?: string;
        passwordReset?: string;
    };
    fetcher?: typeof fetch;
    mapUser?: (payload: unknown) => AuthUser;
    mapTokens?: (payload: unknown) => AuthTokens | null;
    mapSession?: (payload: unknown) => AuthSession;
    allowAbsoluteEndpoints?: boolean;
    signal?: AbortSignal;
    timeoutMs?: number;
};
```

Defaults under `baseUrl`:

| Key           | Default path           |
| ------------- | ---------------------- |
| signIn        | `/auth/sign-in`        |
| register      | `/auth/register`       |
| refresh       | `/auth/refresh`        |
| signOut       | `/auth/sign-out`       |
| session       | `/auth/session`        |
| passwordReset | `/auth/password-reset` |

## Expected JSON (defaults)

Default mappers accept either nested or flat shapes:

```json
{
    "user": { "id": "u1", "email": "a@b.c", "roles": ["admin"] },
    "tokens": {
        "accessToken": "…",
        "refreshToken": "…",
        "expiresIn": 3600,
        "tokenType": "Bearer"
    }
}
```

Also accepted: `access_token`, `refresh_token`, `expires_in`, `token_type`, and `user.sub` as id. Missing user id throws `AUTH_INVALID_SESSION`.

## Capabilities

| Capability                      | Supported                                        |
| ------------------------------- | ------------------------------------------------ |
| signIn / signOut / register     | ✓                                                |
| getSession / refresh / getUser  | ✓                                                |
| passwordReset                   | ✓                                                |
| emailVerification / oauth / mfa | no (extend your API + custom provider if needed) |

## Patterns

### Custom mapper

```ts
createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    mapUser: (payload) => {
        const row = payload as { account: { uuid: string; mail: string } };
        return { id: row.account.uuid, email: row.account.mail };
    },
});
```

### Inject fetcher (tests / cookies)

```ts
createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    fetcher: (input, init) => fetch(input, { ...init, credentials: "include" }),
});
```

## Limitations

- Assumes JSON REST; GraphQL needs a custom provider or mapper that posts GraphQL.
- No OAuth/MFA unless you extend endpoints and wrap a custom `AuthProvider`.
- Client adapter does not secure APIs; your backend enforces authz.

## FAQ

### Can I point endpoints at absolute URLs?

Only with `allowAbsoluteEndpoints: true`. Relative paths under `baseUrl` are the default. Absolute `endpoints.*` values are rejected otherwise.

### How do I test without a server?

Prefer `createTestAuthProvider` for unit tests. For contract tests, inject a `createMockFetcher` from `@sometic/http` or a stub `fetcher`.

### Related

- [Configuration](/authentication/configuration)
- [Capability matrix](/authentication/)
- [Firebase](/authentication/firebase)
- [OIDC](/authentication/oidc)
