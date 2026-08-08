# Auth installation

Install the provider-independent core first. Add exactly one production provider package for your backend. Provider SDKs (Firebase, Supabase) are optional peers on those adapters, not dependencies of `@sometic/auth`.

## Core

::: code-group

```bash [npm]
npm install @sometic/auth
```

```bash [pnpm]
pnpm add @sometic/auth
```

```bash [yarn]
yarn add @sometic/auth
```

```bash [bun]
bun add @sometic/auth
```

:::

`@sometic/auth` depends on `@sometic/core` only. No Firebase, Supabase, or OIDC SDK is pulled transitively.

## Choose a provider

| Backend                                        | Package                           | Extra peer (optional)            |
| ---------------------------------------------- | --------------------------------- | -------------------------------- |
| Own JSON REST API                              | `@sometic/auth-local`             | none                             |
| Firebase Auth                                  | `@sometic/auth-firebase`          | `firebase` ^10 \|\| ^11 \|\| ^12 |
| Supabase Auth                                  | `@sometic/auth-supabase`          | `@supabase/supabase-js` ^2       |
| Generic IdP (Auth0, Keycloak, Cognito OIDC, …) | `@sometic/auth-oidc`              | none (uses `fetch` + PKCE)       |
| Unit / integration tests                       | built-in `createTestAuthProvider` | none                             |

::: code-group

```bash [local]
pnpm add @sometic/auth-local
```

```bash [firebase]
pnpm add @sometic/auth-firebase firebase
```

```bash [supabase]
pnpm add @sometic/auth-supabase @supabase/supabase-js
```

```bash [oidc]
pnpm add @sometic/auth-oidc
```

:::

Firebase and Supabase peers are marked optional so the adapter packages can install without forcing every monorepo consumer to take the SDK. Your app must still install the peer when you use that adapter at runtime.

## HTTP refresh (optional)

For Bearer attachment and 401 refresh/replay:

::: code-group

```bash [npm]
npm install @sometic/http
```

```bash [pnpm]
pnpm add @sometic/http
```

```bash [yarn]
yarn add @sometic/http
```

```bash [bun]
bun add @sometic/http
```

:::

`@sometic/auth` is an optional peer of `@sometic/http`. Import `@sometic/http/auth` only when you wire `createAuthInterceptor`. See [Interceptors](/authentication/interceptors) and [HTTP](/utilities/http).

## Framework adapters

Wave A surfaces:

```bash
pnpm add @sometic/react   # /auth subpath
pnpm add @sometic/vue     # /auth subpath
pnpm add @sometic/elements
```

## Verify imports

```ts
import { createAuth, createTestAuthProvider } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";
import { createAuthInterceptor } from "@sometic/http/auth";
```

Tree-shake by importing only the subpaths you need (`/storage`, `/authorization`, `/test-provider`).

## FAQ

### Do I need cloud keys for local development?

No. Use `createTestAuthProvider` or mock Local / Firebase / Supabase / OIDC responses.

### Can I install all providers?

Yes, but you only need one production provider per app. Installing unused adapters does not activate SDKs unless you import them and install their peers.

### Why is `firebase` not a dependency of `@sometic/auth`?

Core must stay provider-independent. Locking Firebase into core would force every consumer to pay for a vendor they may never use.

### Related

- [Configuration](/authentication/configuration)
- [Local provider](/authentication/local-provider)
- [Firebase](/authentication/firebase)
- [Supabase](/authentication/supabase)
- [OIDC](/authentication/oidc)
