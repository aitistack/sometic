# `@sometic/validation-yup`

Yup `SchemaAdapter` bridge for [`@sometic/validation`](https://www.npmjs.com/package/@sometic/validation).

This tiny adapter turns a Yup schema into Sometic’s `SchemaAdapter` contract so forms and validators can share one issue model (`ValidationIssue`) regardless of how schemas are authored. It maps Yup `ValidationError` trees into path-aware issues and supports both sync `safeParse` and async `validateAsync`.

It exists because Yup remains common in existing apps, while Sometic forms should not hard-depend on any one schema library. Keep Yup as a peer; keep orchestration and issue types in `@sometic/validation` / `@sometic/forms`.

Primary exports are `createYupSchemaAdapter` and `issuesFromYupError`. Pass any schema-like object that implements `validateSync` / `validate` (Yup schemas qualify). The adapter is asserted with `assertSchemaAdapter` before return so malformed wrappers fail fast.

Pair with [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms) and the validation kernel. Alternatives include native validators, `@sometic/validation/define`, or [`@sometic/validation-zod`](https://www.npmjs.com/package/@sometic/validation-zod). Foundation context: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) and the [introduction](https://sometic.aitistack.com/guide/introduction).

## Install

```bash
pnpm add @sometic/validation-yup yup
```

```bash
npm install @sometic/validation-yup yup
```

```bash
yarn add @sometic/validation-yup yup
```

## Usage

Wrap a Yup schema:

```ts
import { object, string } from "yup";
import { createYupSchemaAdapter } from "@sometic/validation-yup";

const schema = object({
    email: string().email().required(),
    password: string().min(8).required(),
});

const adapter = createYupSchemaAdapter(schema);
const result = adapter.safeParse({
    email: "user@example.com",
    password: "secret12",
});
```

Map a caught Yup error into Sometic issues (for custom flows):

```ts
import { issuesFromYupError } from "@sometic/validation-yup";

try {
    schema.validateSync(input, { abortEarly: false });
} catch (error) {
    const issues = issuesFromYupError(error as never);
    console.log(issues);
}
```

## Peers / when not to use

Peer: `yup` (^1.4.0). Depends on `@sometic/validation`.

Do not install this package if you are not using Yup. Prefer `@sometic/validation-zod` for Zod, or native/`define` schemas when you want zero schema peers.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Validation package](https://sometic.aitistack.com/packages/validation/)
- [Forms](https://sometic.aitistack.com/packages/forms/)

## License

MIT
