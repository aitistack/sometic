# Utilities

Shared non-UI engines used across Sometic apps: HTTP, query (server state), document head / SEO, and pointers into related services.

## Inventory

| Utility            | Package              | Docs                                         |
| ------------------ | -------------------- | -------------------------------------------- |
| HTTP client        | `@sometic/http`      | [HTTP](/utilities/http)                      |
| Query              | `@sometic/query`     | [Query](/utilities/query)                    |
| Head / SEO         | `@sometic/head`      | [Head / SEO](/utilities/head)                |
| Auth orchestration | `@sometic/auth`      | [Authentication](/authentication/)           |
| Auth ↔ HTTP seam   | `@sometic/http/auth` | [Interceptors](/authentication/interceptors) |

Foundation packages such as `@sometic/core`, `@sometic/events`, and `@sometic/store` are documented under [Foundation](/primitives/) and [Stores](/stores/). Server cache belongs in [Query](/utilities/query), not the store.

## Related hubs

- [Services](/services/) (auth + HTTP entry points)
- [Authentication](/authentication/)
- [Query](/utilities/query)
- [Head / SEO](/utilities/head)
- [API packages map](/api/packages)
