# Authentication

`@sometic/auth` is provider-independent session orchestration: sign-in and sign-out, hydrate, refresh coordination, storage adapters, capability-gated flows, and UX-only authorization helpers. It does **not** embed Firebase, Supabase, or OIDC SDKs.

::: tip System standout: session epoch
Every `AuthSession` carries an additive `epoch` number. Sign-in, sign-out, and user-id change bump it. Wire [`createAppShell`](/guide/app-shell) (or `bindQueryToAuth` / `bindAuthToHttp`) so privileged query cache and cross-epoch HTTP replays cannot survive a user switch. Use `auth.getEpoch()`, `requestStepUp` / `completeStepUp` for MFA/reauth UX.
:::

<CopyPrompt surface="auth" />

Production backends plug in through optional packages: `@sometic/auth-local`, `@sometic/auth-firebase`, `@sometic/auth-supabase`, `@sometic/auth-oidc`. Provider SDKs are optional peers on those adapters. Core never locks you into a cloud vendor.

## Overview

| Concern               | Package / subpath                              |
| --------------------- | ---------------------------------------------- |
| Orchestration         | `@sometic/auth` → `createAuth`                 |
| Provider contract     | `@sometic/auth/provider`                       |
| Session helpers       | `@sometic/auth/session`                        |
| Storage               | `@sometic/auth/storage`                        |
| Refresh single-flight | `@sometic/auth/refresh`                        |
| UX policies           | `@sometic/auth/authorization`                  |
| Deterministic tests   | `@sometic/auth/test-provider`                  |
| HTTP 401 seam         | `@sometic/http/auth` → `createAuthInterceptor` |

### When to use

- One auth behavior model across Vanilla, React, Vue, and Elements
- Swappable providers without rewriting UI session code
- Coordinated refresh and multi-tab logout without reinventing race handling

### When not to use

- Full-stack Auth.js / NextAuth as your only stack (different product shape)
- Expecting client `can()` to secure APIs (it cannot)
- Shipping login form UI from this package (auth is headless)

## Capability matrix

Providers declare a `Set<AuthCapability>`. Unsupported flows throw `AUTH_UNSUPPORTED`.

| Capability        | test | local | firebase | supabase | oidc |
| ----------------- | ---- | ----- | -------- | -------- | ---- |
| signIn            | ✓    | ✓     | ✓        | ✓        |      |
| signOut           | ✓    | ✓     | ✓        | ✓        | ✓    |
| register          | ✓    | ✓     | ✓        | ✓        |      |
| getSession        | ✓    | ✓     | ✓        | ✓        | ✓    |
| refresh           | ✓    | ✓     | ✓        | ✓        | ✓    |
| getUser           | ✓    | ✓     | ✓        | ✓        | ✓    |
| passwordReset     | ✓    | ✓     | ✓        | ✓        |      |
| emailVerification | ✓    |       | ✓        |          |      |
| oauth             |      |       |          | ✓\*      | ✓    |
| mfa               |      |       |          |          |      |

\* Supabase OAuth when `signInWithOAuth` is present on the injected client.

## Quick start

::: code-group

```js [JS]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
await auth.signIn({ email: "demo@example.com", password: "password" });
auth.isAuthenticated();
auth.dispose();
```

```ts [TS]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import type { AuthController } from "@sometic/auth";

const auth: AuthController = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
await auth.signIn({ email: "demo@example.com", password: "password" });
auth.isAuthenticated(); // true
auth.dispose();
```

```js [Vanilla]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
await auth.signIn({ email: "demo@example.com", password: "password" });
auth.isAuthenticated();
auth.dispose();
```


```js [CDN]
import { createAuth } from "https://cdn.jsdelivr.net/npm/@sometic/auth@latest/dist/cdn/sometic-auth.esm.js";

const auth = createAuth({ provider });
await auth.signIn({ email: "a@b.c", password: "…" });
```
:::

Swap the provider for production:

```ts
import { createLocalAuthProvider } from "@sometic/auth-local";

const auth = createAuth({
    provider: createLocalAuthProvider({ baseUrl: "https://api.example.com" }),
});
```

## Security boundary

Browser auth state is **untrusted**. Attackers who can run script can read non-httpOnly tokens, ignore `can()`, and trigger refresh. Mitigations live on the server: httpOnly cookies where possible, short-lived access tokens, CSRF, refresh rotation, and server authorization.

See [Authorization](/authentication/authorization) and [Troubleshooting](/authentication/troubleshooting).

## Docs in this section

| Page                                                     | Topic                                    |
| -------------------------------------------------------- | ---------------------------------------- |
| [Installation](/authentication/installation)             | Core + optional provider peers           |
| [Configuration](/authentication/configuration)           | `createAuth` options, storage, cross-tab |
| [Local provider](/authentication/local-provider)         | REST JSON backend                        |
| [Firebase](/authentication/firebase)                     | Injected Firebase Auth adapter           |
| [Supabase](/authentication/supabase)                     | Injected Supabase Auth adapter           |
| [OIDC](/authentication/oidc)                             | Authorization Code + PKCE                |
| [Session management](/authentication/session-management) | Status, hydrate, events                  |
| [Token refresh](/authentication/token-refresh)           | Single-flight, auto-refresh              |
| [Interceptors](/authentication/interceptors)             | HTTP auth refresh queue                  |
| [Authorization](/authentication/authorization)           | UX-only `can` / policies                 |
| [Troubleshooting](/authentication/troubleshooting)       | Common failure modes                     |

## Framework adapters

| Surface  | Package                                                                   |
| -------- | ------------------------------------------------------------------------- |
| React    | `@sometic/react/auth` (`AuthProvider`, `useAuth`, `useSession`, `useCan`) |
| Vue      | `@sometic/vue/auth`                                                       |
| Elements | `@sometic/elements/auth` (`sometic-auth-status`)                          |

## FAQ

### Why are Firebase / Supabase / OIDC not in `@sometic/auth`?

Auth core stays provider-agnostic. SDKs live in optional `@sometic/auth-*` packages so apps only install what they use.

### Is client authorization secure?

No. `can()`, `authorize()`, and route guards only affect UX. APIs must enforce authorization on the server.

### How does this compare to using a provider SDK alone?

Provider SDKs alone couple UI to one vendor and leave refresh races, multi-tab logout, and capability gates to you. Sometic owns orchestration; adapters wrap SDKs you already inject.

### Where do tokens live?

Wherever the storage adapter writes them. Memory is SSR-safe and lost on reload. `sessionStorage` is tab-scoped. `localStorage` is durable and highest XSS exposure for bearer tokens. Prefer httpOnly cookies when your backend supports them.

### What is session epoch?

`AuthSession.epoch` increments on sign-in, sign-out, and user-id change (not on token refresh). `auth.getEpoch()` reads it. [`createAppShell`](/guide/app-shell) clears query cache and refuses stale HTTP replays when the epoch bumps.

### Related

- [App Shell](/guide/app-shell)
- [HTTP client](/utilities/http)
- [Auth service hub](/services/auth)
- [Stores](/stores/)
