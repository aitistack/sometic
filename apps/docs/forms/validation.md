# Validation

Validators live in `@sometic/validation` and plug into `@sometic/forms` via `register` / form-level `validators`. Issues are structured (`code`, `message`, `path?`, `params?`) so UI, a11y, and server mapping share one model.

## Installation

```bash
pnpm add @sometic/validation @sometic/forms
```

## Import

```ts
import {
    required,
    email,
    minLength,
    maxLength,
    pattern,
    url,
    min,
    max,
    integer,
    oneOf,
    custom,
    pipe,
    all,
    any,
    when,
    refine,
    transform,
    createIssue,
    ok,
    fail,
    runValidators,
} from "@sometic/validation";
```

## Issue model

```ts
type ValidationIssue = {
    code: string;
    message: string;
    path?: string;
    params?: Record<string, unknown>;
};

createIssue("required", "Required", { path: "email" });
ok(); // { valid: true, issues: [] }
fail(issue); // valid iff issues empty
```

`runValidators` runs validators sequentially (awaiting async), attaches missing paths from context, and collects issues from completed validators (does not stop on first failure, use `pipe` for short-circuit).

## Built-in factories

| Factory                     | Code        | Empty / null                             | Notes                     |
| --------------------------- | ----------- | ---------------------------------------- | ------------------------- |
| `required(msg?)`            | `required`  | fails null, undefined, `""` (trim), `[]` |                           |
| `minLength(n, msg?)`        | `minLength` | ok if no length                          |                           |
| `maxLength(n, msg?)`        | `maxLength` | ok if no length                          |                           |
| `pattern(regex, msg?)`      | `pattern`   | ok for null/undefined/`""`               |                           |
| `email(msg?)`               | via pattern | same as pattern                          | Default `"Invalid email"` |
| `url(msg?)`                 | `url`       | ok empty; uses `URL`                     |                           |
| `min(n, msg?)`              | `min`       | ok empty                                 |                           |
| `max(n, msg?)`              | `max`       | ok empty                                 |                           |
| `integer(msg?)`             | `integer`   | ok empty                                 |                           |
| `oneOf(options, msg?)`      | `oneOf`     | ok empty                                 |                           |
| `custom(pred, msg?, code?)` | `custom`    | fails when pred false                    |                           |

**Important:** optional validators (`email`, `min`, `url`, …) pass empty values. Pair them with `required()` when the field is mandatory.

## Composition

| Helper                              | Behavior                                               |
| ----------------------------------- | ------------------------------------------------------ |
| `pipe(...validators)`               | Stop on first invalid                                  |
| `all(...validators)`                | Run all; merge issues                                  |
| `any(...validators)`                | First success wins; else merge failures                |
| `when(predicate, validator)`        | Skip when predicate is false                           |
| `refine(predicate, message, code?)` | Extra predicate (async-capable); default code `refine` |
| `transform(map, validator?)`        | Map value then optionally validate                     |
| `syncOnly(validator)`               | Marker helper for sync-only pipelines                  |

```ts
import { pipe, required, email, minLength } from "@sometic/validation";

form.register("email", {
    validators: [pipe(required(), email(), minLength(5))],
});
```

## Form-level validators

```ts
const form = createForm({
    defaultValues: { password: "", confirm: "" },
    validators: [
        refine(
            (value) => {
                const values = value as { password: string; confirm: string };
                return values.password === values.confirm;
            },
            "Passwords must match",
            "password-mismatch",
        ),
    ],
});
```

Form-level validators run during full `validateForm()` / submit (not when validating a path subset).

## Schema adapter contract

No Zod/Yup runtime is bundled into forms. Prefer:

1. Native field validators (`required()`, `email()`, …)
2. Small first-party schemas via `@sometic/validation/define` + `fromSchema`
3. Optional adapters: `@sometic/validation-zod` / `@sometic/validation-yup`

```ts
import { defineSchema, fromSchema, object, string } from "@sometic/validation/define";

const userSchema = defineSchema(
    object({
        email: string({ email: true, nonempty: true }),
        name: string({ min: 2 }),
    }),
);

createForm({
    defaultValues: { email: "", name: "" },
    validators: [fromSchema(userSchema)],
});
```

Zod:

```ts
import { z } from "zod";
import { createZodSchemaAdapter } from "@sometic/validation-zod";
import { fromSchema } from "@sometic/validation/schema";

createForm({
    defaultValues: { email: "" },
    validators: [fromSchema(createZodSchemaAdapter(z.object({ email: z.string().email() })))],
});
```

Custom adapters implement:

```ts
type SchemaAdapter<T> = {
    parse(input: unknown): T;
    safeParse(input: unknown): SchemaSafeParseResult<T>;
    validateAsync?(input: unknown, opts?: { signal?: AbortSignal }): Promise<ValidationResult>;
};

assertSchemaAdapter(adapter);
```

Wire with `fromSchema(adapter)` as a form or field `Validator`.

## Wiring to fields

```ts
form.register("age", {
    validators: [required(), integer(), min(18)],
    validateOn: "onChange",
    transform: (value) => (value === "" ? value : Number(value)),
});
```

See [Fields](/forms/fields) for trigger modes and [Async validation](/forms/async-validation) for promises, debounce, and races.

## Accessibility

Use `formatIssueSummary` + `announceFormErrors` from `@sometic/forms/a11y` after failed submit. Keep `code` stable for i18n maps.

## Related

- [Async validation](/forms/async-validation)
- [Server errors](/forms/server-errors)
- [Fields](/forms/fields)
- [Validation primitive](/primitives/validation)
- [Form component](/components/form)
