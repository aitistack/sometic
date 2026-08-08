# Releases

Sometic publishes under the **`@sometic`** npm scope. Custom elements use the **`sometic-*`** prefix. Consumer documentation and public APIs use the Sometic identity only.

## Current track

**Public beta:** packages target a **`0.1.0-beta`** publish line. Workspace package.json files may still show `0.0.x` until the first Changesets version publish lands on the registry.

| Resource                         | Purpose                                                 |
| -------------------------------- | ------------------------------------------------------- |
| [Beta maturity](/releases/beta)  | Stability labels, supported runtimes, known limitations |
| [Changelog](/releases/changelog) | Identity narrative and thematic history from Changesets |

**Maturity source of truth:** always prefer [Beta maturity](/releases/beta) over informal README claims.

## What “beta” means here

- APIs are usable and covered by tests for Wave A surfaces.
- Breaking changes may still occur in `0.x` minors; they are called out in Changesets and changelog notes.
- Experimental Wave B/C adapters are opt-in and incomplete relative to React / Vue / Elements.
- Deferred catalogs such as data tables, command palette, and date/time picker UI remain out of scope for this beta (Menu, Combobox, Tabs, Drawer ship — see [What’s included](/guide/whats-included)).

## Versioning policy (summary)

- Semantic Versioning per package via Changesets (versions may diverge).
- Coordinated bumps when cross-package contracts move together.
- Pre-1.0: prefer soft migrations, but breaking changes are allowed with clear notes.
- Typed deprecations and migration notes when APIs are retired.

## How we record changes

Each user-facing change should land with a Changeset. Themes from recent Changesets are summarized on the [Changelog](/releases/changelog) page. Per-package `CHANGELOG.md` files accumulate when versions are published.

## Feedback

Use the repository GitHub issue templates (**Bug report** / **Feature request**). Include reproduction steps, package versions, and framework.

## Related links

- [Beta maturity](/releases/beta)
- [Changelog](/releases/changelog)
- [Package index](/api/packages)
- [Architecture](/concepts/architecture)
