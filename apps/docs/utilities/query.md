# Query

`@sometic/query` is Sometic’s portable **server-state** client (Wave A): domain query keys, in-memory cache, observers, mutations, invalidation, and an optional `@sometic/http` bridge via `createHttpQueryFn`.

::: tip System standout: auth-bound cache
Keep server / cache data here, **not** in `@sometic/store`. On logout / user switch, [`createAppShell`](/guide/app-shell) (or `bindQueryToAuth`) calls `query.clear()` from the shared session epoch so privileged lists cannot leak across identities.
:::

<CopyPrompt surface="query" />

## Overview

| Concern     | API                                                                                                                  |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Client      | `createQueryClient(options?)`                                                                                        |
| Imperative  | `fetchQuery` / `ensureQueryData` / `invalidateQueries` / `removeQueries` / `clear` / `getQueryData` / `setQueryData` |
| Observers   | `createQueryObserver` / `createMutationObserver`                                                                     |
| Keys        | `QueryKey` (`readonly unknown[]`), `hashQueryKey`, `partialMatchKey`                                                 |
| HTTP bridge | `createHttpQueryFn({ client, path, method?, body? })`                                                                |
| React       | `QueryClientProvider`, `useQuery`, `useMutation`, `useQueryClient` from `@sometic/react/query`                       |
| Vue         | `provideQueryClient`, `useQuery`, `useMutation`, `useQueryClient` from `@sometic/vue/query`                          |

### When to use

- Cached server reads shared across Vanilla, React, and Vue without duplicating fetch logic
- Invalidation and optimistic mutations next to `@sometic/http` and `@sometic/auth`
- Portable keys and observers when behavior must survive a framework change

### When not to use

- Client-only UI state or preferences → `@sometic/store`
- Form field values → `@sometic/forms`
- GraphQL-normalized caches or TanStack’s full plugin ecosystem alone → use those tools; optionally keep Sometic for auth/HTTP/UI

## Installation

::: code-group

```bash [npm]
npm install @sometic/query
```

```bash [pnpm]
pnpm add @sometic/query
```

```bash [yarn]
yarn add @sometic/query
```

```bash [bun]
bun add @sometic/query
```

:::

Optional HTTP peer and React adapter:

```bash
pnpm add @sometic/http @sometic/react
```

## Usage

### Query a resource

::: code-group

```js [JS]
import { createQueryClient } from "@sometic/query";
import { QueryClientProvider, useQuery } from "@sometic/react/query";

const queryClient = createQueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function Users() {
    const result = useQuery({
        queryKey: ["users"],
        queryFn: async ({ signal }) => {
            const response = await fetch("/api/users", { signal });
            if (!response.ok) {
                throw new Error("Failed to load users");
            }
            return response.json();
        },
    });

    if (result.isPending) {
        return "Loading…";
    }
    if (result.isError) {
        return result.error.message;
    }
    return result.data.map((user) => user.name).join(", ");
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Users />
        </QueryClientProvider>
    );
}
```

```ts [TS]
import { createQueryClient } from "@sometic/query";
import { QueryClientProvider, useQuery } from "@sometic/react/query";

type User = { id: string; name: string };

const queryClient = createQueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function Users() {
    const result = useQuery<User[]>({
        queryKey: ["users"],
        queryFn: async ({ signal }) => {
            const response = await fetch("/api/users", { signal });
            if (!response.ok) {
                throw new Error("Failed to load users");
            }
            return (await response.json()) as User[];
        },
    });

    if (result.isPending) {
        return "Loading…";
    }
    if (result.isError) {
        return result.error.message;
    }
    return result.data.map((user) => user.name).join(", ");
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Users />
        </QueryClientProvider>
    );
}
```

```js [Vanilla]
import { createQueryClient, createQueryObserver } from "@sometic/query";

const queryClient = createQueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const observer = createQueryObserver(queryClient, {
    queryKey: ["users"],
    queryFn: async ({ signal }) => {
        const response = await fetch("/api/users", { signal });
        if (!response.ok) {
            throw new Error("Failed to load users");
        }
        return response.json();
    },
});

const stop = observer.subscribe(() => {
    const result = observer.getCurrentResult();
    console.log(result.status, result.data, result.isFetching);
});

stop();
observer.destroy();
queryClient.dispose();
```

:::

## Query keys

Keys are **readonly tuples**. Prefer domain-shaped prefixes so partial invalidation works:

```ts
const userListKey = ["users"] as const;
const userDetailKey = (id: string) => ["users", id] as const;
const userPostsKey = (id: string) => ["users", id, "posts"] as const;
```

`hashQueryKey` stabilizes object key order. `partialMatchKey(target, partial)` powers prefix filters such as `invalidateQueries({ queryKey: ["users"] })`.

## fetchQuery and invalidateQueries

```ts
import { createQueryClient } from "@sometic/query";

const client = createQueryClient();

const users = await client.fetchQuery({
    queryKey: ["users"],
    queryFn: async ({ signal }) => {
        const response = await fetch("/api/users", { signal });
        return response.json();
    },
});

await client.invalidateQueries({ queryKey: ["users"] });
await client.ensureQueryData({
    queryKey: ["users"],
    queryFn: async ({ signal }) => {
        const response = await fetch("/api/users", { signal });
        return response.json();
    },
});

client.dispose();
```

