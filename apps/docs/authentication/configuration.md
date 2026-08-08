# Auth configuration

`createAuth` wires a capability-aware `AuthProvider`, optional storage, refresh behavior, and cross-tab messaging into a single `AuthController`.

## Signature

```ts
function createAuth(options: CreateAuthOptions): AuthController;

type CreateAuthOptions = {
    provider: AuthProvider;
    storage?: AuthStorage;
    skewMs?: number;
    crossTab?: AuthCrossTabBus | false;
    now?: () => number;
    autoRefresh?: boolean;
    refreshIntervalMs?: number;
    environment?: AuthEnvironment | false;
};
```

## Minimal setup

::: code-group

```js [JS]
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";

const auth = createAuth({
    provider: createLocalAuthProvider({ baseUrl: "https://api.example.com" }),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
```

```ts [TS]
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";
import type { AuthController } from "@sometic/auth";

const auth: AuthController = createAuth({
    provider: createLocalAuthProvider({ baseUrl: "https://api.example.com" }),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
```

```js [Vanilla]
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";

const auth = createAuth({
    provider: createLocalAuthProvider({ baseUrl: "https://api.example.com" }),
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
```

:::

Default storage is memory when omitted. Default skew accounts for clock drift near expiry. Cross-tab bus defaults to a BroadcastChannel-backed bus when available; pass `false` to disable.

## Options reference

| Option              | Default                  | Purpose                                     |
| ------------------- | ------------------------ | ------------------------------------------- |
| `provider`          | required                 | Capability-aware auth backend               |
| `storage`           | memory                   | Persist / restore session snapshots         |
| `skewMs`            | implementation default   | Treat session expired slightly early        |
| `crossTab`          | broadcast when available | Multi-tab logout / session messages         |
| `now`               | `Date.now`               | Injectable clock for tests                  |
| `autoRefresh`       | off unless `true`        | Proactive refresh near expiry               |
| `refreshIntervalMs` | implementation default   | Polling interval when auto-refresh on       |
| `environment`       | `globalThis`-like        | Visibility / online hooks; `false` disables |

## Storage adapters

| Factory                                         | Lifetime              | XSS note                                     |
| ----------------------------------------------- | --------------------- | -------------------------------------------- |
| `createMemoryAuthStorage()`                     | Process / tab JS heap | Safest for bearer tokens; lost on reload     |
| `createSessionStorageAuthStorage()`             | Tab `sessionStorage`  | Survives reload in-tab; script can read      |
| `createLocalStorageAuthStorage()`               | Origin `localStorage` | Durable; highest XSS exposure for tokens     |
| `createCustomAuthStorage({ get, set, remove })` | Your choice           | Prefer httpOnly cookie bridges on the server |

```ts
import { createAuth, createSessionStorageAuthStorage, createBroadcastAuthBus } from "@sometic/auth";

const auth = createAuth({
    provider,
    storage: createSessionStorageAuthStorage({ key: "sometic.auth.session" }),
    crossTab: createBroadcastAuthBus("sometic-auth"),
    autoRefresh: true,
});
```

Prefer httpOnly cookies when your API supports them. Client storage adapters then hold UX session metadata, not long-lived refresh secrets, when your architecture allows.

## Cross-tab

| Factory                                | Behavior                                                               |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `createBroadcastAuthBus(channelName?)` | BroadcastChannel messages `{ type: "logout" }` / `{ type: "session" }` |
| `createNoopAuthBus()`                  | No peer traffic                                                        |
| `false`                                | Disable cross-tab entirely                                             |

Sign-out posts logout so peer tabs clear session without starting a refresh storm. Do not invent a second BroadcastChannel for the same app identity.

## Environment hooks

Pass a custom `environment` in tests or SSR shells. Pass `false` to skip visibility and online listeners (useful for Node unit tests).

```ts
const auth = createAuth({
    provider: createTestAuthProvider(),
    environment: false,
    now: () => frozenClock,
});
```

## Controller surface (summary)

| Method                                                  | Role                             |
| ------------------------------------------------------- | -------------------------------- |
| `whenReady` / `ready` / `isReady`                       | Hydration settled                |
| `getSession` / `getUser` / tokens                       | Snapshot accessors               |
| `subscribe` / `on`                                      | Session and named events         |
| `supports(capability)`                                  | Capability probe                 |
| `signIn` / `signOut` / `register`                       | Core flows                       |
| `refresh` / `ensureFreshSession` / `handleUnauthorized` | Token freshness                  |
| `hydrate`                                               | Inject a known session           |
| OAuth / MFA / password / verify / revoke                | Capability-gated                 |
| `can` / `cannot` / `authorize` / `assertAuthorized`     | UX policies                      |
| `dispose`                                               | Clear flights, listeners, timers |

## Patterns

### App bootstrap

```ts
export const auth = createAuth({
    provider: createLocalAuthProvider({ baseUrl: import.meta.env.VITE_API_URL }),
    storage: createSessionStorageAuthStorage(),
    autoRefresh: true,
});

export async function bootstrapAuth() {
    await auth.whenReady();
    return auth.getSession();
}
```

### Disable auto-refresh; refresh only on 401

```ts
const auth = createAuth({
    provider,
    autoRefresh: false,
});
// Wire createAuthInterceptor so HTTP calls auth.handleUnauthorized()
```

## Edge cases

- Calling methods after `dispose()` throws `AUTH_DISPOSED`.
- Unsupported capabilities throw `AUTH_UNSUPPORTED` before the provider method runs.
- SSR: never touch `window` / storage at import time; construct auth inside app bootstrap with memory storage or an injected custom store.

## FAQ

### Should `autoRefresh` always be on?

Not always. Short-lived SPA sessions often refresh on 401 via HTTP. Background refresh helps long-lived tabs; it needs a working `refresh` capability and careful multi-tab coordination.

### Can I pass raw Firebase into `createAuth`?

No. Wrap with `createFirebaseAuthProvider({ auth: firebaseAuth })` from `@sometic/auth-firebase`. Core only accepts `AuthProvider`.

### Related

- [Session management](/authentication/session-management)
- [Token refresh](/authentication/token-refresh)
- [Installation](/authentication/installation)
