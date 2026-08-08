# @sometic/app-shell

Compose Sometic System packages behind one dispose graph and session epoch.

```ts
import { createAppShell } from "@sometic/app-shell";

const app = createAppShell({ auth, http, query, head, theme, stores });
app.dispose();
```
