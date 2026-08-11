# Consumer documentation boundary

**Date:** 2026-08-05  
**ADR:** ADR-0012

## Decision

One public VitePress app at `apps/docs` is the **consumer-only** Sometic documentation site destined for `https://sometic.aitistack.com`.

Do not enable the GitHub Wiki; product docs ship only at `https://sometic.aitistack.com`.

## Included in VitePress

- Guide (product install/usage)
- Concepts
- Components, primitives, utilities, services, stores (shipped only)
- Authentication, theming, forms
- Frameworks that exist (vanilla, React, Vue)
- Migration (`from-aitistack-to-sometic`)
- Releases / changelog summaries for consumers
- Public API reference pages derived from shipped exports

## Excluded from VitePress

- Repository architecture trees (`docs/architecture/`, `docs/decisions/`) are for contributors cloning the monorepo; they are not pages on the public docs site
- Maintainer-only release checklists and internal phase reports are not published to GitHub or VitePress
- Contributor monorepo setup, release tooling internals, CI secrets, publishing credentials

## Dual trees

Canonical **consumer** content for the site lives under `apps/docs/`.  
VitePress must not depend on maintainer-only trees for the public build.

## Search / sitemap

Index only consumer Markdown under `apps/docs` (excluding any internal stubs). Maintainer Markdown outside `apps/docs` is never in the public search index.
