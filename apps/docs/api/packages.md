# Package index

Public packages under the **`@sometic`** scope. Labels match [Beta maturity](/releases/beta). Links go to live consumer guides, not excluded package seed trees.

## Foundation (Beta)

| Package                 | Role                                              | Docs                                                                                         |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `@sometic/core`          | Environment, controllable state, shared contracts | [Primitives: core](/primitives/core), [Controlled state](/concepts/controlled-state)         |
| `@sometic/events`        | Typed event emitters                              | [Primitives: events](/primitives/events)                                                     |
| `@sometic/store`         | External store, selectors, persistence, cross-tab | [Store](/stores/store), [Stores hub](/stores/)                                               |
| `@sometic/store-immer`   | Optional Immer adapter (peer)                     | [Store Immer](/stores/store-immer)                                                           |
| `@sometic/styling`       | Class/style resolvers, slots, state attributes    | [Primitives: styling](/primitives/styling), [Styling slots](/concepts/styling-slots)         |
| `@sometic/theme`         | Tokens, CSS variables, theme controller           | [Theming](/theming/), [Design tokens](/concepts/design-tokens), [Theme store](/stores/theme) |
| `@sometic/accessibility` | Focus, keyboard, dismiss, announce helpers        | [Primitives: accessibility](/primitives/accessibility)                                       |
| `@sometic/positioning`   | First-party positioning engine                    | [Primitives: positioning](/primitives/positioning)                                           |
| `@sometic/dom`           | Behavior engines for controls and overlays        | [Primitives: dom](/primitives/dom), [Components](/components/)                               |
| `@sometic/validation`    | Validators, define schema, schema-adapter contracts | [Primitives: validation](/primitives/validation), [Forms validation](/forms/validation) |
| `@sometic/validation-zod` | Optional Zod `SchemaAdapter` (peer `zod`)          | [Primitives: validation](/primitives/validation)                                      |
| `@sometic/validation-yup` | Optional Yup `SchemaAdapter` (peer `yup`)          | [Primitives: validation](/primitives/validation)                                      |
| `@sometic/date-core`     | Date adapter contracts                            | [Primitives: date](/primitives/date)                                                         |
| `@sometic/date-native`   | Native date adapter                               | [Primitives: date](/primitives/date)                                                         |
| `@sometic/date-dayjs`    | Day.js adapter (optional peer)                    | [Primitives: date](/primitives/date)                                                         |
| `@sometic/date-fns`      | date-fns adapter (optional peer)                  | [Primitives: date](/primitives/date)                                                         |

## Application (Beta)

| Package                 | Role                                                 | Docs                                                      |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `@sometic/forms`         | Form engine, fields, drafts, feedback                | [Forms](/forms/), [Form component](/components/form)      |
| `@sometic/auth`          | Provider-independent auth orchestration              | [Authentication](/authentication/)                        |
| `@sometic/auth-local`    | Local REST provider                                  | [Local provider](/authentication/local-provider)          |
| `@sometic/auth-firebase` | Firebase provider                                    | [Firebase](/authentication/firebase)                      |
| `@sometic/auth-supabase` | Supabase provider                                    | [Supabase](/authentication/supabase)                      |
| `@sometic/auth-oidc`     | OIDC provider                                        | [OIDC](/authentication/oidc)                              |
| `@sometic/http`          | Fetch-first client, interceptors, auth refresh queue | [HTTP](/utilities/http), [Services: HTTP](/services/http) |
| `@sometic/query`         | Portable server-state cache, keys, mutations         | [Query](/utilities/query)                                 |
| `@sometic/head`          | Portable document head (title/meta/link/SSR)         | [Head / SEO](/utilities/head)                             |
| `@sometic/app-shell`     | System composition: createAppShell + epoch binds     | [App Shell](/guide/app-shell)                             |

## Wave A adapters (Beta)

| Package                    | Role                                         | Docs                                                       |
| -------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| `@sometic/react`            | React components and hooks (subpath exports) | [React](/frameworks/react), [Components](/components/)     |
| `@sometic/vue`              | Vue components and composables               | [Vue](/frameworks/vue), [Components](/components/)         |
| `@sometic/elements`         | `sometic-*` custom elements                   | [Vanilla](/frameworks/vanilla), [Components](/components/) |
| `@sometic/adapter-contract` | Shared adapter contracts                     | [Framework adapters](/concepts/framework-adapters)         |

## Tooling (Beta)

| Package                 | Role                              | Docs                              |
| ----------------------- | --------------------------------- | --------------------------------- |
| `@sometic/cli`           | `sometic` CLI (`init` / `add` / …) | [CLI guide](/guide/cli)           |
| `@sometic/registry`      | Template registry for CLI         | [CLI guide](/guide/cli)           |
| `@sometic/eslint-config` | Shareable ESLint config           | Package README / monorepo tooling |

## Wave B adapters (Experimental)

| Package           | Role                          | Docs                           |
| ----------------- | ----------------------------- | ------------------------------ |
| `@sometic/angular` | Angular store-bind foundation | [Angular](/frameworks/angular) |
| `@sometic/svelte`  | Svelte store-bind foundation  | [Svelte](/frameworks/svelte)   |
| `@sometic/solid`   | Solid store-bind foundation   | [Solid](/frameworks/solid)     |
| `@sometic/preact`  | Preact store-bind foundation  | [Preact](/frameworks/preact)   |

## Wave C adapters (Experimental)

| Package          | Role            | Docs                         |
| ---------------- | --------------- | ---------------------------- |
| `@sometic/alpine` | Alpine adapters | [Alpine](/frameworks/alpine) |
| `@sometic/jquery` | jQuery adapters | [jQuery](/frameworks/jquery) |
| `@sometic/htmx`   | HTMX adapters   | [HTMX](/frameworks/htmx)     |

## Deferred (later phases)

These catalogs are **not shipped yet**. Launch surfaces such as Menu, Combobox, Drawer, and Tabs **are** available; see [What’s included](/guide/whats-included).

| Area                                                | Status        |
| --------------------------------------------------- | ------------- |
| Autocomplete polish / Multi-select / Tags / Sliders | Deferred      |
| Date / Time **picker UI**                           | Deferred      |
| Command Palette / Tree / Pagination / Stepper       | Deferred      |
| Floating UI adapter (opt-in)                        | Future        |
| App primitives (flags, offline queue, …)            | Later roadmap |

## Dependency direction (reminder)

Adapters and integrations → features → foundation. Cores never import React, Vue, or other UI frameworks. See [Architecture](/concepts/architecture).

## Related links

- [API reference](/api/)
- [Beta maturity](/releases/beta)
- [Changelog](/releases/changelog)
- [Tree shaking](/concepts/tree-shaking)
- [Components](/components/)
- [Utilities](/utilities/)
