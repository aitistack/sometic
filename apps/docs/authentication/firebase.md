# Firebase auth provider

`@sometic/auth-firebase` wraps an injected Firebase Auth-like client. Firebase is an **optional peer** of the adapter package. `@sometic/auth` core has **no** Firebase dependency and no Firebase lock-in.

## When to use

- App already uses Firebase Auth (email/password)
- You want Sometic session orchestration, refresh coordination, and framework adapters on top

## When not to use

- Greenfield first-party REST → [Local](/authentication/local-provider)
- Supabase / generic OIDC IdP → those adapters
- Phone auth / MFA UI as first-class Sometic flows (not wrapped yet)

## Installation

::: code-group

```bash [npm]
npm install @sometic/auth @sometic/auth-firebase firebase
```

```bash [pnpm]
pnpm add @sometic/auth @sometic/auth-firebase firebase
```

```bash [yarn]
yarn add @sometic/auth @sometic/auth-firebase firebase
```

```bash [bun]
bun add @sometic/auth @sometic/auth-firebase firebase
```

:::

Peer range: `firebase` ^10 || ^11 || ^12 (optional peer metadata; install it in the app that imports the adapter).

## Usage

::: code-group

```js [JS]
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createFirebaseAuthProvider } from "@sometic/auth-firebase";

const app = initializeApp({/* firebase config */});
const firebaseAuth = getAuth(app);

const auth = createAuth({
    provider: createFirebaseAuthProvider({
        auth: firebaseAuth,
    }),
    storage: createMemoryAuthStorage(),
});

await auth.signIn({ email: "user@example.com", password: "secret" });
await auth.refresh();
```

```ts [TS]
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createFirebaseAuthProvider } from "@sometic/auth-firebase";
import type { AuthController } from "@sometic/auth";

const app = initializeApp({/* firebase config */});
const firebaseAuth = getAuth(app);

const auth: AuthController = createAuth({
    provider: createFirebaseAuthProvider({
        auth: firebaseAuth,
    }),
    storage: createMemoryAuthStorage(),
});

await auth.signIn({ email: "user@example.com", password: "secret" });
await auth.refresh();
```

```js [Vanilla]
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createFirebaseAuthProvider } from "@sometic/auth-firebase";

const app = initializeApp({/* firebase config */});
const firebaseAuth = getAuth(app);

const auth = createAuth({
    provider: createFirebaseAuthProvider({
        auth: firebaseAuth,
    }),
    storage: createMemoryAuthStorage(),
});

await auth.signIn({ email: "user@example.com", password: "secret" });
await auth.refresh();
```

:::

The adapter types accept a `FirebaseAuthLike` surface so tests can inject mocks without the real SDK.

## Options

```ts
type FirebaseAuthProviderOptions = {
    auth: FirebaseAuthLike;
    mapUser?: (user: FirebaseUserLike) => AuthUser;
};
```

Default user map: `uid` → `id`, plus `email` and `displayName` when present.

## Capabilities

| Capability                     | Supported                               |
| ------------------------------ | --------------------------------------- |
| signIn / signOut / register    | ✓                                       |
| getSession / refresh / getUser | ✓                                       |
| passwordReset                  | ✓                                       |
| emailVerification              | ✓ (when `sendEmailVerification` exists) |
| oauth / mfa / phone            | not wrapped                             |

## How refresh works

`refresh` requires `currentUser` matching the session user id, then calls `getIdToken(true)`. Prefer `auth.refresh()` / HTTP `handleUnauthorized` over calling Firebase APIs beside the controller so storage and events stay consistent.

## Patterns

### Custom claims on user (UX only)

```ts
createFirebaseAuthProvider({
    auth: firebaseAuth,
    mapUser: (user) => ({
        id: user.uid,
        email: user.email ?? undefined,
        // populate roles from your backend profile fetch, not from ID token parsing alone for security
    }),
});
```

Still enforce authorization on your API. Client roles are UX hints.

### Tests without Firebase

```ts
import { createTestAuthProvider } from "@sometic/auth";

const auth = createAuth({ provider: createTestAuthProvider() });
```

Or inject a mock `FirebaseAuthLike` into `createFirebaseAuthProvider`.

## Limitations

- Email/password + session/refresh/password-reset/email-verify first; phone/MFA UI not wrapped
- You must initialize Firebase in app code; Sometic does not call `initializeApp` for you
- Client adapter does not secure APIs

## FAQ

### Does installing `@sometic/auth` pull Firebase?

No. Only `@sometic/auth-firebase` peers on `firebase`, and that peer is optional until you use the adapter.

### Can I use Firebase and Local together?

Not on one `createAuth` instance. One provider per controller. You can create separate controllers in tests.

### Related

- [Installation](/authentication/installation)
- [Token refresh](/authentication/token-refresh)
- [Supabase](/authentication/supabase)
- [Capability matrix](/authentication/)
