# `@sometic/http`

Fetch-first HTTP client with interceptors, retry, dedupe, and optional auth refresh for Sometic.

`createHttp` wraps `fetch` with a typed client (`get` / `post` / `put` / `patch` / `delete`), request/response/error interceptors, retry helpers, safe URL joining, and optional response size limits. It is designed for browser and SSR environments that already have `fetch`, not as an Axios reimplementation with a custom XHR stack.

Why it exists: portable apps need one HTTP layer that can attach auth headers, single-flight refresh on 401, and replay the original request after session epoch checks. That logic lives in `@sometic/http/auth` (`createAuthInterceptor`) and cooperates with [`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth) without forcing auth as a hard dependency.

Standout features include interceptor composition, `createMockFetcher` for tests, retry utilities (`computeRetryDelay`, `shouldRetryDefault`), URL safety (`assertSafeRequestUrl`), and policy interceptors under `@sometic/http/auth`. Pair with [`@sometic/query`](https://www.npmjs.com/package/@sometic/query) via `createHttpQueryFn` for cached server state.

Ecosystem: depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core); optional peer `@sometic/auth`; composed by [`@sometic/app-shell`](https://www.npmjs.com/package/@sometic/app-shell). Docs: [introduction](https://sometic.dev/guide/introduction) and [HTTP utilities](https://sometic.dev/utilities/http).

## Install

```bash
pnpm add @sometic/http
```

```bash
npm install @sometic/http
```

```bash
yarn add @sometic/http
```

Optional auth refresh:

```bash
pnpm add @sometic/auth
```

## Usage

Create a client and call JSON APIs:

```ts
import { createHttp } from "@sometic/http";

const http = createHttp({
    baseUrl: "https://api.example.com",
    headers: { Accept: "application/json" },
});

const { data } = await http.get<{ id: string }>("/users/me");
await http.post("/items", JSON.stringify({ title: "Notebook" }), {
    headers: { "Content-Type": "application/json" },
});
```

Attach auth refresh via the auth interceptor:

```ts
import { createHttp } from "@sometic/http";
import { createAuthInterceptor } from "@sometic/http/auth";
import type { AuthController } from "@sometic/auth";

function createAuthedHttp(auth: AuthController) {
    return createHttp({
        baseUrl: "https://api.example.com",
        interceptors: [createAuthInterceptor({ auth })],
    });
}
```

## CDN

Docs: [https://sometic.dev/utilities/http](https://sometic.dev/utilities/http).

### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/http@3.0.1/dist/cdn/sometic-http.iife.js"></script>
<script>
    const http = SometicHttp.createHttp({ baseUrl: "/api" });
    http.get("/me").then((me) => {
        console.log(me);
    });
</script>
```

### Module script

```html
<script type="module">
    import { createHttp } from "https://cdn.jsdelivr.net/npm/@sometic/http@3.0.1/dist/cdn/sometic-http.esm.js";

    const http = createHttp({ baseUrl: "/api" });
    const me = await http.get("/me");
</script>
```

## Peers / when not to use

Optional peer: `@sometic/auth` (for `@sometic/http/auth`). Depends on `@sometic/core`.

Prefer the platform `fetch` alone for one-off calls with no interceptors/retry. Prefer TanStack Query / SWR only as cache layers; you can still use this client underneath via [`@sometic/query`](https://www.npmjs.com/package/@sometic/query). Do not treat this package as a GraphQL client.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [HTTP utilities](https://sometic.dev/utilities/http)
- [HTTP package](https://sometic.dev/packages/http/)
- [Authentication / token refresh](https://sometic.dev/authentication/token-refresh)
- [App shell](https://sometic.dev/guide/app-shell)

## License

MIT
