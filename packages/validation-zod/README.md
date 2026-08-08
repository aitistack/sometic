# `@sometic/validation-zod`

Optional Zod adapter that implements Sometic `SchemaAdapter` and maps issues into the shared validation model.

```bash
pnpm add @sometic/validation-zod zod @sometic/validation
```

```ts
import { z } from "zod";
import { createZodSchemaAdapter } from "@sometic/validation-zod";
import { fromSchema } from "@sometic/validation/schema";

const adapter = createZodSchemaAdapter(z.object({ email: z.string().email() }));
const validator = fromSchema(adapter);
```

Zod remains a peer dependency and is never bundled into `@sometic/validation` or `@sometic/forms`.
