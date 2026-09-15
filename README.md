# Sometic

**Portable application behavior for the JavaScript stack.**

One shared model for auth, HTTP, query, forms, stores, document head, and accessible UI engines. Thin adapters for React, Vue, and `sometic-*` custom elements. **Your** styling system.

> Not another component kit. Not a look-and-feel library. The product is the behavior spine that survives a framework change.

**Docs:** [https://sometic.dev](https://sometic.dev) · **Why this exists:** [Why Sometic](https://sometic.dev/guide/why-sometic) · **vs alternatives:** [Comparison](https://sometic.dev/guide/comparison)

## The problem Sometic solves

Teams re-implement the same application behavior per stack: session refresh, fetch queues, query cache invalidation on sign-out, form state, accessible overlays, theme tokens. Visual libraries lock you into one look (or one framework). Headless widget kits stop at primitives and leave the app spine to glue code.

Sometic keeps **controllers and orchestration** framework-independent. Adapters stay thin. Styling stays yours (unstyled by default: slots, `data-state` / `data-slot`, CSS variables, Tailwind, Bootstrap, CSS Modules, or plain CSS).

## Start with the spine (not a button)

```bash
pnpm add @sometic/app-shell @sometic/auth @sometic/http @sometic/query
```

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
});

app.whenReauth((epoch) => {
    // Session epoch moved: privileged query/cache clears with the shell.
    console.log("reauth epoch", epoch);
});

const todos = app.query.define(["todos"], async () => {
    const response = await app.http.get("/todos");
    return response.data;
});

await todos.refetch();
app.dispose();
auth.dispose();
```

That is the product wedge: **auth + HTTP + query + session epoch** under one disposable graph (`createSometicApp` / `createAppShell`). Then bind a view.

Full install matrix (React, Vue, Vanilla, CDN): [Installation](https://sometic.dev/guide/installation). App composition: [App shell](https://sometic.dev/guide/app-shell).

## What ships in public beta

| Layer       | Packages (npm scope `@sometic`)                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| App spine   | `app-shell`, `auth` (+ optional provider adapters), `http`, `query`, `forms`, `head`, `store` |
| Foundations | `core`, `events`, `styling`, `theme`, `accessibility`, `positioning`, `dom`                   |
| Bind a view | `react`, `vue`, `elements` (`sometic-*`)                                                      |
| Tooling     | `cli`, `registry`                                                                             |

UI engines (fields, overlays, structure, and so on) sit **on top of** that spine. They are how you touch shared controllers, not the identity of the project.

Honest inventory and maturity labels: [What’s included](https://sometic.dev/guide/whats-included) · [Beta maturity](https://sometic.dev/releases/beta).

## Bind a view (after the spine)

Prefer [subpath imports](https://sometic.dev/guide/installation) so you only pull what you use.

```bash
pnpm add @sometic/react @sometic/core @sometic/theme   # React
pnpm add @sometic/vue @sometic/core @sometic/theme     # Vue
pnpm add @sometic/elements @sometic/theme              # Vanilla / Web Components
```

Adapters map the same controllers into framework DX. They do not replace your design system.

## When to use / when not

**Use Sometic when** you need the same behavior across Vanilla, React, Vue, and custom elements; unstyled accessible engines with your own CSS; or auth/HTTP/query orchestration without baking one backend SDK into core.

**Use something else when** you only want a pre-styled React kit (MUI, Chakra, shadcn, …), or you only need React-only headless widgets (Radix, React Aria, Headless UI). See the [comparison guide](https://sometic.dev/guide/comparison).

## Learn more

- [Introduction](https://sometic.dev/guide/introduction)
- [Architecture](https://sometic.dev/concepts/architecture)
- [App scaffolds](https://sometic.dev/guide/app-scaffolds) (agent-ready full-app prompts)
- [Authentication](https://sometic.dev/authentication/) · [HTTP](https://sometic.dev/utilities/http) · [Query](https://sometic.dev/utilities/query)
- [Styling contract](https://sometic.dev/guide/styling)

## License

MIT. See [LICENSE](./LICENSE).

## Contributing

Monorepo workflow: [CONTRIBUTING.md](./CONTRIBUTING.md) and the [Contributing guide](https://sometic.dev/guide/contributing).
