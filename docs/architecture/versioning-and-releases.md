# Versioning, Releases, Governance, and Contribution

## Versioning

- Semantic Versioning for all public packages
- Independent package versioning via Changesets (packages may diverge)
- Coordinated releases allowed when cross-package APIs move together
- Pre-1.0: breaking changes allowed with clear changelogs; still prefer soft migrations
- 1.0+: breaking changes require major bump, migration docs, and deprecation window when practical

## Stability Labels

| Label          | Meaning                                                            |
| -------------- | ------------------------------------------------------------------ |
| `experimental` | May change without major; documented risk                          |
| `beta`         | Level 2+; feedback sought; breaking changes minimized but possible |
| `stable`       | Level 3; SemVer strictly honored                                   |

Do not mark unfinished modules stable.

## Release Strategy

- Changesets for changelog entries on user-facing changes
- CI must pass required gates before publish
- npm trusted publishing and provenance (Phase 24; OIDC only, see ADR-0024)
- Publication dry runs from Phase 1 scaffolding onward
- Git tags for releases where practical
- Telemetry-free default forever unless an explicit opt-in product decision (would need ADR)

## Deprecation Policy

Deprecated APIs must:

1. Be documented with replacement guidance
2. Remain for the promised window (minimum one minor for beta; one major cycle after 1.0 unless security forces faster removal)
3. Produce TypeScript `@deprecated` metadata
4. Appear in migration guides and changelogs

## Breaking Change Policy

Before breaking public APIs:

1. Search usages in-repo and review docs/tests
2. Prefer additive changes and deprecations
3. Add Changeset describing impact
4. Update consumer migration docs
5. Bump according to SemVer / pre-1.0 rules above

## First Public Beta Scope (frozen)

Core · Store · Events · Accessibility · Styling · Theme · Button · Input · Form Field · Validation · Form engine · Auth core · Local/Firebase/Supabase auth adapters · HTTP · React · Vue · Vanilla DOM · Web Components · CLI · Registry

Quality over breadth. All beta packages ≥ maturity Level 2 **and** satisfy `world-class-quality.md` (edge coverage, FAQ, comparison/why-this docs).

## Governance

- Architecture changes require ADR updates when material
- Phase completion reports are the historical record
- the project contributing guide Current Status must reflect the active phase
- Package ownership follows `package-map.md` boundaries

## Contribution Guide (initial)

1. Read the project contributing guide and relevant architecture docs
2. Do not skip phases or invent parallel package trees
3. Four-space indentation; no implementation comments
4. Add tests and docs with behavior
5. Run available validation commands
6. Use Changesets for publishable changes
7. Keep dependency direction downward
8. Security-sensitive changes need explicit review notes in the PR/phase report

Public CONTRIBUTING.md ships with Phase 1 monorepo README.

## Package Naming Conventions

- Scope: `@sometic/<name>`
- Names: lowercase kebab-case single purpose (`auth-firebase`, not `authFirebase`)
- Avoid vague names (`utils`, `helpers`, `common`) — prefer domain names
- Legacy: `@sometic/angularjs` only for AngularJS

## Related

- `public-api-policy.md`
- `docs/architecture/package-map.md`
- architecture context
