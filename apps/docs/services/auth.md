# Auth service

`@sometic/auth` exposes `createAuth`: provider-independent session orchestration for sign-in / out, hydrate, refresh, storage, capability-gated flows, and UX-only authorization.

This page is the services-hub summary. Full guides live under [Authentication](/authentication/).

## Overview

| Concern                         | Ownership                                          |
| ------------------------------- | -------------------------------------------------- |
| Session lifecycle               | `@sometic/auth` via `createAuth`                   |
| Provider SDKs                   | Optional `@sometic/auth-*` packages                |
| Token attachment / 401 recovery | `@sometic/http/auth` + `auth.handleUnauthorized()` |
| UI gates                        | `can()` / policies (UX only)                       |

### When to use

- You need one auth controller API across local REST, Firebase, Supabase, OIDC, or tests
- You want single-flight refresh coordinated with HTTP interceptors
- You need disposable, SSR-aware session hydrate without embedding a provider SDK in app core

### When not to use

- Provider SDK alone is enough and you do not want Sometic session orchestration
- Server authorization: never rely on client `can()`
- Storing secrets in thrown errors or logs

## Installation

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

Add one provider package as needed: `@sometic/auth-local`, `@sometic/auth-firebase` (+ optional peer `firebase`), `@sometic/auth-supabase` (+ optional peer `@supabase/supabase-js`), or `@sometic/auth-oidc`.

## Usage

```ts
import {
    createAuth,
    createMemoryAuthStorage,
    createTestAuthProvider,
    requireAuthenticated,
} from "@sometic/auth";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
await auth.signIn({ email: "demo@example.com", password: "password" });
auth.can(requireAuthenticated()); // UX only
auth.dispose();
```

### HTTP seam

```ts
import { createAuthInterceptor } from "@sometic/http/auth";

const interceptor = createAuthInterceptor({ auth });
```

`handleUnauthorized()` is the 401 recovery entry used by the HTTP auth interceptor. Auth owns refresh; HTTP must not import provider SDKs.

## Key APIs / subpaths

| Import                        | Contents                          |
| ----------------------------- | --------------------------------- |
| `@sometic/auth`               | `createAuth`, buses, errors       |
| `@sometic/auth/provider`      | Provider types + capabilities     |
| `@sometic/auth/session`       | Session helpers                   |
| `@sometic/auth/storage`       | Memory / session / local / custom |
| `@sometic/auth/refresh`       | Single-flight coordinator         |
| `@sometic/auth/authorization` | `can` / policies                  |
| `@sometic/auth/flows`         | Capability-gated runners          |
| `@sometic/auth/test-provider` | Deterministic test provider       |

Typical controller surface after `createAuth`: `whenReady`, `signIn`, `signOut`, `getSession`, `getUser`, `refresh`, `can`, `handleUnauthorized`, `dispose`, plus capability-gated flows when the provider supports them.

## How it works

Providers implement a capability-declared adapter. `createAuth` hydrates from storage, exposes a session snapshot, and coordinates refresh so concurrent 401s share one flight. Framework UI binds to session state; cores stay free of React / Vue and free of Firebase / Supabase SDKs.

## Security

Client authorization helpers are **UX only**. Prefer httpOnly cookies when possible. Document storage XSS tradeoffs. Never put tokens on thrown errors. Call `dispose()` to clear refresh flights and tab listeners.

## Edge cases

| Edge                          | Behavior                                              |
| ----------------------------- | ----------------------------------------------------- |
| Provider missing a capability | Capability-gated flows fail closed / unavailable      |
| Overlapping 401s              | Single refresh flight; requests wait then replay once |
| SSR                           | Inject storage / avoid browser storage at import time |
| Dispose mid-refresh           | In-flight work should not outlive `dispose()`         |

## FAQ

### Why no Firebase in core?

Auth core stays provider-independent; optional `@sometic/auth-*` adapters hold provider SDKs as peers.

### Is `can()` secure?

No. Servers enforce access. Use `can()` to hide or disable UI only.

### Which provider should I start with?

`createTestAuthProvider` for tests; `@sometic/auth-local` for first-party REST; Firebase / Supabase / OIDC when those backends are already chosen.

### How does HTTP refresh connect?

Wire `createAuthInterceptor` from `@sometic/http/auth`. See [Token refresh](/authentication/token-refresh) and [Interceptors](/authentication/interceptors).

### Where is the capability matrix?

[Services hub](/services/) and the Authentication provider pages.

## Related

- [Authentication hub](/authentication/)
- [Configuration](/authentication/configuration)
- [Authorization](/authentication/authorization)
- [Session management](/authentication/session-management)
- [Token refresh](/authentication/token-refresh)
- [HTTP service](/services/http)
- [Services index](/services/)
- [Package index](/api/packages)
