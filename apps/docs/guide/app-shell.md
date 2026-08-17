# App Shell

`@sometic/app-shell` is the System composition package. Start with **`createSometicApp`** for distinctive easy keys (`app.http`, `app.query.define`, `app.whenReauth`). Under the hood it uses `createAppShell`, which wires auth, HTTP, query, head, theme, stores, and forms behind a **shared session epoch** and a single `dispose()` graph.

::: tip System standout
Sign-out and user switch cannot leave privileged query cache, cross-epoch HTTP replays, or session stores behind. Prefer `createSometicApp` / `createAppShell` over ad-hoc TanStack + Axios + Helmet + Zustand wiring when you want Sometic’s portable boundaries out of the box.
:::

<CopyPrompt surface="app-shell" />

## Overview

| Concern         | API                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------- |
| Easy spine      | `createSometicApp({ auth, baseUrl?, theme?, … })` → `app.http`, `app.query`, `app.whenReauth` |
| Compose         | `createAppShell({ auth, http?, query?, head?, theme?, stores?, forms?, … })`                  |
| Epoch           | `app.epoch` / `app.getEpoch()` / `app.whenReauth` / `app.onEpochChange`                       |
| Dispose         | `app.dispose()` tears down binds; disposes owned query/HTTP clients                           |
| Auth ↔ query    | `bindQueryToAuth` (also applied inside shell)                                                 |
| Auth ↔ HTTP     | `bindAuthToHttp` (auth + optional policy interceptors, epoch ledger)                          |
| Theme ↔ head    | `bindThemeToHead`                                                                             |
| Auth ↔ stores   | `bindAuthToStores`                                                                            |
| Mutation ↔ form | `bindMutationForm`                                                                            |
| Query → head    | `bindHeadToQuery`                                                                             |
| Mutation outbox | `createSessionMutationQueue` (in-memory; drops on epoch bump; not durable offline)            |
| App primitives  | Optional `flags`, `drafts`, `commands`, `history`, `offlineQueue` on the shell / spine        |

### When to use

- One app composition for System packages with shared epoch invalidation
- Portable apps that already use `@sometic/auth` + `@sometic/http` + `@sometic/query`
- Guaranteeing logout / user-switch clears privileged client state

### When not to use

- You only need one package (e.g. theme alone): import that package directly
- Full durable offline queues: use [`@sometic/offline-queue`](/guide/app-primitives); shell mutation queue is session-lite only
- Replacing TanStack DevTools or Floating UI: out of scope

## Installation

<InstallCommands packages="@sometic/app-shell @sometic/auth @sometic/http @sometic/query" />

Optional peers: `@sometic/head`, `@sometic/theme`, `@sometic/store`, `@sometic/forms`.

## Usage (easy spine)

::: code-group

```js [JS]
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

const todos = app.query.define(["todos"], async () => {
    const response = await app.http.get("/todos");
    return response.data;
});

await todos.refetch();
await app.query.invalidate(["todos"]);

app.dispose();
auth.dispose();
```

```ts [TS]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createSometicApp, type SometicApp } from "@sometic/app-shell";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

const app: SometicApp = createSometicApp({
    auth,
    baseUrl: "https://api.example.com",
    theme: true,
});

app.whenReauth((epoch) => {
    console.log("epoch", epoch);
});

const todos = app.query.define(["todos"], async () => {
    const response = await app.http.get<{ id: string }[]>("/todos");
    return response.data;
});

await todos.refetch();
await app.query.invalidate(["todos"]);

app.dispose();
auth.dispose();
```

```js [Vanilla]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createSometicApp } from "@sometic/app-shell";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

const app = createSometicApp({ auth, baseUrl: "https://api.example.com" });
const me = await app.http.get("/me");
console.log(me.data, app.epoch);
app.dispose();
auth.dispose();
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/app-shell@4.0.0/dist/cdn/sometic-app-shell.iife.js"></script>
<script>
    const app = SometicAppShell.createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });
    app.http.get("/me").then((me) => {
        console.log(me);
    });
    app.dispose();
</script>
```

```html [CDN Module]
<script type="module">
    import { createSometicApp } from "https://cdn.jsdelivr.net/npm/@sometic/app-shell@4.0.0/dist/cdn/sometic-app-shell.esm.js";

    const app = createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });

    const me = await app.http.get("/me");
    app.dispose();
</script>
```

:::

Engine-level `createHttp` / `createQueryClient` / `createAppShell` remain supported when you need finer control.

## Usage (engine shell)

::: code-group

