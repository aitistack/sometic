---
title: App scaffolds
description: Pasteable AI-agent prompts that scaffold full real-world apps on Sometic Wave A packages.
---

# App scaffolds

Full-app prompts for coding agents (Cursor, Claude, Copilot, and similar). Each **Copy Prompt** is a long-form scaffold brief: product definition, package inventory, repo layout, domain stubs, wiring recipe, ordered implementation steps, acceptance criteria, and docs to read. Paste the whole prompt; the agent must ask you to choose path **A / B / C / D1 / D2** before it builds, then follow the linked Sometic docs for exact APIs.

These are **not** live example apps. Paste **Copy Prompt** into your agent, then follow the linked docs. For surface-level prompts and `llms.txt`, see [Agents](/guide/agents).

Use the sticky index (or mobile chips) to jump between scaffolds. **What’s Included** opens a right drawer with the package checklist and the full prompt.

<AppScaffolds />

## Page FAQ

### Why prompts instead of example repos?

Public example apps are paused. Agent scaffolds keep discovery honest: you get a production-shaped brief without a demo product that over-promises UI.

### Will these invent packages?

No. Every prompt is scoped to [What’s included](/guide/whats-included). Missing custom elements and Experimental adapters are called out.

### Which path: A, B, C, D1, or D2?

Every scaffold prompt **requires** the agent to stop and ask before coding. The human must choose:

- **A)** React + `@sometic/react` (npm / Vite)
- **B)** Vue + `@sometic/vue` (npm / Vite)
- **C)** Vanilla + Web Components (`@sometic/elements` + `@sometic/dom`, npm / Vite)
- **D1)** Simple CDN (jsDelivr IIFE `<script src>`)
- **D2)** Modular CDN (jsDelivr ESM `type="module"`)

Agents must not assume or default a path. Only the chosen delivery family is used. As soon as you answer, the agent must start scaffolding in that same turn (not just acknowledge the choice).

### Why did my agent invent `signUp` / `createHead`?

Scaffold prompts now encode package API truth (`auth.register`, `createHeadController`, `head.set`, auth-local `/auth/register`, Vite `@` alias on both sides, `applyHead` / `applyThemeToElement` in bootstrap). Re-copy the latest **Copy Prompt** from this page; older pastes will keep producing those bugs.

### How do I use a scaffold with my agent?

Open **What’s Included**, copy the prompt (or use **Copy Prompt** on the card), paste it into your agent, answer **A / B / C / D1 / D2** when asked, then point the agent at the docs URLs listed in the drawer. Prefer `https://sometic.dev/llms.txt` if the agent needs a curated index.

### Do I need App Shell for every scaffold?

Session-shaped products (auth, SaaS, admin, portals) should use `createAppShell` / `createSometicApp`. Read each scaffold’s explanations: offline and CMS-lite scaffolds still compose System packages, but the prompt names the spine explicitly when epoch and dispose matter most.

### What about Experimental frameworks?

Wave B/C adapters (Angular, Svelte, Solid, Preact, Alpine, jQuery, HTMX) stay Experimental. These prompts offer Wave A paths **A / B / C / D1 / D2** only. Do not ask the agent to fill Experimental adapters to Wave A depth.

### Can I mix several scaffolds?

Yes for product modules (for example auth e2e plus SaaS dashboard), but keep one App Shell, one auth instance, and one query client. Do not spawn duplicate System graphs per feature.

### Related

- [Agents](/guide/agents)
- [App Shell](/guide/app-shell)
- [App primitives](/guide/app-primitives)
- [What’s included](/guide/whats-included)
- [Beta maturity](/releases/beta)
