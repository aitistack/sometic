# `@sometic/eslint-config`

Shared ESLint flat config for Sometic TypeScript packages.

`@sometic/eslint-config` is the lint baseline used across the Sometic monorepo. It exports `createPackageConfig(options?)`, which builds an ESLint 9 flat config from `@eslint/js` recommended rules, `typescript-eslint` recommended configs, and a custom `sometic/no-implementation-comments` rule. Package authors and consumers who want the same strictness can reuse it outside the monorepo.

Sometic coding standards ban implementation comments, forbid `any`, prefer type-only imports, and reject TODO/FIXME noise in source. Encoding those rules in a publishable config keeps adapters, engines, and apps aligned without copying ESLint fragments package by package. The config ignores build outputs (`dist`, `coverage`, `.turbo`) and common tooling files so lint stays focused on product TypeScript.

Standout behavior: `createPackageConfig` accepts optional `tsconfigRootDir` for typed lint via `projectService`; enables `@typescript-eslint/consistent-type-imports` with separate type imports; errors on `@typescript-eslint/no-explicit-any` and unused vars (with `_` ignore patterns); turns on `no-warning-comments` for todo/fixme/xxx/hack; and applies `sometic/no-implementation-comments` to TypeScript while disabling that rule for plain JS config files. The custom rule allows license headers and required tooling directives only.

This package is developer tooling, not a runtime adapter. It sits beside TypeScript and ESLint peers, while application behavior remains in packages rooted at [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Architecture and standards live under the docs site at [https://sometic.aitistack.com/](https://sometic.aitistack.com/).

Use it when you maintain Sometic packages or want the same comment and TypeScript discipline in a consumer monorepo. Skip it when you already have a house ESLint stack and do not want the no-implementation-comments policy. It does not replace framework adapters, CLI scaffolding, or UI engines.

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

Peers: `eslint` `^9`, `typescript` `^5`.

```bash
pnpm add -D @sometic/eslint-config eslint typescript
```

```bash
npm install -D @sometic/eslint-config eslint typescript
```

```bash
yarn add -D @sometic/eslint-config eslint typescript
```

## Usage

```js
import { createPackageConfig } from "@sometic/eslint-config";

export default createPackageConfig({
    tsconfigRootDir: import.meta.dirname,
});
```

## Peers / when not to use

- Requires ESLint 9 flat config and TypeScript 5. Not for legacy `.eslintrc` alone.
- Opinionated: bans most implementation comments. Do not adopt if your team relies on inline code commentary.
- Not a runtime dependency of apps. Keep it in `devDependencies`.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
