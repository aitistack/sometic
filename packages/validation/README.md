# `@sometic/validation`

Framework-neutral validation: issue model, path helpers, built-in validators, composition, small `define` schemas, and a schema adapter contract (no mandatory Zod/Yup).

Optional peers:

- `@sometic/validation-zod`
- `@sometic/validation-yup`

```ts
import { defineSchema, fromSchema, object, string } from "@sometic/validation/define";

const adapter = defineSchema(object({ email: string({ email: true }) }));
const validator = fromSchema(adapter);
```

See consumer docs and ADR-0011.
