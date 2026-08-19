# Upgrade

How to move between `@sometic` package versions during the public beta.

## Policy

- Each package versions independently. Read the version you installed, not a repo-wide track name.
- Breaking changes are allowed while maturity is **Beta**. They must land with a Changeset and notes in that package’s `CHANGELOG.md`.
- There is no shim layer for the older product identity. Imports, custom element tags, error helpers, and theme storage keys use **Sometic** / `@sometic` / `sometic-*` / `SometicError` only.

## Before you bump

1. Read [Changelog](/releases/changelog) for thematic notes.
2. Open each upgraded package’s `CHANGELOG.md` in `node_modules` or on GitHub.
3. Cross-check [Beta maturity](/releases/beta) for known limitations that are not bugs.
4. Re-run your app’s tests and a production build. Size Limit in this monorepo is for maintainers; your app bundle is yours.

## Recurring breaking themes

These already shipped. Treat them as current contract, not as a future migration.

| Area            | What to expect                                                                          |
| --------------- | --------------------------------------------------------------------------------------- |
| Identity        | `SometicError` / `isSometicError`. No legacy error class names.                         |
| Custom elements | `sometic-*` tags only.                                                                  |
| Theme           | CSS variable prefix and storage defaults use `sometic`.                                 |
| HTTP            | `http.dispose()` aborts in-flight requests. New calls throw `HTTP_DISPOSED`.            |
| Query           | After `client.dispose()`, writes such as `setQueryData` throw. In-flight fetches abort. |

## How to report a break

If an upgrade fails without a matching changelog note, file a **Bug report** with package names and **exact versions**. See [Beta maturity](/releases/beta).

## Related

- [Beta maturity](/releases/beta)
- [Releases](/releases/)
- [Contributing](/guide/contributing)
- [What’s included](/guide/whats-included)
