# ADR-0017: Sometic Product Identity

- **Status:** Accepted
- **Date:** 2026-08-08
- **Deciders:** Maintainer
- **Tags:** architecture | tooling | api | brand

## Context

Sometic is the public portable application behavior product under the AitiStack parent brand. Identity must be locked before first publish so packages, custom elements, docs, and tooling share one name and scope.

## Decision

1. Public product name is **Sometic**.
2. Public npm scope is **`@sometic`**. All workspace package names (publishable and private tooling/apps) use `@sometic/<name>`.
3. Custom elements use the **`sometic-*`** prefix; TypeScript element classes use **`Sometic*`**.
4. CSS variable / demo class prefix is **`sometic`** (`--sometic-*`, `.sometic-*`). Theme storage key default is `sometic-theme`.
5. Product docs URL: **`https://sometic.aitistack.com`**.
6. GitHub repository target: **`aitistack/sometic`** (until `set-repo-identity` overrides).
7. Parent brand attribution is **AitiStack** (`portfolio.aitistack.com`).
8. npm organization for publish is **`sometic`**.
9. This ADR is authoritative for identity. ADR-0012 and ADR-0015 are historical Phase 13 notes and are superseded here.

## Alternatives Considered

1. Publish under a personal npm user scope — rejected (not a product brand).
2. Dual product names or dual scopes — rejected (confuses consumers; unpublished so unnecessary).
3. Mismatch CE prefix and npm scope — rejected (incomplete identity).

## Reasons

One public identity keeps imports, docs, CE tags, and npm org aligned. The `sometic` npm organization is owned and ready for first publish.

## Consequences

- All packages, docs, playgrounds, and tooling use Sometic / `@sometic` / `sometic-*`.
- Consumer docs must not teach other scopes or prefixes as current.

## Risks

- DNS for `sometic.aitistack.com` must be configured for the live docs hostname.
- Incomplete naming elsewhere — mitigate with `docs:scope-check` and package validation.

## Migration Impact

None for external consumers (unpublished). In-repo identity is Sometic only.

## Enforcement

- `pnpm packages:validate`, typecheck, test, build
- Docs scope check rejecting stale `@aitistack/` and `@sometic-ui/` in consumer markdown

## References

- ADR-0012 (superseded)
- ADR-0015 (superseded)
- npm org: https://www.npmjs.com/org/sometic
