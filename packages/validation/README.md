# `@sometic/validation`

Native validators, issue types, path helpers, composition utilities, and schema-adapter contracts for Sometic forms.

`@sometic/validation` is the validation kernel: `ValidationIssue` / `ValidationResult`, sync and async validators (`required`, `email`, `minLength`, `pattern`, …), path get/set helpers, and composition (`pipe`, `all`, `when`, `refine`). It also defines the `SchemaAdapter` contract so Yup, Zod, or a custom schema library can normalize into the same issue shape.

Why a separate package: forms need a stable issue model and abortable async validation without forcing a single schema library into every app. Native validators cover common fields; schema adapters plug in when you already own Yup or Zod schemas. The lightweight `define` subpath offers a built-in schema DSL when you want typed object schemas without an external peer.

Standout features include `runValidators`, `debouncePromise` for abortable debounce, `fromSchema` / `assertSchemaAdapter`, path utilities (`getAt`, `setAt`, `joinPath`), and `@sometic/validation/define` for `defineSchema`, `object`, `string`, and friends. Everything stays dependency-light and tree-shakeable via subpaths (`./validators`, `./compose`, `./schema`, `./path`, `./define`).

Ecosystem role: consumed by [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms) and optionally bridged by [`@sometic/validation-zod`](https://www.npmjs.com/package/@sometic/validation-zod) or [`@sometic/validation-yup`](https://www.npmjs.com/package/@sometic/validation-yup). Built on portable TypeScript with no framework imports; foundation context lives in [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Read the [introduction](https://sometic.aitistack.com/guide/introduction) and [validation overview](https://sometic.aitistack.com/packages/validation/).

## Install

```bash
pnpm add @sometic/validation
```

```bash
npm install @sometic/validation
```

```bash
yarn add @sometic/validation
```

## Usage

Run native validators against a value:

```ts
import { email, minLength, required, runValidators } from "@sometic/validation";

const result = await runValidators("user@example.com", [required("Email is required"), email()]);

const password = await runValidators("secret12", [
    required(),
    minLength(8, "Use at least 8 characters"),
]);

console.log(result.ok, password.ok);
```

Define a small schema without an external library:

```ts
import { defineSchema, object, string } from "@sometic/validation/define";

const adapter = defineSchema(
    object({
        email: string({ email: true, nonempty: true }),
        password: string({ min: 8 }),
    }),
);

const parsed = adapter.safeParse({
    email: "user@example.com",
    password: "secret12",
});
```

## Peers / when not to use

No required peers. Use [`@sometic/validation-zod`](https://www.npmjs.com/package/@sometic/validation-zod) or [`@sometic/validation-yup`](https://www.npmjs.com/package/@sometic/validation-yup) when you already standardize on those libraries.

Skip this package if you only need HTML constraint validation and never plan to share issues with `@sometic/forms`. Prefer the Zod/Yup adapters instead of reimplementing `SchemaAdapter` by hand unless you are integrating a different schema library.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Validation package](https://sometic.aitistack.com/packages/validation/)
- [Validation primitives](https://sometic.aitistack.com/primitives/validation)
- [Forms](https://sometic.aitistack.com/packages/forms/)

## License

MIT
