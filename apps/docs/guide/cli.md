# CLI

Scaffold Sometic into your app with an **explicit** CLI. There is no interactive postinstall and no hidden prompts during `npm install`.

Package: `@sometic/cli` · bin: `sometic`

## Install / run

Prefer `dlx` / `npx` so you do not need a global install:

::: code-group

```bash [npm]
npx @sometic/cli@latest init
npx @sometic/cli@latest add button
```

```bash [pnpm]
pnpm dlx @sometic/cli@latest init
pnpm dlx @sometic/cli@latest add button
```

```bash [yarn]
yarn dlx @sometic/cli@latest init
yarn dlx @sometic/cli@latest add button
```

```bash [bun]
bunx @sometic/cli@latest init
bunx @sometic/cli@latest add button
```

:::

Local bin after adding the package: `pnpm exec sometic help`.

## Modes

| Mode                 | Behavior                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| **hybrid** (default) | Package engines stay on npm; CLI writes local wrappers / facades you own |
| **package**          | Prefer package imports and thinner local facades                         |
| **source**           | More ownership hooks in generated files                                  |

Security-sensitive flows (auth refresh, OAuth, store / validation internals, critical a11y) **stay in packages**. The CLI will not eject them into your repo.

Set mode on init or per command:

```bash
pnpm dlx @sometic/cli@latest init --mode hybrid --framework react
pnpm dlx @sometic/cli@latest add button --mode source
```

## Commands

| Command                    | Status            | Purpose                                                                         |
| -------------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `sometic init`              | Implemented       | Write `sometic.config.json` and `src/lib/sometic/README.md` (paths follow config) |
| `sometic add <item>`        | Implemented       | Add a registry template: `config` \| `theme` \| `button`                        |
| `sometic list`              | Implemented       | List registry items                                                             |
| `sometic info <item>`       | Implemented       | Show registry item details                                                      |
| `sometic config [get\|set]` | Implemented       | Read or update config non-interactively                                         |
| `sometic diff`              | **Deferred stub** | Prints “not implemented” guidance                                               |
| `sometic update`            | **Deferred stub** | Prints “not implemented” guidance                                               |
| `sometic doctor`            | **Deferred stub** | Prints “not implemented” guidance                                               |
| `sometic help`              | Implemented       | Show help (`--help` / `-h`)                                                     |

Honesty: `diff`, `update`, and `doctor` are **not** feature-complete. They exit successfully after printing that they ship in a follow-up. Do not build release workflows around them yet.

### `init`

```bash
sometic init [--cwd <path>] [--mode package|source|hybrid] [--framework vanilla|react|vue] [--force] [--dry-run] [--yes]
```

- Creates `sometic.config.json` with `schemaVersion: 1`.
- Refuses to overwrite an existing config unless `--force`.
- Detects package manager / framework when flags omit them (framework still limited to `vanilla` \| `react` \| `vue`).

### `add`

```bash
sometic add <item> [--cwd <path>] [--mode ...] [--framework ...] [--force] [--dry-run]
```

- Requires an existing config (`Run sometic init first` if missing).
- Registry items today: `config`, `theme`, `button`.
- Each item declares supported `modes` and `frameworks`. Mismatches throw (for example item does not support framework X).
- Existing files refuse overwrite unless `--force` (backup under `.sometic/backup`).

### `list` / `info`

```bash
sometic list
sometic info button
```

### `config`

```bash
sometic config get
sometic config get mode
sometic config set mode hybrid
sometic config set framework react
sometic config set paths.lib src/lib/sometic
sometic config set paths.components src/components/sometic
```

Unsupported keys throw. Framework values must be `vanilla` \| `react` \| `vue`. Mode values must be `package` \| `source` \| `hybrid`.

## Flags

| Flag                 | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `--cwd <path>`       | Project directory (default: process cwd)                     |
| `--mode <mode>`      | `package` \| `source` \| `hybrid`                            |
| `--framework <name>` | `vanilla` \| `react` \| `vue`                                |
| `--dry-run`          | Print actions without writing                                |
| `--force`            | Allow overwrite; backups under `.sometic/backup` when writing |
| `--yes` / `-y`       | Non-interactive affirm (CI-friendly)                         |
| `--help` / `-h`      | Show help                                                    |

Unknown flags throw. Values can also use `=` form (`--mode=hybrid`, `--framework=react`).

## Config file

`sometic.config.json` shape (defaults from the CLI):

```json
{
    "schemaVersion": 1,
    "mode": "hybrid",
    "framework": "vanilla",
    "paths": {
        "lib": "src/lib/sometic",
        "components": "src/components/sometic"
    },
    "packageManager": "pnpm",
    "aliases": {
        "@/*": "./src/*"
    }
}
```

## Failure modes

| Situation                                 | Result                                                     |
| ----------------------------------------- | ---------------------------------------------------------- |
| Unknown command                           | Error + help text, exit `1`                                |
| Unknown flag                              | Error, exit `1`                                            |
| Invalid `--mode` / `--framework`          | Error naming allowed values                                |
| Config missing on `add` / `config`        | Error: run `sometic init` first                             |
| Config exists on `init` without `--force` | Error                                                      |
| Add overwrite without `--force`           | Error                                                      |
| Item / mode / framework unsupported       | Error from registry checks                                 |
| `diff` / `update` / `doctor`              | Exit `0` with deferred message (not a real implementation) |

## Why hybrid?

You keep styling and composition in-repo while engines remain patchable via npm. Hybrid is the recommended install mode for most apps.

## FAQ

### Is there a postinstall scaffold?

No. Always invoke the CLI explicitly.

### Can I scaffold Angular / Svelte / Alpine?

Not via `--framework` today. Only `vanilla`, `react`, and `vue`. Wave B/C packages exist as Experimental libraries; wire them manually.

### Does `update` upgrade my wrappers?

Not yet. `update` is a deferred stub. Track releases manually and re-run `add` with `--force` only when you intend to replace local files.

### Does `doctor` validate my project?

Not yet. Same deferred stub behavior as `diff` / `update`.

### Which registry items exist?

`config`, `theme`, `button`. Run `sometic list` for the live list from `@sometic/registry`.

### Can I use the CLI as a library?

`@sometic/cli` exports a programmatic entry (`.`) plus the `sometic` bin. Prefer the bin for apps.

## Related

- [Installation](/guide/installation)
- [Components](/components/)
- [Stores](/stores/)
- [Frameworks](/frameworks/)
- [Beta maturity](/releases/beta)
- [Troubleshooting](/guide/troubleshooting)
