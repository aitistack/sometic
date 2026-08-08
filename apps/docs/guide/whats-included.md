# What’s included (beta)

Honest inventory of the public beta. If it is not listed under **Included**, do not assume it ships yet.

## Included (Wave A, production path)

| Area                  | Packages / surfaces                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation            | `core`, `events`, `store`, `store-immer`, `styling`, `theme`, `accessibility`, `positioning`, `dom`, `validation`, `validation-zod`, `validation-yup`, `date-*`, **`head`** |
| Application           | `forms`, `auth`, `auth-local`, `auth-firebase`, `auth-supabase`, `auth-oidc`, `http`, **`query`**, **`head`**, **`app-shell`**                                                                                                                                                                                                                                                                                                                      |
| UI engines + adapters | Button family, Field/Input family, Selection (Checkbox, Switch, Radio, Select, **Combobox**), Overlay (Dialog, Popover, Tooltip, Toast, Alert, **Menu**, **Context menu**, **Drawer**), Structure (**Tabs**, **Accordion**, **Breadcrumb**), Feedback (**Progress**, **Spinner**, **Skeleton**, **Badge**), Form adapters                                                                                                                                               |
| Adapters              | `@sometic/react` (full Wave A components), `@sometic/vue` (button/field/input/form/overlay Dialog family; structure/selection often resolve re-exports; see each component page), `@sometic/elements` (CEs below)                                                                                                                                                                                                                                                         |
| Elements CEs (honest) | **Shipped:** button family, field/input family, form, selection (checkbox/switch/radio/select, **not** combobox), overlay (dialog/popover/tooltip/toast/alert, **not** menu/context-menu/drawer), structure feedback (**`sometic-badge`**, **`sometic-progress`**, **`sometic-spinner`**, **`sometic-skeleton`**). **Not shipped as CEs:** Menu, Context menu, Drawer, Tabs, Accordion, Breadcrumb, Combobox: use React or `@sometic/dom` controllers/resolve in Vanilla. |
| Tooling               | `@sometic/cli`, `@sometic/registry` (`init` / `add` / `list`, hybrid mode)                                                                                                                                                                                                                                                                                                                                                                                                |

## Experimental

| Surface                        | Reality today                                  |
| ------------------------------ | ---------------------------------------------- |
| Angular, Svelte, Solid, Preact | Store-bind foundation, not full component kits |
| Alpine, jQuery, HTMX           | Store + button bind depth                      |

Prefer React, Vue, or Elements for production apps in this beta.

## Deferred (later phases)

| Area                  | Examples                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rich selection        | Autocomplete polish, Multi-select, Tags, Sliders, Color picker, Date/Time **picker UI**                                                                                                     |
| Navigation            | Command palette, Tree, Pagination, Stepper                                                                                                                                                  |
| Data & app primitives | Data **table** engines, query **builders** / catalogs, feature flags, offline queue, undo/redo. **`@sometic/query` (server-state cache) and `@sometic/app-shell` (System composition) ship** in this beta; see [Query](/utilities/query) and [App Shell](/guide/app-shell) |

See [Beta maturity](/releases/beta) for stability labels and known limitations.

## Related

- [Why Sometic](/guide/why-sometic)
- [Comparison](/guide/comparison)
- [Components](/components/)
- [Head / SEO](/utilities/head)
- [Query](/utilities/query)
- [App Shell](/guide/app-shell)
