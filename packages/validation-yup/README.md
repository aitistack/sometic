# `@sometic/validation-yup`

Optional Yup adapter that implements Sometic `SchemaAdapter` and maps ValidationError paths into Sometic issues.

```bash
pnpm add @sometic/validation-yup yup @sometic/validation
```

```ts
import * as yup from "yup";
import { createYupSchemaAdapter } from "@sometic/validation-yup";
import { fromSchema } from "@sometic/validation/schema";

const adapter = createYupSchemaAdapter(yup.object({ email: yup.string().email().required() }));
const validator = fromSchema(adapter);
```

Yup remains a peer dependency and is never bundled into `@sometic/validation` or `@sometic/forms`.
