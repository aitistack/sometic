# Auth overview

`createAuth` orchestrates a capability-aware `AuthProvider`: session subscribe, sign-in/out, register, refresh, hydrate, and dispose, without Firebase/Supabase/OIDC SDKs in this package.

```ts
import {
    createAuth,
    createMemoryAuthStorage,
    createTestAuthProvider,
    requireAuthenticated,
} from "@sometic/auth";

const auth = createAuth({
    provider: createTestAuthProvider(),
    storage: createMemoryAuthStorage(),
});

await auth.signIn({ email: "demo@example.com", password: "password" });
auth.can(requireAuthenticated()); // UX only
```

Production providers → [Auth providers](/packages/auth-providers/). HTTP `handleUnauthorized` → [`@sometic/http`](/packages/http/).

Wave A adapters: `@sometic/react/auth`, `@sometic/vue/auth`, `sometic-auth-status`.
