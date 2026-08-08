# Validation

`@sometic/validation` provides a shared issue model, native validators, path helpers, composition utilities, and a schema-adapter contract without locking you into Zod, Yup, or Valibot.

Use it alone for value checks, or with [`@sometic/forms`](/forms/) for form-wide validation.

## Overview

| Module           | Import                          | Purpose                                                      |
| ---------------- | ------------------------------- | ------------------------------------------------------------ |
| Issues / results | `@sometic/validation`            | `ok`, `fail`, `createIssue`, `mergeResults`, `issuesForPath` |
| Path helpers     | `@sometic/validation/path`       | `getAt`, `setAt`, `deleteAt`, `parsePath`, `joinPath`        |
| Validators       | `@sometic/validation/validators` | Native sync / async validators                               |
| Compose          | `@sometic/validation/compose`    | `pipe`, `all`, `any`, `when`, `refine`, `transform`          |
| Schema adapter   | `@sometic/validation/schema`     | `SchemaAdapter`, `fromSchema`, `assertSchemaAdapter`         |
| Define schema    | `@sometic/validation/define`     | Small first-party object/array schema builder                |
| Zod adapter      | `@sometic/validation-zod`        | Optional peer wrapper (`zod`)                                |
| Yup adapter      | `@sometic/validation-yup`        | Optional peer wrapper (`yup`)                                |

### When to use

- Shared validation logic across Vanilla controllers, forms, and adapters
- Stable issue `code` strings for i18n
- Bridging an external schema library through `SchemaAdapter`

### When not to use

- Full form lifecycle (drafts, submit, field registration) → [`@sometic/forms`](/forms/)
- HTML constraint validation alone may be enough for simple native forms
- Do not put server authorization rules in client validators

## Installation

::: code-group

```bash [npm]
npm install @sometic/validation
```

```bash [pnpm]
pnpm add @sometic/validation
```

```bash [yarn]
yarn add @sometic/validation
```

```bash [bun]
bun add @sometic/validation
```

:::

## Usage

### Native validators

::: code-group

```ts [TS]
import { required, email, minLength, runValidators } from "@sometic/validation/validators";

const result = await runValidators([required(), email(), minLength(5)], "a@b.co", {
    values: {},
    path: "email",
});

if (!result.valid) {
    console.log(result.issues);
}
```

```js [JS]
import { required, email, minLength, runValidators } from "@sometic/validation/validators";

const result = await runValidators([required(), email(), minLength(5)], "a@b.co", {
    values: {},
    path: "email",
});
```

:::

### Compose

```ts
import { pipe, when, all } from "@sometic/validation/compose";
import { required, min, max } from "@sometic/validation/validators";

const ageRules = pipe(
    required(),
    when((value) => value !== "", all([min(0), max(120)])),
);
```

### Path helpers

```ts
import { getAt, setAt, joinPath } from "@sometic/validation/path";

const values = { user: { email: "" } };
getAt(values, "user.email");
setAt(values, "user.email", "a@b.co");
joinPath("user", "email"); // "user.email"
```

### Schema adapter seam

```ts
import { fromSchema } from "@sometic/validation/schema";
import { defineSchema, object, string } from "@sometic/validation/define";

const adapter = defineSchema(
    object({
        email: string({ email: true, nonempty: true }),
    }),
);

const validator = fromSchema(adapter);
```

Zod / Yup (optional peers):

```ts
import { z } from "zod";
import { createZodSchemaAdapter } from "@sometic/validation-zod";
import { fromSchema } from "@sometic/validation/schema";

const validator = fromSchema(createZodSchemaAdapter(z.string().email()));
```

```ts
import * as yup from "yup";
import { createYupSchemaAdapter } from "@sometic/validation-yup";
import { fromSchema } from "@sometic/validation/schema";

const validator = fromSchema(createYupSchemaAdapter(yup.string().email().required()));
```

## Key APIs

### Built-in validators

`required`, `minLength`, `maxLength`, `pattern`, `email`, `url`, `min`, `max`, `integer`, `oneOf`, `custom`, plus `runValidators` and `normalizeResult`.

### Issues

| Helper                                           | Role                                         |
| ------------------------------------------------ | -------------------------------------------- |
| `ok()` / `fail(issues)`                          | Build `ValidationResult`                     |
| `createIssue({ code, message, path?, params? })` | Stable issue object                          |
| `mergeResults` / `issuesForPath`                 | Combine / filter issues                      |
| `debouncePromise`                                | Debounce async validation with `AbortSignal` |

### Compose

`pipe`, `all`, `any`, `when`, `refine`, `transform`, `syncOnly`.

## How it works

Validators return `ValidationIssue` objects (or results that normalize into them). `runValidators` fills `path` from context and supports async validators with optional `AbortSignal`. Forms depend on validation; validation never imports forms.

Schema libraries stay optional peers outside this package. `SchemaAdapter` is the extension point so Sometic never mandates Zod.

## Edge cases

| Edge                      | Behavior                                                        |
| ------------------------- | --------------------------------------------------------------- |
| Empty string + `required` | Fail with code `required`                                       |
| Async abort               | Honor `signal`; do not apply stale results in forms             |
| Custom codes              | Prefer stable strings (`email`, `server`, …) for i18n maps      |
| Nested paths              | Use path helpers; do not hand-roll string concat inconsistently |

## FAQ

### Why not mandate Zod?

No schema-library lock-in. Native validators and `@sometic/validation/define` cover common cases. Prefer `@sometic/validation-zod` or `@sometic/validation-yup` when you already standardize on those libraries. `SchemaAdapter` + `fromSchema` is the shared seam.

### Is define a Zod replacement?

No. `define` is a **small** object/array/string/number builder (tree-shakeable subpath). It is not Zod feature parity. Use Zod/Yup adapters when you need that ecosystem.

### Can I use this without forms?

Yes. Forms depends on validation, not the reverse.

### How do issue codes work?

Stable `code` strings plus human `message` and optional `path` / `params` for i18n.

### Sync vs async?

Validators may return a Promise. `runValidators` always returns a Promise so callers can await uniformly.

### Where is form-level docs?

[Forms validation](/forms/validation) and [Form component](/components/form).

## Related

- [Forms](/forms/)
- [Forms validation](/forms/validation)
- [Form component](/components/form)
- [Field](/components/field)
- [Core](/primitives/core)
- [Package index](/api/packages)
