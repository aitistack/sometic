# `@sometic/auth`

Provider-independent authentication orchestration for Sometic applications.

`@sometic/auth` is the session and capability core: `createAuth`, typed sessions/users/tokens, refresh coordination, storage adapters, authorization helpers, and flow runners. It does **not** embed Firebase, Supabase, OIDC, or REST SDKs. Providers are separate packages that implement the `AuthProvider` contract.

That split keeps auth refresh, session epoch, cross-tab logout, and policy checks portable while letting each backend live behind a thin adapter. HTTP clients can attach tokens and replay after refresh without knowing which IdP issued the session. Apps can swap providers in tests via `createTestAuthProvider`.

Standout features include session epoch helpers (`nextSessionEpoch`, `shouldBumpSessionEpoch`), storage factories (memory, localStorage, sessionStorage, custom), `createRefreshCoordinator`, authorization (`createPolicy`, `requireRole`, `can` / `cannot`), optional cross-tab buses, and capability discovery (`AUTH_CAPABILITIES`, `hasCapability`). Subpaths expose `./provider`, `./session`, `./storage`, `./refresh`, `./authorization`, `./flows`, and `./test-provider`.

Place in the ecosystem: depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core); pairs with provider packages ([`@sometic/auth-local`](https://www.npmjs.com/package/@sometic/auth-local), [`@sometic/auth-firebase`](https://www.npmjs.com/package/@sometic/auth-firebase), [`@sometic/auth-supabase`](https://www.npmjs.com/package/@sometic/auth-supabase), [`@sometic/auth-oidc`](https://www.npmjs.com/package/@sometic/auth-oidc)); integrates with [`@sometic/http`](https://www.npmjs.com/package/@sometic/http) auth interceptors and [`@sometic/app-shell`](https://www.npmjs.com/package/@sometic/app-shell) session epoch composition. Docs: [introduction](https://sometic.dev/guide/introduction) and [auth package](https://sometic.dev/packages/auth/).

## Install

```bash
pnpm add @sometic/auth
```

```bash
npm install @sometic/auth
```

```bash
yarn add @sometic/auth
```

Also install one provider package (or implement `AuthProvider` yourself).

## Usage

Create auth with the built-in test provider:

```ts
import {
    createAuth,
    createMemoryAuthStorage,
    createNoopAuthBus,
    createTestAuthProvider,
} from "@sometic/auth";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
    crossTab: createNoopAuthBus(),
    environment: false,
});

await auth.whenReady();
await auth.signIn({ email: "user@example.com", password: "secret12" });
console.log(auth.getSession().status, auth.getEpoch());
```

Authorize against roles/permissions:

```ts
import { assertAuthorized, createPolicy, requireAuthenticated, requireRole } from "@sometic/auth";

const policy = createPolicy(requireAuthenticated(), requireRole("admin"));
assertAuthorized(auth.getSession(), policy);
```

## CDN

Docs: [https://sometic.dev/authentication/](https://sometic.dev/authentication/).

### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/auth@1.2.3/dist/cdn/sometic-auth.iife.js"></script>
<script>
    const auth = SometicAuth.createAuth({ provider });
</script>
```

### Module script

```html
<script type="module">
    import { createAuth } from "https://cdn.jsdelivr.net/npm/@sometic/auth@1.2.3/dist/cdn/sometic-auth.esm.js";

    const auth = createAuth({ provider });
</script>
```

## Peers / when not to use

No framework peers. Depends on `@sometic/core`.

Do not put provider SDKs in this package; use the dedicated provider packages. Skip `@sometic/auth` if you only need a static API key and no session/refresh model. Prefer provider packages for backend-specific OAuth details rather than forking `createAuth`.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [Auth package](https://sometic.dev/packages/auth/)
- [Authentication guide](https://sometic.dev/authentication/)
- [Auth providers](https://sometic.dev/packages/auth-providers/)
- [App shell](https://sometic.dev/guide/app-shell)

## License

MIT
