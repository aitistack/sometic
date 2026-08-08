# @sometic/auth-firebase

Firebase Auth adapter. Peer: `firebase` (not bundled).

```ts
import { getAuth } from "firebase/auth";
import { createFirebaseAuthProvider } from "@sometic/auth-firebase";

const provider = createFirebaseAuthProvider({ auth: getAuth(app) });
```

Docs: [Firebase adapter](https://sometic.aitistack.com/authentication/firebase)
