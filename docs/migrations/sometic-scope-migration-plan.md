# Sometic scope migration plan

**Date:** 2026-08-05  
**ADR:** ADR-0012  
**Strategy:** Hard cut to `@sometic` (unpublished). Full identity including CE prefix. Full consumer VitePress IA for shipped surfaces.

## Old → new package mapping

| Previous package             | New package                  |
| ---------------------------- | ---------------------------- |
| `@sometic/accessibility`      | `@sometic/accessibility`      |
| `@sometic/auth`               | `@sometic/auth`               |
| `@sometic/auth-firebase`      | `@sometic/auth-firebase`      |
| `@sometic/auth-local`         | `@sometic/auth-local`         |
| `@sometic/auth-oidc`          | `@sometic/auth-oidc`          |
| `@sometic/auth-supabase`      | `@sometic/auth-supabase`      |
| `@sometic/core`               | `@sometic/core`               |
| `@sometic/date-core`          | `@sometic/date-core`          |
| `@sometic/date-dayjs`         | `@sometic/date-dayjs`         |
| `@sometic/date-fns`           | `@sometic/date-fns`           |
| `@sometic/date-native`        | `@sometic/date-native`        |
| `@sometic/dom`                | `@sometic/dom`                |
| `@sometic/elements`           | `@sometic/elements`           |
| `@sometic/eslint-config`      | `@sometic/eslint-config`      |
| `@sometic/events`             | `@sometic/events`             |
| `@sometic/forms`              | `@sometic/forms`              |
| `@sometic/http`               | `@sometic/http`               |
| `@sometic/react`              | `@sometic/react`              |
| `@sometic/store`              | `@sometic/store`              |
| `@sometic/store-immer`        | `@sometic/store-immer`        |
| `@sometic/styling`            | `@sometic/styling`            |
| `@sometic/theme`              | `@sometic/theme`              |
| `@sometic/validation`         | `@sometic/validation`         |
| `@sometic/vue`                | `@sometic/vue`                |
| `@sometic/docs`               | `@sometic/docs`               |
| `@sometic/playground-vanilla` | `@sometic/playground-vanilla` |
| `@sometic/build-config`       | `@sometic/build-config`       |
| `@sometic/bundle-size-config` | `@sometic/bundle-size-config` |
| `@sometic/release-tools`      | `@sometic/release-tools`      |
| `@sometic/testing-config`     | `@sometic/testing-config`     |
| `@sometic/typescript-config`  | `@sometic/typescript-config`  |
| Root `aitistack-packages`    | `sometic-packages`            |

## CE / class mapping

| Previous                | New        |
| ----------------------- | ---------- |
| `aiti-*` tags           | `sometic-*` |
| `Aiti*` element classes | `Sometic*`  |

## Backward compatibility

None for packages (hard cut). Migration doc for consumers who used early clones.

## Versioning

Changesets mark identity rename as major/breaking for publishable packages even at `0.0.x`.

## Release / rollback

- No npm release in this phase.
- Rollback = revert git commit(s) of the migration.
- Future deprecation of `@aitistack` on npm is N/A until something was published under that scope.

## Validation

Full monorepo gates + docs scope check + playground build + final stale-reference audit.

## CLI / registry

Deferred (packages do not exist). Planned names `@sometic/cli`, `@sometic/registry`.
