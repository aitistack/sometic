# Package Map

npm scope: `@sometic` (ADR-0012). **Boundaries and dependency direction are locked**.

## Target Repository Layout

```text
sometic-packages/
├── apps/
│   ├── docs/
│   ├── playground-vanilla/
│   ├── playground-react/
│   ├── playground-vue/
│   ├── playground-angular/
│   ├── playground-svelte/
│   ├── playground-solid/
│   ├── playground-preact/
│   ├── playground-jquery/
│   ├── playground-alpine/
│   └── playground-htmx/
├── packages/
│   ├── core/
│   ├── store/
│   ├── events/
│   ├── accessibility/
│   ├── positioning/
│   ├── styling/
│   ├── theme/
│   ├── validation/
│   ├── validation-zod/
│   ├── validation-yup/
│   ├── forms/
│   ├── auth/
│   ├── auth-local/
│   ├── auth-firebase/
│   ├── auth-supabase/
│   ├── auth-oidc/
│   ├── http/
│   ├── dom/
│   ├── elements/
│   ├── react/
│   ├── vue/
│   ├── angular/
│   ├── svelte/
│   ├── solid/
│   ├── preact/
│   ├── jquery/
│   ├── alpine/
│   ├── htmx/
│   ├── angularjs/
│   ├── date-core/
│   ├── date-native/
│   ├── date-dayjs/
│   ├── date-fns/
│   ├── icons/
│   ├── cli/
│   ├── registry/
│   ├── testing/
│   └── eslint-config/
├── tooling/
│   ├── build/
│   ├── release/
│   ├── bundle-size/
│   ├── testing/
│   └── typescript/
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── maintainer/
│   ├── consumer/
│   ├── phases/
│   ├── security/
│   └── performance/
├── .changeset/
├── .github/workflows/
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── tsconfig.json
└── README.md
```

## Package Catalog

### Foundation

| Package                  | Responsibility                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `@sometic/core`          | Environment, SSR guards, IDs, disposable/lifecycle/error contracts, shared utilities |
| `@sometic/events`        | Typed event emitter                                                                  |
| `@sometic/store`         | External store, selectors, persistence hooks, cross-tab                              |
| `@sometic/styling`       | Class/style resolvers, slots helpers, state attribute helpers                        |
| `@sometic/accessibility` | Focus, keyboard, dismissable, portal, scroll lock, announcer, observers              |
| `@sometic/positioning`   | First-party overlay placement (flip/shift) + adapter contract                        |
| `@sometic/date-core`     | Date adapter contract only                                                           |

### Features

| Package                   | Responsibility                                   |
| ------------------------- | ------------------------------------------------ |
| `@sometic/theme`          | Tokens, theme store, CSS variable generation     |
| `@sometic/validation`     | Validator API + define schema + adapter contract |
| `@sometic/validation-zod` | Optional Zod SchemaAdapter (peer `zod`)          |
| `@sometic/validation-yup` | Optional Yup SchemaAdapter (peer `yup`)          |
| `@sometic/forms`          | Form engine                                      |
| `@sometic/auth`           | Provider-independent auth orchestration          |
| `@sometic/http`           | Fetch-first client and interceptors              |
| `@sometic/query`          | Portable server-state cache                      |
| `@sometic/head`           | Portable document head / SEO                     |
| `@sometic/app-shell`      | System composition (epoch binds, dispose)        |
| `@sometic/dom`            | Imperative DOM controllers                       |
| `@sometic/elements`       | Web Components built on shared engines           |

### Optional adapters

| Package                  | Peer / note                            |
| ------------------------ | -------------------------------------- |
| `@sometic/auth-local`    | Configurable REST endpoints            |
| `@sometic/auth-firebase` | `firebase` peer                        |
| `@sometic/auth-supabase` | `@supabase/supabase-js` peer           |
| `@sometic/auth-oidc`     | OIDC + PKCE flows                      |
| `@sometic/date-native`   | Native Date utilities                  |
| `@sometic/date-dayjs`    | `dayjs` peer                           |
| `@sometic/date-fns`      | `date-fns` peer                        |
| `@sometic/icons`         | Optional minimal SVGs — never required |

### Framework packages

`@sometic/react`, `vue`, `angular`, `svelte`, `solid`, `preact`, `jquery`, `alpine`, `htmx`, `angularjs` (legacy only).

Framework packages are thin adapters. They may re-export composed components but must not own unique business logic.

### Tooling

`@sometic/cli`, `@sometic/registry`, `@sometic/testing`, `@sometic/eslint-config`, plus internal `tooling/*` packages not necessarily published.

## First Implementation Wave (packages touched early)

Phase 1 tooling → Phase 2 `core`/`events` → Phase 3 `store` → Phase 4 `styling` → Phase 5 `theme` → Phase 6 `accessibility` → Phase 7 button surfaces in `dom`/`elements`/`react`/`vue`.

## Export Policy

Every published package:

- Independently buildable
- ESM + declaration files
- Root and subpath exports where components/utilities are independently importable
- Accurate `peerDependencies` / optional peer metadata
- README, license, changelog, repository fields, `sideEffects` metadata

See `public-api-policy.md`.

## Playgrounds

`apps/playground-vanilla` is required for interactive verification (`pnpm playground:vanilla`). Framework playgrounds under `apps/playground-*` are created/updated when that adapter ships interactive UI. Docs do not replace playground coverage.
