# Tree shaking

**Tree shaking** is your bundler’s ability to drop unused exports from the production bundle. Sometic packages ship as ESM with intentional `exports` maps and, where safe, `"sideEffects": false`, so unused surfaces stay out of your app.

## Overview

Import only the surface you need. Subpath entries keep unused controls and engines out of the bundle.

```ts
// Prefer: one component entry
import { Button } from "@sometic/react/button";

// Avoid when you only need Button: a root barrel that re-exports many surfaces
import { Button } from "@sometic/react";
```

The same pattern applies to Vue, Elements registration entries, store subpaths, and theme presets.

## Subpath map (representative)

| Package             | Example subpaths                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `@sometic/react`    | `/button`, `/input`, `/form`, `/overlay`, `/structure`, `/store`, `/auth`, `/http`, `/head` |
| `@sometic/vue`      | matching control and service entries                                                        |
| `@sometic/elements` | `/button`, `/input`, `/structure`, … registration modules                                   |
| `@sometic/store`    | `/persistent`, `/cross-tab`                                                                 |
| `@sometic/styling`  | `/classes`, `/styles`, `/slots`, `/state`, `/polymorphic`                                   |
| `@sometic/theme`    | `/tokens`, `/css-variables`, `/contrast`, `/system`, `/presets`                             |
| `@sometic/forms`    | drafts, feedback, a11y helpers as documented                                                |
| `@sometic/head`     | document head / SEO controller                                                              |

Always check the package `exports` field and the live docs page for the entry you need. Declaration files remain the signature source of truth. See [API reference](/api/).

## sideEffects

Most logic packages set `"sideEffects": false` so bundlers can prune unused files. Exceptions exist when an entry’s purpose is registration or CSS:

- Custom element registration modules perform registration when executed in the browser; import only the elements you use.
- CSS files are side-effectful by nature; import them explicitly.

If you wrap registration or CSS in your own package, do not mark those entries as side-effect-free when you rely on the import running.

## Optional peers stay optional

Heavy or framework-specific code ships as separate packages or peer-backed adapters:

| Concern                    | Package                                    |
| -------------------------- | ------------------------------------------ |
| Immer mutators             | `@sometic/store-immer`                     |
| Firebase / Supabase / OIDC | `@sometic/auth-*`                          |
| Day.js / date-fns          | `@sometic/date-dayjs`, `@sometic/date-fns` |
| Framework UI               | `@sometic/react`, `@sometic/vue`, …        |

Installing auth core does not pull provider SDKs. Installing store does not pull Immer.

## Size budgets (gzip goals)

Architecture targets (goals, not runtime guarantees on every commit):

| Area            | Goal     |
| --------------- | -------- |
| Core utils      | ≤ 1.5 KB |
| Events          | ≤ 1 KB   |
| Store           | ≤ 1.5 KB |
| Styling         | ≤ 2 KB   |
| Button behavior | ≤ 1.5 KB |
| React button    | ≤ 2 KB   |
| Input           | ≤ 3 KB   |
| Theme           | ≤ 3 KB   |
| Auth core       | ≤ 8 KB   |
| Head            | ≤ 4 KB   |

Prefer subpath imports and avoid presets on the theme root when you only need the controller.

## Bundler tips

**Works best with:** modern ESM, `package.json` `exports`, and production minification (Vite, webpack 5+, Rollup, esbuild, Parcel).

See also [Bundlers](/concepts/bundlers).

**Watch for:**

- App-level barrels that re-export every Sometic component.
- Dynamic `import(variable)` that prevents static analysis.
- Accidentally importing a registration module for every custom element when you only need one.

## FAQ

**Is the root export forbidden?** No. Use it when you intentionally need several symbols and accept the graph. Subpaths are the default recommendation for apps.

**Do Experimental Wave B/C packages tree-shake the same way?** They follow the same ESM and exports discipline; maturity is about API completeness, not bundling format. See [Framework adapters](/concepts/framework-adapters).

**Why are presets on a subpath?** To protect the theme root size budget while still shipping optional starter tokens.

**Where do I see package roles?** [Package index](/api/packages).

## Related links

- [Bundlers](/concepts/bundlers)
- [Architecture](/concepts/architecture)
- [Package index](/api/packages)
- [Design tokens](/concepts/design-tokens)
- [Store](/stores/store)
- [Frameworks](/frameworks/)
- [Beta maturity](/releases/beta)
