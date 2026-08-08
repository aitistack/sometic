# Authorization (UX only)

Client authorization helpers answer “should this control be visible or enabled?” They do **not** secure APIs. Servers enforce every privileged action.

## Trust boundary

| Layer                                               | Responsibility     |
| --------------------------------------------------- | ------------------ |
| `can` / `cannot` / `authorize` / `assertAuthorized` | Hide or disable UI |
| Route guards in SPA                                 | Redirect UX        |
| API / gateway / RLS                                 | Real enforcement   |

Treat any browser-derived role, permission, or claim as a hint. Attackers can call endpoints directly.

## Policies

```ts
import {
    can,
    cannot,
    authorize,
    assertAuthorized,
    createPolicy,
    requireAuthenticated,
    requireRole,
    requirePermission,
    requireClaim,
} from "@sometic/auth/authorization";
```

Via the controller (uses current session):

::: code-group

```js [JS]
import {
    requireAuthenticated,
    requireRole,
    requirePermission,
    requireClaim,
} from "@sometic/auth/authorization";

auth.can(requireAuthenticated());
auth.can(requireRole("admin"));
auth.can(requirePermission("billing:write"));
auth.can(requireClaim("plan", "pro"));
auth.cannot(requireRole("banned"));

if (!auth.authorize(requireAuthenticated())) {
    location.assign("/login");
}

auth.assertAuthorized(requireRole("admin"));
```

```ts [TS]
import {
    requireAuthenticated,
    requireRole,
    requirePermission,
    requireClaim,
} from "@sometic/auth/authorization";
import type { AuthController } from "@sometic/auth";

declare const auth: AuthController;

auth.can(requireAuthenticated());
auth.can(requireRole("admin"));
auth.can(requirePermission("billing:write"));
auth.can(requireClaim("plan", "pro"));
auth.cannot(requireRole("banned"));

if (!auth.authorize(requireAuthenticated())) {
    location.assign("/login");
}

auth.assertAuthorized(requireRole("admin"));
```

```js [Vanilla]
import {
    requireAuthenticated,
    requireRole,
    requirePermission,
    requireClaim,
} from "@sometic/auth/authorization";

auth.can(requireAuthenticated());
auth.can(requireRole("admin"));
auth.can(requirePermission("billing:write"));
auth.can(requireClaim("plan", "pro"));
auth.cannot(requireRole("banned"));

if (!auth.authorize(requireAuthenticated())) {
    location.assign("/login");
}

auth.assertAuthorized(requireRole("admin"));
```

:::

Standalone helpers take an explicit context:

```ts
import { can, requirePermission } from "@sometic/auth/authorization";

can(requirePermission("orders:read"), {
    session: auth.getSession(),
});
```

## Composing policies

```ts
const canManageTeam = createPolicy((ctx) => {
    const user = ctx.session.user;
    if (!user) {
        return false;
    }
    return (
        user.roles?.includes("admin") === true || user.permissions?.includes("team:manage") === true
    );
});

auth.can(canManageTeam);
```

Keep policies pure and free of network I/O. Fetch fresh permissions on the server; mirror a subset into `AuthUser` for UX only.

## User shape

```ts
type AuthUser = {
    id: string;
    email?: string;
    displayName?: string;
    roles?: string[];
    permissions?: string[];
    // claims may appear via provider mappers
};
```

Local / Firebase / Supabase mappers can populate roles and permissions from your API payload. OIDC may map from userinfo. Empty arrays mean “unknown,” not “deny all on the server.”

## Patterns

### Disable a button

```ts
button.disabled = auth.cannot(requirePermission("invoice:void"));
```

### Nested UI

```ts
if (auth.can(requireAuthenticated())) {
    renderAccountMenu();
}
if (auth.can(requireRole("admin"))) {
    renderAdminLink();
}
```

### Tests

```ts
import { createTestAuthProvider, createAuth } from "@sometic/auth";

const auth = createAuth({ provider: createTestAuthProvider({/* roles */}) });
await auth.signIn({ email: "a@b.c", password: "x" });
expect(auth.can(requireRole("admin"))).toBe(true);
```

## Edge cases

- Signed-out session: `requireAuthenticated()` is false; role checks fail closed on the client.
- Stale roles after privilege change: refresh session or re-fetch user; do not cache forever in module scope.
- `assertAuthorized` throws `AUTH_UNAUTHORIZED`; catch at UI boundaries only, never to “soft fail” a privileged API call on the client alone.

## FAQ

### Is `can()` secure?

No. It is UX only. Document this in any internal security review.

### Why ship client policies at all?

Consistent hide/disable behavior across Vanilla, React, and Vue without each app inventing incompatible role checks. Enforcement remains server-side.

### How is this different from Firebase Security Rules / Supabase RLS?

Those run on the backend. Sometic policies never replace them.

### Related

- [Session management](/authentication/session-management)
- [Troubleshooting](/authentication/troubleshooting)
- Authentication [index](/authentication/)
