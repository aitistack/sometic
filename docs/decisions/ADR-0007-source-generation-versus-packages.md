# ADR-0007: Source Generation Versus Packages

- **Status:** Accepted
- **Date:** 2026-08-04
- **Deciders:** Phase 0 architecture lock
- **Tags:** architecture | security | tooling

## Context

Consumers want shadcn-like ownership of UI wiring, but security-sensitive and frequently patched logic must stay updatable via npm.

## Decision

- CLI supports **package**, **source**, and **hybrid** modes; **hybrid is recommended**.
- Suitable to generate: wrappers, compositions, styles, theme/config, framework facades, consumer variants.
- Must remain package-based: auth refresh/session/OAuth security flows, cross-tab session coordination, events, store internals, validation internals, critical a11y, provider adapters, shared bug-fix surfaces.
- No interactive **postinstall** prompts; CLI is explicit only.

## Alternatives Considered

1. Source-only (full copy) — security and bugfix lag
2. Package-only — less ownership of look-and-feel wiring
3. Postinstall interactive setup — surprising, CI-hostile, against our rules

## Reasons

Hybrid preserves updateability for critical logic while letting teams own presentation and integration files.

## Consequences

- Registry must track templates, checksums, and diffs
- Docs must teach what not to eject
- CLI safety features become release-critical

## Risks

- Users eject security code anyway — mitigate with docs, CLI warnings, and package-default paths
- Drift between generated wrappers and package APIs — mitigate with `diff`/`update` commands

## Migration Impact

None (greenfield). Changing recommended mode later is docs-level unless defaults change.

## Enforcement

Phase 17 CLI + registry tests; security model docs; registry checksum metadata.

## References

- `docs/architecture/source-generation.md`
- `docs/architecture/public-api-policy.md`
- ADR-0006
