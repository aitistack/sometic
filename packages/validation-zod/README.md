# `@sometic/validation-zod`

Zod `SchemaAdapter` bridge for [`@sometic/validation`](https://www.npmjs.com/package/@sometic/validation).

This adapter maps Zod `parse` / `safeParse` results into Sometic’s `SchemaAdapter` so form engines can treat Zod issues as `ValidationIssue` values with stable paths. It is intentionally small: Zod stays a peer; Sometic owns the portable issue contract.

Use it when your domain schemas already live in Zod and you want [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms) validation modes, feedback, and server-error merging without rewriting schemas. Sometic still supports native validators and `@sometic/validation/define` when you do not want a Zod peer.

Exports: `createZodSchemaAdapter` and `issuesFromZodError`. Compatible with Zod schema-like objects that expose `parse` and `safeParse` (Zod 3 and Zod 4 peers are declared). Path segments are joined with `@sometic/validation/path` helpers.

Related packages: [`@sometic/validation`](https://www.npmjs.com/package/@sometic/validation), [`@sometic/validation-yup`](https://www.npmjs.com/package/@sometic/validation-yup), [`@sometic/forms`](https://www.npmjs.com/package/@sometic/forms), and [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [introduction](https://sometic.aitistack.com/guide/introduction).

## Install

One-click **Copy** controls (npm package pages cannot host clipboard buttons):

[Copy install commands on the docs](https://sometic.aitistack.com/guide/installation)

```bash
pnpm add @sometic/validation-zod zod
```

```bash
npm install @sometic/validation-zod zod
```

```bash
yarn add @sometic/validation-zod zod
```

## Usage

Create an adapter from a Zod schema:

```ts
import { z } from "zod";
import { createZodSchemaAdapter } from "@sometic/validation-zod";

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

const adapter = createZodSchemaAdapter(schema);
const result = adapter.safeParse({
    email: "user@example.com",
    password: "secret12",
});

if (!result.success) {
    console.log(result.issues);
}
```

Convert a Zod error object into Sometic issues:

```ts
import { issuesFromZodError } from "@sometic/validation-zod";

const parsed = schema.safeParse(input);
if (!parsed.success) {
    const issues = issuesFromZodError(parsed.error);
}
```

## Peers / when not to use

Peer: `zod` (^3.23.0 || ^4.0.0). Depends on `@sometic/validation`.

Skip this package if you are not using Zod. Prefer Yup via `@sometic/validation-yup`, or native validators / `@sometic/validation/define` for zero schema peers.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Validation package](https://sometic.aitistack.com/packages/validation/)
- [Forms](https://sometic.aitistack.com/packages/forms/)

## License

MIT
