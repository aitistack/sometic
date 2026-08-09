# Sometic migration — final reference audit

**Date:** 2026-08-05

## Allowed remaining AitiStack / aitistack references

| Location                                     | Reason                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| Parent-brand footers / README attribution    | “Sometic by aitiStack”                                                   |
| `github.com/aitistack/sometic`               | Repository URL until org move                                            |
| `demo@aitistack.dev` playground emails       | Demo identity on parent domain                                           |
| release history historical reports           | Historical record                                                        |
| `docs/migrations/*`, consumer migration page | Old→new mapping examples                                                 |
| ADR-0012 and older ADRs                      | Decision history                                                         |
| `.changeset/phase-1`…`phase-12`              | May still mention old names in prose; Phase 13 changeset uses `@sometic` |
| `tooling/release/sometic-migrate.mjs`        | One-time migration script (from→to pairs)                                |
| `tooling/release/docs-scope-check.mjs`       | Detector string                                                          |

## Not allowed (verified absent in active source)

- Active `@aitistack/` imports in `packages/*/src`, apps playground/src, tests consumers
- Publishable `package.json` names under `@aitistack`
- Current VitePress title “AitiStack”
- Active `aiti-*` custom element registrations in elements source

## Scan commands used

```bash
rg "@aitistack/" packages apps/playground-vanilla/src tests
rg "aiti-button|AitiButton" packages/elements/src
```
