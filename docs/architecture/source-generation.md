# Source Generation Boundaries

Companion to `public-api-policy.md` and ADR-0007.

## CLI Principle

Interactive installation is **never** via postinstall. Users run:

```bash
npx @sometic/cli@latest init
pnpm dlx @sometic/cli@latest init
yarn dlx @sometic/cli@latest init
bunx @sometic/cli@latest init
```

## Install Modes

| Mode                 | Behavior                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| Package              | Import maintained package APIs only                                    |
| Source               | Copy project-owned wrappers/components/styles                          |
| Hybrid (recommended) | Package-based maintained logic + source-owned visual/integration files |

## Safety Requirements (Phase 17)

Dry run · diff preview · existing-file detection · conflict resolution · backup · force · non-interactive CI · rollback where practical · package-manager/framework/TS/alias detection · format after generation · deterministic output · checksums / update diffing in registry

## Generated Layout Example

```text
src/lib/sometic/
├── index.ts
├── config.ts
├── theme.ts
├── auth.ts
├── components/
│   ├── button.ts
│   └── input.ts
└── README.md
```

Generated auth files may configure providers; they must not embed refresh/OAuth internals that need security patches.
