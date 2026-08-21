# `@sometic/app-shell`

System composition for Sometic. Start with **`createSometicApp`** for easy keys (`app.http`, `app.query.define`, `app.whenReauth`). Under the hood it uses `createAppShell`, which wires auth session epoch across HTTP, query, head, theme, stores, and forms.

When the session epoch bumps (logout, user switch, hard re-auth), query caches clear/refetch, mutation queues reset, and optional session stores revert. Hand-wiring `bindAuthToHttp`, `bindQueryToAuth`, `bindThemeToHead`, and draft clears is easy to get wrong. This package encodes the recommended composition once.

Standout exports: `createSometicApp`, `createAppShell`, `bindAuthToHttp`, `bindQueryToAuth`, `bindHeadToQuery`, `bindMutationForm`, `bindThemeToHead`, `bindAuthToStores`, `createSessionMutationQueue`, and `bindMutationQueueToAuth`.

Peers: [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth), [`@sometic/http`](https://www.npmjs.com/package/@sometic/http), [`@sometic/query`](https://www.npmjs.com/package/@sometic/query). Optional: [`@sometic/head`](https://www.npmjs.com/package/@sometic/head), [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme), [`@sometic/store`](https://www.npmjs.com/package/@sometic/store), [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms). Foundation: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core).

Docs: [https://sometic.dev/guide/app-shell](https://sometic.dev/guide/app-shell)

## Install

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

Easy spine (`createSometicApp`):

```ts
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createSometicApp } from "@sometic/app-shell";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

const app = createSometicApp({
    auth,
    baseUrl: "https://api.example.com",
    theme: true,
});

app.whenReauth((epoch) => {
    console.log("epoch", epoch);
});

const todos = app.query.define(["todos"], async () => app.http.get("/todos"));
await todos.refetch();
await app.query.invalidate(["todos"]);

app.dispose();
auth.dispose();
```

Engine-level `createAppShell` (same epoch graph, no façade keys):

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
    refetchOnReauth: false,
});

shell.onEpochChange((epoch) => {
    console.log("session epoch", epoch);
});

await auth.signIn({ email: "demo@example.com", password: "password" });
```

Bind a mutation form and dispose cleanly:

```ts
import { bindMutationForm, createSometicApp } from "@sometic/app-shell";
import { createForm } from "@sometic/forms";
import { createMutationObserver } from "@sometic/query";

const app = createSometicApp({ auth, baseUrl: "https://api.example.com" });
const form = createForm({ defaultValues: { title: "" } });
const mutation = createMutationObserver(app.query, {
    mutationFn: async (variables: { title: string }) => {
        await app.http.post("/items", JSON.stringify(variables), {
            headers: { "Content-Type": "application/json" },
        });
    },
});

const bound = bindMutationForm({
    form,
    mutation,
    getEpoch: () => app.getEpoch(),
    queryClient: app.query,
    getVariables: () => ({ title: String(form.getValues().title ?? "") }),
});

await bound.submit();
app.dispose();
```

## CDN

Docs: [https://sometic.dev/guide/app-shell](https://sometic.dev/guide/app-shell).

### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/app-shell@4.0.2/dist/cdn/sometic-app-shell.iife.js"></script>
<script>
    const app = SometicAppShell.createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });
</script>
```

### Module script

```html
<script type="module">
    import { createSometicApp } from "https://cdn.jsdelivr.net/npm/@sometic/app-shell@4.0.2/dist/cdn/sometic-app-shell.esm.js";

    const app = createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });
</script>
```

## Peers / when not to use

Required peers in practice: `@sometic/auth`, `@sometic/http`, `@sometic/query`. Optional: `@sometic/forms`, `@sometic/head`, `@sometic/store`, `@sometic/theme`. Depends on `@sometic/core`.

Skip app-shell when you only need a single package in isolation (for example HTTP without auth). Prefer calling individual `bind*` helpers if you need a custom topology the shell does not express. Always call `dispose()` when tearing down.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [App shell](https://sometic.dev/guide/app-shell)
- [Authentication](https://sometic.dev/authentication/)
- [Query](https://sometic.dev/utilities/query)
- [HTTP](https://sometic.dev/utilities/http)
- [Installation / CDN](https://sometic.dev/guide/installation)

## License

MIT
