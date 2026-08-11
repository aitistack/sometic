# `@sometic/query`

Portable server-state query client for Sometic: keys, cache, observers, mutations, and invalidation.

`createQueryClient` holds an in-memory cache keyed by query keys, with observers (`createQueryObserver`, `createMutationObserver`), invalidation, retries, and garbage collection options. Optional `@sometic/query/http` bridges [`@sometic/http`](https://www.npmjs.com/package/@sometic/http) via `createHttpQueryFn` so AbortSignals and safe URLs stay consistent.

Why it exists: UI client state belongs in [`@sometic/store`](https://www.npmjs.com/package/@sometic/store); form values belong in [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms); session identity belongs in [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth). Server lists and detail payloads need a cache that can clear on session epoch changes. [`@sometic/app-shell`](https://www.npmjs.com/package/@sometic/app-shell) binds query to auth for that wipe/refetch behavior.

Standout features: `hashQueryKey` / `partialMatchKey`, observer result shapes familiar to modern query libraries, mutation observers, and an HTTP helper that forwards `context.signal`. Framework hooks live in adapter packages (`@sometic/react/query`, `@sometic/vue/query`), keeping this core framework-free.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core); optional peer `@sometic/http`. Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [query utilities](https://sometic.aitistack.com/utilities/query).

## Install

```bash
pnpm add @sometic/query
```

```bash
npm install @sometic/query
```

```bash
yarn add @sometic/query
```

Optional HTTP bridge:

```bash
pnpm add @sometic/http
```

## Usage

Create a client and observe a query:

```ts
import { createQueryClient, createQueryObserver } from "@sometic/query";

const query = createQueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
});

const observer = createQueryObserver(query, {
    queryKey: ["users", "me"],
    queryFn: async ({ signal }) => {
        const response = await fetch("/api/users/me", { signal });
        return response.json();
    },
});

const stop = observer.subscribe(() => {
    console.log(observer.getCurrentResult().status);
});
```

Bridge `@sometic/http` into a query function:

```ts
import { createHttp } from "@sometic/http";
import { createHttpQueryFn, createQueryClient } from "@sometic/query";

const http = createHttp({ baseUrl: "https://api.example.com" });
const query = createQueryClient();

const queryFn = createHttpQueryFn<{ id: string }>({
    client: http,
    path: "/users/me",
});

await query.fetchQuery({ queryKey: ["users", "me"], queryFn });
```

## Peers / when not to use

Optional peer: `@sometic/http`. Depends on `@sometic/core`.

Prefer TanStack Query when you need its plugin/devtools depth and are React-only. Prefer SWR for a React SWR mental model. Do not store session tokens or form drafts in the query cache; clear privileged caches on logout via app-shell / `bindQueryToAuth`.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Query utilities](https://sometic.aitistack.com/utilities/query)
- [HTTP](https://sometic.aitistack.com/utilities/http)
- [App shell](https://sometic.aitistack.com/guide/app-shell)

## License

MIT
