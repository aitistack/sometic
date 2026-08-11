# `@sometic/app-shell`

System composition helper: `createAppShell` wires auth session epoch across HTTP, query, head, theme, stores, and forms.

`createAppShell` takes a required `AuthController` and optional HTTP/query/head/theme/store/form pieces, then binds them so privileged caches and drafts do not leak across identities. When the session epoch bumps (logout, user switch, hard re-auth), query caches clear/refetch, mutation queues reset, and optional session stores revert.

It exists because correct multi-surface apps need more than separate packages; they need a shared epoch ledger. Hand-wiring `bindAuthToHttp`, `bindQueryToAuth`, `bindThemeToHead`, and draft clears is easy to get wrong. App shell encodes the recommended composition once.

Standout exports: `createAppShell`, `bindAuthToHttp`, `bindQueryToAuth`, `bindHeadToQuery`, `bindMutationForm`, `bindThemeToHead`, `bindAuthToStores`, `createSessionMutationQueue`, and `bindMutationQueueToAuth`. The returned shell exposes `auth`, `http`, `query`, `getEpoch` / `onEpochChange`, `mutationQueue`, and `dispose`.

Peers include [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth), [`@sometic/http`](https://www.npmjs.com/package/@sometic/http), and [`@sometic/query`](https://www.npmjs.com/package/@sometic/query), with optional [`@sometic/head`](https://www.npmjs.com/package/@sometic/head), [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme), [`@sometic/store`](https://www.npmjs.com/package/@sometic/store), and [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms). Foundation: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [app shell](https://sometic.aitistack.com/guide/app-shell).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/app-shell#installation)

```bash
pnpm add @sometic/app-shell @sometic/auth @sometic/http @sometic/query
```

```bash
npm install @sometic/app-shell @sometic/auth @sometic/http @sometic/query
```

```bash
yarn add @sometic/app-shell @sometic/auth @sometic/http @sometic/query
```

Add optional peers (`@sometic/head`, `@sometic/theme`, `@sometic/store`, `@sometic/forms`) as needed.

## Usage

Compose auth + query with session epoch refetch:

```ts
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createAppShell } from "@sometic/app-shell";
import { createQueryClient } from "@sometic/query";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

const shell = createAppShell({
    auth,
    query: createQueryClient(),
    refetchOnReauth: "all",
});

shell.onEpochChange((epoch) => {
    console.log("session epoch", epoch);
});

await auth.signIn({ email: "demo@example.com", password: "password" });
```

Bind a mutation form and dispose cleanly:

```ts
import { bindMutationForm, createAppShell } from "@sometic/app-shell";
import { createForm } from "@sometic/forms";
import { createMutationObserver } from "@sometic/query";

const form = createForm({ defaultValues: { title: "" } });
const mutation = createMutationObserver(shell.query, {
    mutationFn: async (variables: { title: string }) => {
        await shell.http.post("/items", JSON.stringify(variables), {
            headers: { "Content-Type": "application/json" },
        });
    },
});

const bound = bindMutationForm({
    form,
    mutation,
    getEpoch: () => shell.getEpoch(),
    queryClient: shell.query,
    getVariables: () => ({ title: String(form.getValues().title ?? "") }),
});

await bound.submit();
shell.dispose();
```

## Peers / when not to use

Required peers in practice: `@sometic/auth`, `@sometic/http`, `@sometic/query`. Optional: `@sometic/forms`, `@sometic/head`, `@sometic/store`, `@sometic/theme`. Depends on `@sometic/core`.

Skip app-shell when you only need a single package in isolation (for example HTTP without auth). Prefer calling individual `bind*` helpers if you need a custom topology the shell does not express. Always call `dispose()` when tearing down a shell instance.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [App shell guide](https://sometic.aitistack.com/guide/app-shell)
- [Authentication](https://sometic.aitistack.com/authentication/)
- [Query](https://sometic.aitistack.com/utilities/query)
- [HTTP](https://sometic.aitistack.com/utilities/http)

## License

MIT
