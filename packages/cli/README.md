# `@sometic/cli`

Sometic CLI for hybrid, package, and source scaffolding (no postinstall prompts).

`@sometic/cli` is the explicit installer for Sometic. The `sometic` binary runs `init`, `add`, `list`, `info`, and non-interactive `config` against templates from [`@sometic/registry`](https://www.npmjs.com/package/@sometic/registry). It never uses interactive postinstall scripts. You invoke it with `pnpm dlx`, `npx`, or a local bin when you are ready.

Scaffolding must not surprise CI or lock teams into one ownership model. Hybrid mode (default) keeps security-sensitive engines in `@sometic/*` packages while generating local wrappers you can style and compose. Package mode prefers package imports; source mode generates more ownership hooks. Detection covers package manager and framework hints; flags (`--dry-run`, `--force` with backups, `--yes`) keep automation safe.

Standout commands: `sometic init` writes `sometic.config.json` and a local lib README from the registry `config` item; `sometic add <item>` adds registry templates (`config`, `theme`, `button`) for `vanilla` | `react` | `vue`; `list` / `info` inspect the registry; `config get|set` updates config without prompts. Deferred placeholders exist for `diff`, `update`, and `doctor` (not Option A). Programmatic entry points export `runCli`, `helpText`, `parseArgv`, `createDefaultConfig`, and `detectProject`.

In the ecosystem the CLI sits beside publishable packages and docs, not inside them. Engines and adapters remain normal dependencies; the CLI only scaffolds. Foundation context: [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Product overview: [Introduction](https://sometic.dev/guide/introduction). Full CLI guide: [CLI](https://sometic.dev/guide/cli).

## Install

No framework peers. Node `>=20.18`. Prefer one-shot `dlx` / `npx`:

```bash
pnpm dlx @sometic/cli@latest init
pnpm dlx @sometic/cli@latest add button
```

```bash
npx @sometic/cli@latest init
npx @sometic/cli@latest add button
```

```bash
yarn dlx @sometic/cli@latest init
yarn dlx @sometic/cli@latest add button
```

Or add as a dev dependency and run `pnpm exec sometic …`.

## Usage

CLI (shell):

```bash
pnpm dlx @sometic/cli@latest init --mode hybrid --framework react --yes
pnpm dlx @sometic/cli@latest add theme --dry-run
pnpm dlx @sometic/cli@latest list
```

Programmatic API:

```ts
import { createDefaultConfig, helpText, runCli } from "@sometic/cli";

console.log(helpText());

const config = createDefaultConfig({
    mode: "hybrid",
    framework: "react",
    packageManager: "pnpm",
});

const code = await runCli(["init", "--cwd", ".", "--yes"], {
    log: console.log,
    error: console.error,
});
console.log(config.mode, code);
```

## Peers / when not to use

- No React/Vue peers on the CLI itself. Generated templates may depend on `@sometic/react`, `@sometic/vue`, `@sometic/dom`, or `@sometic/theme` as declared by the registry item.
- Do not expect postinstall magic. If `init` was never run, there is no silent setup.
- Skip the CLI when you only want to `pnpm add` packages and import them by hand.
- `diff` / `update` / `doctor` are deferred and return not-implemented messaging.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [CLI](https://sometic.dev/guide/cli)
- Docs home: [https://sometic.dev/](https://sometic.dev/)

## License

MIT
