# `@sometic/auth-supabase`

Supabase Auth provider adapter for [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth).

`createSupabaseAuthProvider` accepts a Supabase Auth-like client (`signInWithPassword`, `signUp`, `getSession`, `refreshSession`, `resetPasswordForEmail`, optional `signInWithOAuth`) and maps Supabase sessions into Sometic `AuthSession` / `AuthTokens`. Supabase stays outside the published bundle as a peer-style integration via the `auth` option.

It exists so Supabase apps can reuse Sometic refresh coordination, HTTP auth interceptors, authorization policies, and app-shell session epoch clears without rewriting identity flows. Password auth is always advertised; OAuth capability is added when `signInWithOAuth` is present.

Standout helpers include default `mapUser` (id, email, displayName from metadata) and token expiry normalization for `expires_at` / `expires_in`. Errors map to stable `@sometic/auth` codes such as `AUTH_CREDENTIALS_INVALID` and `AUTH_REFRESH_FAILED`.

Related packages: [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth), [`@sometic/http`](https://www.npmjs.com/package/@sometic/http), [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Docs: [introduction](https://sometic.dev/guide/introduction) and [auth providers](https://sometic.dev/packages/auth-providers/).

## Install

```bash
pnpm add @sometic/auth-supabase @sometic/auth @supabase/supabase-js
```

```bash
npm install @sometic/auth-supabase @sometic/auth @supabase/supabase-js
```

```bash
yarn add @sometic/auth-supabase @sometic/auth @supabase/supabase-js
```

## Usage

Pass `supabase.auth` into the provider:

```ts
import { createClient } from "@supabase/supabase-js";
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createSupabaseAuthProvider } from "@sometic/auth-supabase";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const auth = createAuth({
    provider: createSupabaseAuthProvider({ auth: supabase.auth }),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
await auth.signIn({ email: "user@example.com", password: "secret12" });
```

Start OAuth when enabled on the client:

```ts
const { authorizationUrl } = await auth.startOAuth({
    provider: "github",
    redirectUri: "https://app.example.com/auth/callback",
});
window.location.assign(authorizationUrl);
```

## Peers / when not to use

Depends on `@sometic/auth`. You supply a Supabase Auth client (typically `@supabase/supabase-js`).

Skip this adapter if you are not on Supabase. Prefer [`@sometic/auth-local`](https://www.npmjs.com/package/@sometic/auth-local), [`@sometic/auth-firebase`](https://www.npmjs.com/package/@sometic/auth-firebase), or [`@sometic/auth-oidc`](https://www.npmjs.com/package/@sometic/auth-oidc) for those stacks. Complete OAuth callback handling may still require Supabase client APIs depending on your flow.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [Auth providers](https://sometic.dev/packages/auth-providers/)
- [Auth package](https://sometic.dev/packages/auth/)
- [Authentication](https://sometic.dev/authentication/)

## License

MIT
