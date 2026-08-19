# Releases

Sometic publishes under the **`@sometic`** npm scope. Custom elements use the **`sometic-*`** prefix. Consumer documentation and public APIs use the Sometic identity only.

## Current track

**Public beta.** Maturity labels live on [Beta maturity](/releases/beta). Each package versions independently via Changesets. Do not treat a `1.x` npm number as Level 3 stable, and do not look for a single `0.1.0-beta` line across the scope.

| Resource                         | Purpose                                                    |
| -------------------------------- | ---------------------------------------------------------- |
| [Beta maturity](/releases/beta)  | Stability labels, supported runtimes, known limitations    |
| [Upgrade](/releases/upgrade)     | How breaking changes are recorded and how to bump packages |
| [Changelog](/releases/changelog) | Identity narrative and thematic history from Changesets    |

**Maturity source of truth:** always prefer [Beta maturity](/releases/beta) over informal README claims. **Inventory source of truth:** [What’s included](/guide/whats-included).

## What “beta” means here

- Wave A APIs are usable and covered by tests.
- Breaking changes may still occur; they are called out in Changesets and changelog notes.
- Experimental Wave B/C adapters are opt-in and incomplete relative to React / Vue / Elements.
- Deferred items are listed on [What’s included](/guide/whats-included). Shipped Menu, Combobox, Tabs, data-table engines, and app primitive engines are **not** deferred.

## Versioning policy (summary)

- Semantic Versioning per package via Changesets (versions may diverge).
- Coordinated bumps when cross-package contracts move together.
- Typed deprecations and migration notes when APIs are retired.
- Details: [Upgrade](/releases/upgrade).

## How we record changes

Each user-facing change should land with a Changeset. Themes from recent Changesets are summarized on the [Changelog](/releases/changelog) page. Per-package `CHANGELOG.md` files accumulate when versions are published.

## Feedback

Use the repository GitHub issue templates (**Bug report** / **Feature request**). Include reproduction steps, package versions, and framework. Security: GitHub Security Advisories, not public issues.

## Related links

- [Beta maturity](/releases/beta)
- [Upgrade](/releases/upgrade)
- [Changelog](/releases/changelog)
- [Package index](/api/packages)
- [Architecture](/concepts/architecture)
