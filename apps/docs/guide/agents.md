# Agents

How coding agents (and humans pasting into agents) should load Sometic context without inventing a visual UI kit.

## Copy Prompt

Surface docs expose a **Copy Prompt** button (dashed outline). It copies a plain-text scaffold brief for that area:

| Surface    | Page                               | Prompt file      |
| ---------- | ---------------------------------- | ---------------- |
| Ecosystem  | Home (hero CTA)                    | `ecosystem.txt`  |
| App Shell  | [App Shell](/guide/app-shell)      | `app-shell.txt`  |
| Auth       | [Authentication](/authentication/) | `auth.txt`       |
| HTTP       | [HTTP](/utilities/http)            | `http.txt`       |
| Head       | [Head / SEO](/utilities/head)      | `head.txt`       |
| Query      | [Query](/utilities/query)          | `query.txt`      |
| Forms      | [Forms](/forms/)                   | `forms.txt`      |
| Stores     | [Stores](/stores/)                 | `stores.txt`     |
| Theming    | [Theming](/theming/)               | `theming.txt`    |
| Foundation | [Primitives](/primitives/)         | `foundation.txt` |

Paste the prompt into your agent, then point it at the matching docs URL and package names.

## llms.txt

- Curated index: [/llms.txt](/llms.txt) (also linked in site head as `rel="alternate"`)
- Full consumer export: [/llms-full.txt](/llms-full.txt) (regenerated via `python scripts/generate-llms-full.py`)
- Short pointer file: [/ai.txt](/ai.txt)

Prefer `llms.txt` for routing; use `llms-full.txt` for offline / IDE ingestion.

## Package graph (mental model)

```text
Adapters (@sometic/react, vue, elements, …)
    → Composition (@sometic/app-shell)
        → Features (forms, auth, http, query, theme, head, dom, …)
            → Foundation (core, events, store, styling, accessibility, …)
```

- **App Shell** composes System packages behind one session epoch and `dispose()`.
- **Query** caches server data; **store** holds client/UI state; do not mix.
- **HTTP** owns transport and 401 refresh; **auth** owns session; **query** refetches after re-auth.
- Prefer **subpath imports** (`@sometic/react/query`, `@sometic/react/button`).
- Custom elements use the `sometic-*` prefix.
- Publishable packages are font-agnostic; brand fonts are docs/playground only.

## Start paths

1. [Architecture](/concepts/architecture): layers and guarantees
2. [What’s included](/guide/whats-included): honest inventory
3. [Comparison](/guide/comparison): when not to use Sometic
4. System hubs: [App Shell](/guide/app-shell), [Auth](/authentication/), [HTTP](/utilities/http), [Query](/utilities/query), [Forms](/forms/), [Stores](/stores/), [Head](/utilities/head)

## Related

- [Quick start](/guide/quick-start)
- [Contributing](/guide/contributing)
- [Package index](/api/packages)
- [Beta maturity](/releases/beta)
