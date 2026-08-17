# Supabase auth provider

`@sometic/auth-supabase` wraps an injected Supabase Auth-like client. `@supabase/supabase-js` is an **optional peer** of the adapter. `@sometic/auth` core has **no** Supabase dependency and no Supabase lock-in.

## When to use

- App already uses Supabase Auth (password and optional OAuth)
- You want Sometic orchestration + HTTP refresh on top of Supabase sessions

## When not to use

- First-party REST without Supabase → [Local](/authentication/local-provider)
- Generic IdP without Supabase → [OIDC](/authentication/oidc)
- Expecting Sometic to replace Supabase RLS (it cannot)

## Installation

<InstallCommands packages="@sometic/auth @sometic/auth-supabase @supabase/supabase-js" />

Peer: `@supabase/supabase-js` ^2 (optional peer metadata; install in the consuming app).

## Usage

::: code-group

```js [JS]
import { createClient } from "@supabase/supabase-js";
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createSupabaseAuthProvider } from "@sometic/auth-supabase";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const auth = createAuth({
    provider: createSupabaseAuthProvider({
        auth: supabase.auth,
    }),
    storage: createSessionStorageAuthStorage(),
    autoRefresh: true,
});

await auth.signIn({ email: "user@example.com", password: "secret" });
```

```ts [TS]
import { createClient } from "@supabase/supabase-js";
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createSupabaseAuthProvider } from "@sometic/auth-supabase";
import type { AuthController } from "@sometic/auth";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const auth: AuthController = createAuth({
    provider: createSupabaseAuthProvider({
        auth: supabase.auth,
    }),
    storage: createSessionStorageAuthStorage(),
    autoRefresh: true,
});

await auth.signIn({ email: "user@example.com", password: "secret" });
```

```js [Vanilla]
import { createClient } from "@supabase/supabase-js";
import { createAuth, createSessionStorageAuthStorage } from "@sometic/auth";
import { createSupabaseAuthProvider } from "@sometic/auth-supabase";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const auth = createAuth({
    provider: createSupabaseAuthProvider({
        auth: supabase.auth,
    }),
    storage: createSessionStorageAuthStorage(),
    autoRefresh: true,
});

await auth.signIn({ email: "user@example.com", password: "secret" });
```

:::

Pass `supabase.auth` (or any `SupabaseAuthLike` mock) into the adapter. Sometic does not construct the Supabase client.

## Options

```ts
type SupabaseAuthProviderOptions = {
    auth: SupabaseAuthLike;
    mapUser?: (user: SupabaseUserLike) => AuthUser;
    redirectUri?: string;
    validateRedirectUri?: (uri: string) => boolean;
};
```

Default map uses `user.id`, `email`, and `user_metadata.displayName` or `full_name`.

## Capabilities

| Capability                     | Supported                                              |
| ------------------------------ | ------------------------------------------------------ |
| signIn / signOut / register    | ✓                                                      |
| getSession / refresh / getUser | ✓                                                      |
| passwordReset                  | ✓                                                      |
| oauth                          | ✓ when `signInWithOAuth` exists on the injected client |
| emailVerification / mfa        | not wrapped                                            |

```ts
if (auth.supports("oauth")) {
    await auth.startOAuth({ provider: "github", redirectUri: "https://app.example.com/callback" });
}
```

## Session mapping

Supabase `access_token` / `refresh_token` / `expires_at` (seconds) map into Sometic `AuthTokens`. `expires_at` values below `1e12` are treated as seconds and converted to ms.

## Patterns

### OAuth

Ensure the injected client exposes `signInWithOAuth`. Capability `oauth` is added only then. `redirectTo` must match `redirectUri` when configured, or be an `http:` / `https:` URL. `javascript:` and other schemes are rejected.

### HTTP API calls

```ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";

const http = createHttp({
    baseUrl: "https://api.example.com",
    interceptors: [createAuthInterceptor({ auth })],
});
```

Supabase RLS still enforces database access. Sometic HTTP refresh only coordinates bearer/session UX for your own APIs.

## Limitations

- OAuth only when `signInWithOAuth` is present
- MFA not wrapped
- Anon key remains a public client key; never ship service role keys in the browser
- Client adapter does not secure APIs; RLS and Edge Functions do

## FAQ

### Does `@sometic/auth` depend on Supabase?

No. Only the optional adapter peers on `@supabase/supabase-js`.

### Why inject `supabase.auth` instead of URL/key?

Keeps the adapter SDK-version flexible and testable with mocks. You control client options (storage, persistSession, etc.).

### Related

- [Firebase](/authentication/firebase)
- [Interceptors](/authentication/interceptors)
- [Capability matrix](/authentication/)
- [Authorization](/authentication/authorization)