```js [JS]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createAppShell } from "@sometic/app-shell";
import { createHeadController } from "@sometic/head";
import { createThemeController } from "@sometic/theme";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});
const head = createHeadController();
const theme = createThemeController();

const app = createAppShell({
    auth,
    head,
    theme,
    createHttpOptions: { baseUrl: "https://api.example.com" },
    refetchOnReauth: "all",
    allowAbsoluteUrl: false,
});

console.log(app.epoch);
app.onEpochChange((epoch) => {
    console.log("epoch", epoch);
});

app.dispose();
auth.dispose();
```

```ts [TS]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createAppShell, type AppShell } from "@sometic/app-shell";
import { createHeadController } from "@sometic/head";
import { createThemeController } from "@sometic/theme";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});
const head = createHeadController();
const theme = createThemeController();

const app: AppShell = createAppShell({
    auth,
    head,
    theme,
    createHttpOptions: { baseUrl: "https://api.example.com" },
    refetchOnReauth: "all",
    allowAbsoluteUrl: false,
    maxResponseBytes: 2_000_000,
});

const stop = app.onEpochChange((epoch: number) => {
    void epoch;
});
stop();
app.dispose();
auth.dispose();
```

```js [Vanilla]
import { createAuth, createMemoryAuthStorage, createTestAuthProvider } from "@sometic/auth";
import { createAppShell } from "@sometic/app-shell";
import { applyHead, createHeadController } from "@sometic/head";
import { applyThemeToElement, createThemeController } from "@sometic/theme";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});
const head = createHeadController({ initial: { title: "App" } });
const theme = createThemeController();
theme.subscribe(() => {
    applyThemeToElement(document.documentElement, theme.get());
});
head.subscribe(() => {
    applyHead(document, head.get());
});

const app = createAppShell({ auth, head, theme });
document.querySelector("[data-sign-out]")?.addEventListener("click", () => {
    void auth.signOut();
});
window.addEventListener("pagehide", () => {
    app.dispose();
    auth.dispose();
});
```

:::

## Boundaries (enforced by design)

| Data                  | Package          | Shell behavior                                  |
| --------------------- | ---------------- | ----------------------------------------------- |
| Session / identity    | `@sometic/auth`  | Epoch source of truth                           |
| Server lists / detail | `@sometic/query` | Cleared on epoch bump; refetch after re-auth    |
| Transport             | `@sometic/http`  | Epoch tagged; cross-epoch replay refused        |
| Client UI / prefs     | `@sometic/store` | Session stores reset; prefs optional            |
| Form drafts           | `@sometic/forms` | Never parked in query; omit secrets from drafts |
| Document head         | `@sometic/head`  | Theme bind + optional query → SEO patches       |

## Options

| Input                                                        | Behavior                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `auth`                                                       | Required                                                             |
| `http` / create options                                      | Attach auth + policy + epoch interceptors                            |
| `query` / create options                                     | `bindQueryToAuth`                                                    |
| `head` / `theme`                                             | Optional; `bindThemeToHead` when both present                        |
| `stores`                                                     | `{ ui?, prefs?, session? }`; session stores reset on epoch           |
| `forms`                                                      | `{ draftsClearOnEpoch?, register? }`                                 |
| `flags` / `drafts` / `commands` / `history` / `offlineQueue` | Optional app primitives; see [App primitives](/guide/app-primitives) |
| `refetchOnReauth`                                            | `'auth' \| 'all' \| false`                                           |
| `authQueryKeys`                                              | Used when `refetchOnReauth: 'auth'`                                  |
| `allowAbsoluteUrl` / `maxResponseBytes`                      | Forwarded to HTTP when shell creates the client                      |

## FAQ

### Why App Shell instead of wiring TanStack + Axios + Helmet + Zustand myself?

You can wire those tools. App Shell exists so **session epoch**, **query clear**, **HTTP replay refusal**, **theme↔head**, and **mutation↔form** share one dispose graph and one mental model across Vanilla, React, and Vue, without inventing the glue in every app.

### Does App Shell replace my router or UI kit?

No. It composes Sometic System packages. Routing, layouts, and visual design stay yours.

### Is the mutation queue offline-durable?

No. `createSessionMutationQueue` is in-memory and drops on epoch change. For a durable outbox, use [`@sometic/offline-queue`](/guide/app-primitives#offline-queue).

### Who owns dispose?

Caller-owned `auth` / `head` / `theme` / passed-in `query` are not disposed by the shell (unless `ownQuery`). HTTP/query clients **created** by the shell are disposed with `app.dispose()`.

## Related

- [App primitives](/guide/app-primitives)
- [Authentication](/authentication/)
- [HTTP](/utilities/http)
- [Query](/utilities/query)
- [Head / SEO](/utilities/head)
- [Forms](/forms/)
- [Stores](/stores/)
- [Theming](/theming/)
- [Comparison](/guide/comparison)
- [Agents](/guide/agents)
