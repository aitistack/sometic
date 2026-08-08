# Auth API

## Orchestration

| Export                                         | Role                                                                |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `createAuth(options)`                          | Session subscribe, sign-in/out, register, refresh, hydrate, dispose |
| `createBroadcastAuthBus` / `createNoopAuthBus` | Cross-tab messaging                                                 |
| `handleUnauthorized()`                         | Seam for Phase 11 HTTP 401 recovery                                 |

## Subpaths

| Subpath                       | Contents                                  |
| ----------------------------- | ----------------------------------------- |
| `@sometic/auth/provider`      | Provider types + capabilities             |
| `@sometic/auth/session`       | Session helpers / expiry                  |
| `@sometic/auth/storage`       | Memory / session / local / custom storage |
| `@sometic/auth/refresh`       | Single-flight refresh coordinator         |
| `@sometic/auth/authorization` | `can` / `cannot` / policies               |
| `@sometic/auth/flows`         | Capability-gated flow runners             |
| `@sometic/auth/test-provider` | Deterministic test provider               |

## Adapters

| Package                  | Surfaces                                          |
| ------------------------ | ------------------------------------------------- |
| `@sometic/react/auth`    | `AuthProvider`, `useAuth`, `useSession`, `useCan` |
| `@sometic/vue/auth`      | `useAuth`, `useSession`, `useCan`                 |
| `@sometic/elements/auth` | `sometic-auth-status`                             |
