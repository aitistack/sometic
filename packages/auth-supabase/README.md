# @sometic/auth-supabase

Supabase Auth adapter. Peer: `@supabase/supabase-js` (not bundled).

```ts
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAuthProvider } from "@sometic/auth-supabase";

const client = createClient(url, key);
const provider = createSupabaseAuthProvider({ auth: client.auth });
```

Docs: [Supabase adapter](https://sometic.aitistack.com/authentication/supabase)