`fetchQuery` always runs (subject to in-flight dedupe). `ensureQueryData` returns cached success data when still fresh. `invalidateQueries` marks matching entries stale and refetches active observers.

## Mutations and optimistic updates

```ts
import { createMutationObserver, createQueryClient } from "@sometic/query";

const client = createQueryClient();
client.setQueryData(["todos"], [{ id: 1, title: "Ship" }]);

const mutation = createMutationObserver(client, {
    mutationFn: async (title) => {
        const response = await fetch("/api/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });
        return response.json();
    },
    async onMutate(title) {
        const previous = client.getQueryData(["todos"]);
        client.setQueryData(["todos"], (current = []) => [...current, { id: "temp", title }]);
        return { previous };
    },
    onError(_error, _title, context) {
        if (context?.previous) {
            client.setQueryData(["todos"], context.previous);
        }
    },
    async onSettled() {
        await client.invalidateQueries({ queryKey: ["todos"] });
    },
});

await mutation.mutate("Docs");
mutation.destroy();
client.dispose();
```

React: `useMutation` from `@sometic/react/query` with the same `onMutate` / `onError` / `onSettled` shape.

## createHttpQueryFn

Bridge `@sometic/http` into query functions (AbortSignal is forwarded):

```ts
import { createHttp } from "@sometic/http";
import { createHttpQueryFn, createQueryClient } from "@sometic/query";

const http = createHttp({ baseUrl: "https://api.example.com" });
const client = createQueryClient();

const users = await client.fetchQuery({
    queryKey: ["users"],
    queryFn: createHttpQueryFn({
        client: http,
        path: "/users",
    }),
});

const detail = await client.fetchQuery({
    queryKey: ["users", "42"],
    queryFn: createHttpQueryFn({
        client: http,
        path: (context) => {
            const id = encodeURIComponent(String(context.queryKey[1] ?? ""));
            return `/users/${id}`;
        },
    }),
});

client.dispose();
http.dispose();
```

## Auth and 401

Handle unauthorized responses on the **HTTP** layer (`createAuthInterceptor` from `@sometic/http/auth`), not inside every `queryFn`. After a successful re-auth / refresh, **invalidate or refetch** active queries so the cache picks up authorized data:

```ts
await auth.signIn({ email, password });
await queryClient.invalidateQueries();
```

Do not park session tokens in query cache; session belongs to `@sometic/auth`.

On **logout / tenant switch**, call `queryClient.clear()` (or `removeQueries` for a key prefix). `invalidateQueries` alone leaves prior user data until `gcTime` expires.

Paths passed to HTTP / `createHttpQueryFn` must be **relative** or `http(s)` absolute URLs. Unsafe schemes (`javascript:`, `data:`, …) are rejected.

## Store vs query

| Data                         | Package          |
| ---------------------------- | ---------------- |
| Server lists / detail / ETag | `@sometic/query` |
| Theme preference, UI flags   | `@sometic/store` |
| Form draft values            | `@sometic/forms` |
| Session / user identity      | `@sometic/auth`  |

## FAQ

### How does Sometic Query compare to TanStack Query?

TanStack Query is a mature, ecosystem-rich server-state library (especially in React). Sometic Query is a **portable Wave A** cache aligned with Sometic HTTP/auth and Vanilla observers. Prefer Sometic Query when you already standardize on `@sometic/http` + auth refresh and need the same client across React, Vue, and Vanilla. Prefer TanStack when you need its plugin/devtools depth or an established TanStack-only stack. You can still use Sometic for UI/auth/forms alongside it.

### How does it compare to SWR?

SWR is excellent for React stale-while-revalidate hooks. Sometic Query is framework-neutral at the core (`createQueryClient` / observers) with thin React/Vue hooks, first-party invalidation/mutations, and `createHttpQueryFn`. Choose SWR for a React-only SWR mental model; choose Sometic when portability and Sometic HTTP/auth integration matter.

### Is this a full TanStack replacement?

No. Wave A covers keys, cache, observers, mutations, optimistic rollback, and HTTP bridging. It does not claim feature parity with every TanStack plugin or infinite-query pattern. Grow with Sometic Query for portable apps; adopt TanStack when you outgrow Wave A and accept a React-centric (or TanStack-adapter) dependency.

### How do I avoid cross-user cache leakage?

Use one `QueryClient` per authenticated session (or call `clear()` on logout). Do not share a module-level singleton across users in multi-tenant SSR. Prefer domain keys that include tenant/user when the same client must serve multiple scopes briefly.

### Are query keys free-form objects?

Prefer plain JSON-serializable values (`string` / `number` / `boolean` / plain objects / arrays). `Map` / `Set` / `RegExp` / `Date` are tagged distinctly; circular structures and functions throw. Never put secrets in keys (they become cache indexes).

### Does optimistic update rollback happen automatically?

No. Snapshot in `onMutate`, restore in `onError` with `setQueryData`. Missing `onError` leaves optimistic data in place until the next successful invalidate/refetch.

### Should I import query from `@sometic/react` root?

Prefer the subpath `@sometic/react/query` (and `@sometic/vue/query`) so tree-shaking and size budgets stay tight. Root barrels intentionally omit query.

## Related

- [HTTP](/utilities/http)
- [Authentication](/authentication/)
- [Stores](/stores/)
- [Architecture](/concepts/architecture)
- [Package index](/api/packages)
- [Agents](/guide/agents)
