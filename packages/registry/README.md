# `@sometic/registry`

Sometic CLI registry: templates, checksums, and install metadata.

`@sometic/registry` is the data package behind [`@sometic/cli`](https://www.npmjs.com/package/@sometic/cli). It defines registry items (`config`, `theme`, `button`), framework/mode matrices (`vanilla` | `react` | `vue` × `package` | `source` | `hybrid`), file payloads with SHA-256 checksums, and helpers to resolve and verify those files. Application apps rarely depend on it directly; the CLI does.

Deterministic scaffolding needs a single catalog. Checksums catch content drift. Framework-aware button templates re-export React/Vue button subpaths in hybrid mode, or wrap `@sometic/dom/button` for Vanilla, including a source-mode ownership wrapper. Theme templates scaffold a thin facade over `@sometic/theme`. Config items drop a generated README that points back to docs and hybrid ownership rules.

Standout exports: `REGISTRY_ITEMS`, `getRegistry`, `getRegistryItem`, `resolveItemFiles`, `resolveButtonFiles`, `createRegistryFile`, `checksumContent`, `verifyChecksums`, and `verifyRegistryChecksums`. Types cover `RegistryItem`, `RegistryFile`, `RegistryFramework`, `RegistryMode`, and `RegistryItemType`. Button files are resolved dynamically per framework/mode rather than stored as a single static list on the item.

In the ecosystem this package is tooling infrastructure next to the CLI, not a runtime UI dependency. Product behavior still lives in engines and adapters rooted at [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). CLI usage: [CLI](https://sometic.aitistack.com/guide/cli).

## Install

Typically pulled in by `@sometic/cli`. Direct install for tooling:

```bash
pnpm add @sometic/registry
```

```bash
npm install @sometic/registry
```

```bash
yarn add @sometic/registry
```

## Usage

List items and resolve files:

```ts
import { getRegistry, getRegistryItem, resolveItemFiles } from "@sometic/registry";

for (const item of getRegistry()) {
    console.log(item.name, item.title, item.modes.join(","));
}

const button = getRegistryItem("button")!;
const files = resolveItemFiles(button, "react", "hybrid");
console.log(files.map((file) => file.path));
```

Checksum helpers:

```ts
import {
    checksumContent,
    createRegistryFile,
    verifyRegistryChecksums,
} from "@sometic/registry";

const file = createRegistryFile("note.ts", "export const ok = true;\n");
console.log(file.checksum === checksumContent(file.content));

verifyRegistryChecksums();
```

## Peers / when not to use

- No framework peers. Node crypto is used for checksums.
- Not an application dependency for browsers. Prefer `@sometic/cli` for scaffolding UX.
- Do not treat registry templates as the source of truth for runtime APIs; published packages and docs are.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [CLI](https://sometic.aitistack.com/guide/cli)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
