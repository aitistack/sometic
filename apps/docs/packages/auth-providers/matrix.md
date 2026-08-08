# Capability matrix

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
| oauth             |      |       |          | ✓*       | ✓    |
| mfa               |      |       |          |          |      |

\* Supabase OAuth when `signInWithOAuth` is present on the injected client.

`createTestAuthProvider` and development mocks cover all five without cloud keys.
