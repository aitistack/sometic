# Auth providers comparison

| Package                       | Transport     | Peer SDK                | Best for        |
| ----------------------------- | ------------- | ----------------------- | --------------- |
| `@sometic/auth/test-provider` | in-memory     | none                    | tests           |
| `@sometic/auth-local`         | fetch REST    | none                    | custom backends |
| `@sometic/auth-firebase`      | Firebase Auth | `firebase`              | Firebase apps   |
| `@sometic/auth-supabase`      | Supabase Auth | `@supabase/supabase-js` | Supabase apps   |
| `@sometic/auth-oidc`          | OIDC PKCE     | none                    | standard IdPs   |
