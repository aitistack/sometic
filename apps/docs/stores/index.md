# Stores

Sometic stores are small, framework-neutral external stores. They power shared application state, optional persistence, cross-tab sync, and theme preference hydration. Adapters bind with `useSyncExternalStore`, signals, or plain `subscribe`.

::: tip System standout: store kinds
Prefer `@sometic/store/kinds`: `createUiStore` (no persist), `createPrefsStore` (persist + profiles), `createSessionStore` (memory only; never tokens). Persistence profiles support `denyKeys` / optional encrypt. Wire [`bindAuthToStores`](/guide/app-shell) so session stores reset on epoch bump.
:::

<CopyPrompt surface="stores" />

## Inventory

| Page                                 | Package / import                                                       | Role                                                  |
| ------------------------------------ | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| [Store](/stores/store)               | `@sometic/store`, `@sometic/store/persistent`, `@sometic/store/cross-tab` | Core store, selectors, persistence, cross-tab         |
| [Immer adapter](/stores/store-immer) | `@sometic/store-immer` (peer `immer`)                                   | Mutable draft updates via `produce`                   |
| [Theme store](/stores/theme)         | `@sometic/theme` + `@sometic/store/persistent`                           | How theme preferences persist through the store layer |

## When to use

- Shared app or engine state that must work across Vanilla, React, Vue, and other adapters
- Persist preferences (including theme) with versioned migrations
- Sync a slice of state across browser tabs

## When not to use

| Need                                          | Prefer                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| Server lists / cached API data                | [`@sometic/query`](/utilities/query)                                             |
| Component-local controlled/uncontrolled props | `@sometic/core/controllable-state`                                               |
| Pub/sub events without retained state         | `@sometic/events`                                                                |
| Full Redux-style middleware ecosystems        | Keep Redux/Zustand at the app boundary; Sometic store stays the adapter contract |

## Bundle targets (gzip goals)

| Surface                                | Budget   |
| -------------------------------------- | -------- |
| Store core (`@sometic/store`)           | ≤ 1.5 KB |
| Persistent subpath                     | ≤ 3 KB   |
| Cross-tab subpath                      | ≤ 2.5 KB |
| Immer adapter (without `immer` itself) | ≤ 1 KB   |

## Related

- [Theming](/theming/) for tokens, CSS variables, and runtime switching
- [React](/frameworks/react) and [Vue](/frameworks/vue) for `useStore` / store bind
- [API packages](/api/packages) for stability labels
