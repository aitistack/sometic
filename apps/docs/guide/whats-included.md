# What’s included (beta)

Honest inventory of the public beta. If it is not listed under **Included**, do not assume it ships yet.

## Included (Wave A, production path)

| Area                  | Packages / surfaces                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation            | `core`, `events`, `store`, `store-immer`, `styling`, `theme`, `accessibility`, `positioning`, `dom`, `validation`, `validation-zod`, `validation-yup`, `date-*`, **`head`**                                                                                                                                                                                                                                                                                                                          |
| Application           | `forms`, `auth`, `auth-local`, `auth-firebase`, `auth-supabase`, `auth-oidc`, `http`, **`query`**, **`query-builder`**, **`data-table`**, **`upload`**, **`activity`**, **`approval`**, **`notifications`**, **`head`**, **`app-shell`**, **`feature-flags`**, **`drafts`**, **`commands`**, **`history`**, **`conflict`**, **`offline-queue`** (plus `createPermissionController` on `auth`)                                                                                                        |
| UI engines + adapters | Button family, Field/Input family, Selection (Checkbox, Switch, Radio, Select, **Combobox**), Overlay (Dialog, Popover, Tooltip, Toast, Alert, **Menu**, **Context menu**, **Drawer**), Structure (**Tabs**, **Accordion**, **Breadcrumb**, **Command palette**, **Tree**), Feedback (**Progress**, **Spinner**, **Skeleton**, **Badge**, **Status**), Data (**Data table**, **Upload**, **Permission matrix**, **Notification center**, **Schema form**), Form adapters                             |
| Adapters              | `@sometic/react` (Wave A including structure + **`/data`**), `@sometic/vue` (including structure + **`/data`**), `@sometic/elements` (CEs below)                                                                                                                                                                                                                                                                                                                                                     |
| Elements CEs (honest) | **Shipped:** button family, field/input family, form, selection (checkbox/switch/radio/select, **not** combobox), overlay (dialog/popover/tooltip/toast/alert, **not** menu/context-menu/drawer), structure feedback (**`sometic-badge`**, **`sometic-progress`**, **`sometic-spinner`**, **`sometic-skeleton`**). **Not shipped as CEs:** Menu, Context menu, Drawer, Tabs, Accordion, Breadcrumb, Command palette, Tree, Combobox: use React/Vue or `@sometic/dom` controllers/resolve in Vanilla. |
| Tooling               | `@sometic/cli`, `@sometic/registry` (`init` / `add` / `list`, hybrid mode)                                                                                                                                                                                                                                                                                                                                                                                                                           |

## Experimental

| Surface                        | Reality today                                  |
| ------------------------------ | ---------------------------------------------- |
| Angular, Svelte, Solid, Preact | Store-bind foundation, not full component kits |
| Alpine, jQuery, HTMX           | Store + button bind depth                      |

Prefer React, Vue, or Elements for production apps in this beta.

## Wave A surface matrix

Honest adapter coverage for production paths. **CE** means a `sometic-*` custom element. **DOM** means `@sometic/dom` controllers / resolve (always available for engines).

| Area                                                            | React           | Vue                    | CE                         | DOM                          |
| --------------------------------------------------------------- | --------------- | ---------------------- | -------------------------- | ---------------------------- |
| Button / Field / Selection (non-combobox)                       | Yes             | Yes                    | Yes                        | Yes                          |
| Overlay dialog/popover/tooltip/toast/alert                      | Yes             | Yes                    | Yes                        | Yes                          |
| Menu / Context menu / Drawer / Combobox                         | Yes             | Partial or not shipped | No                         | Yes                          |
| Tabs / Accordion / Breadcrumb / Command palette / Tree          | Yes             | Yes                    | No                         | Yes                          |
| Data table / Upload / Schema form / Permissions / Notifications | Yes (`/data`)   | Yes (`/data`)          | No                         | Yes                          |
| Auth / HTTP / Query / Store / App shell / App primitives        | Hooks + engines | Hooks + engines        | `sometic-auth-status` only | Engines + `createSometicApp` |

## Deferred

| Area              | Examples                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rich selection    | Autocomplete polish, Multi-select, Tags, Sliders, Color picker, Date/Time **picker UI**                                                                                               |
| Navigation        | Pagination, Stepper, Timeline, Nav Menu chrome, Split/Resizable panes                                                                                                                 |
| Data CEs          | No `sometic-*` custom elements for data-table / upload / matrix yet: use React/Vue `@sometic/*/data` or `@sometic/dom` resolve controllers in Vanilla.                                |
| App primitive CEs | No dedicated `sometic-*` elements for flags/drafts/commands/history/conflict/offline-queue yet: call the engines from Vanilla/React/Vue. See [App primitives](/guide/app-primitives). |

App primitives (`@sometic/feature-flags`, `@sometic/drafts`, `@sometic/commands`, `@sometic/history`, `@sometic/conflict`, `@sometic/offline-queue`, and `createPermissionController` on `@sometic/auth`) are included above as production engines.

See [Beta maturity](/releases/beta) for stability labels and known limitations.

## Related

- [Why Sometic](/guide/why-sometic)
- [Comparison](/guide/comparison)
- [Components](/components/)
- [App primitives](/guide/app-primitives)
- [Head / SEO](/utilities/head)
- [Query](/utilities/query)
- [App Shell](/guide/app-shell)
