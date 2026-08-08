# @sometic/auth-local

Configurable JSON REST `AuthProvider` for `@sometic/auth`.

```ts
import { createAuth } from "@sometic/auth";
import { createLocalAuthProvider } from "@sometic/auth-local";

const provider = createLocalAuthProvider({
    baseUrl: "https://api.example.com",
    // fetcher: customFetch,
});
const auth = createAuth({ provider });
```

Docs: [Auth providers](https://sometic.aitistack.com/authentication/) · [Local](https://sometic.aitistack.com/authentication/local-provider)
