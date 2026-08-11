# `@sometic/auth-firebase`

Firebase Auth provider adapter for [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth).

`createFirebaseAuthProvider` wraps a Firebase Auth-like client (email/password sign-in, register, sign-out, ID token refresh, password reset, optional email verification) and maps users/tokens into Sometic sessions. Firebase remains a peer; this package never bundles the Firebase SDK.

It exists so apps that already use Firebase Auth can still share Sometic session epoch, HTTP refresh interceptors, and authorization helpers without forking orchestration. Pass your initialized `Auth` instance (or a test double matching `FirebaseAuthLike`).

Capabilities include sign-in, register, getSession, refresh (forced ID token), getUser, passwordReset, and emailVerification when `sendEmailVerification` is available. `mapUser` customizes how Firebase users become `AuthUser` records.

Compose with [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth), [`@sometic/http`](https://www.npmjs.com/package/@sometic/http), and [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Overview: [introduction](https://sometic.aitistack.com/guide/introduction) and [auth providers](https://sometic.aitistack.com/packages/auth-providers/).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

```bash
pnpm add @sometic/auth-firebase @sometic/auth firebase
```

```bash
npm install @sometic/auth-firebase @sometic/auth firebase
```

```bash
yarn add @sometic/auth-firebase @sometic/auth firebase
```

## Usage

Wire Firebase Auth into Sometic:

```ts
import { getAuth } from "firebase/auth";
import { createAuth, createMemoryAuthStorage } from "@sometic/auth";
import { createFirebaseAuthProvider } from "@sometic/auth-firebase";

const provider = createFirebaseAuthProvider({
    auth: getAuth(),
});

const auth = createAuth({
    provider,
    storage: createMemoryAuthStorage(),
});

await auth.whenReady();
await auth.signIn({ email: "user@example.com", password: "secret12" });
```

Optional user mapping:

```ts
import { createFirebaseAuthProvider } from "@sometic/auth-firebase";

const provider = createFirebaseAuthProvider({
    auth: getAuth(),
    mapUser: (user) => ({
        id: user.uid,
        email: user.email ?? undefined,
        displayName: user.displayName ?? undefined,
    }),
});
```

## Peers / when not to use

Optional peer: `firebase` (^10 || ^11 || ^12). Depends on `@sometic/auth`.

Do not use this adapter if you are not on Firebase Auth. Prefer [`@sometic/auth-local`](https://www.npmjs.com/package/@sometic/auth-local), [`@sometic/auth-supabase`](https://www.npmjs.com/package/@sometic/auth-supabase), or [`@sometic/auth-oidc`](https://www.npmjs.com/package/@sometic/auth-oidc) for those backends. OAuth social providers beyond email/password are not covered by this adapter’s capability set.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Auth providers](https://sometic.aitistack.com/packages/auth-providers/)
- [Auth package](https://sometic.aitistack.com/packages/auth/)
- [Authentication](https://sometic.aitistack.com/authentication/)

## License

MIT
