# Services

Service-oriented entry points for Sometic engines that sit beside UI components: authentication orchestration and the HTTP client.

These pages mirror the deeper guides under [Authentication](/authentication/) and [Utilities](/utilities/). Use this hub when navigating from architecture or API maps.

## Inventory

| Service         | Package             | Deep docs                                                           |
| --------------- | ------------------- | ------------------------------------------------------------------- |
| Auth controller | `@sometic/auth`      | [Authentication](/authentication/) · [Auth service](/services/auth) |
| HTTP client     | `@sometic/http`      | [HTTP utility](/utilities/http) · [HTTP service](/services/http)    |
| Auth HTTP seam  | `@sometic/http/auth` | [Interceptors](/authentication/interceptors)                        |

## When to use this hub

- You need the package-oriented view of auth / HTTP next to [Primitives](/primitives/)
- You are wiring `createAuth` + `createHttp` without opening every auth subguide first
- You want the provider capability matrix in one place

## When to use the deep guides instead

- Full session, refresh, authorization, and provider setup → [Authentication](/authentication/)
- Full HTTP recipes, retries, and SSR fetch injection → [HTTP utility](/utilities/http)

## Honesty

- Provider SDKs (Firebase, Supabase) are **optional peers** on `@sometic/auth-firebase` and `@sometic/auth-supabase`.
- `@sometic/auth` core has **no** Firebase / Supabase / OIDC lock-in.
- `@sometic/http` optionally peers on `@sometic/auth`; it never embeds provider SDKs.
- Client `can()` and HTTP status handling do **not** secure APIs. Servers enforce authorization.

## Capability matrix (auth providers)

| Capability        | test | local | firebase | supabase | oidc |
| ----------------- | ---- | ----- | -------- | -------- | ---- |
| signIn            | ✓    | ✓     | ✓        | ✓        |      |
| signOut           | ✓    | ✓     | ✓        | ✓        | ✓    |
| register          | ✓    | ✓     | ✓        | ✓        |      |
| getSession        | ✓    | ✓     | ✓        | ✓        | ✓    |
| refresh           | ✓    | ✓     | ✓        | ✓        | ✓    |
| getUser           | ✓    | ✓     | ✓        | ✓        | ✓    |
| passwordReset     | ✓    | ✓     | ✓        | ✓        |      |
| emailVerification | ✓    |       | ✓        |          |      |
| oauth             |      |       |          | ✓\*      | ✓    |
| mfa               |      |       |          |          |      |

\* When `signInWithOAuth` exists on the injected Supabase client.

## Related

- [Auth service](/services/auth)
- [HTTP service](/services/http)
- [Primitives](/primitives/)
- [Utilities](/utilities/)
- [API packages](/api/packages)
- [Beta maturity](/releases/beta)
