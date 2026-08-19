# Compatibility matrix

Support is claimed only where automated tests exist. Prefer Wave A for production apps. Wave B and Wave C are **Experimental**.

## Adapter packages

| Framework    | Package                                | Wave           | Claimed capabilities                                                                                                   | Peer                                  |
| ------------ | -------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| React        | `@sometic/react`                       | A              | button, field, input, form, selection, overlay (incl. menu/drawer), structure, `/data`, auth, http, query, store, head | `react` `^18 \|\| ^19`                |
| Vue          | `@sometic/vue`                         | A              | matching Wave A subpaths (some overlay hosts thinner than DOM/CE)                                                      | `vue` `^3.5`                          |
| Vanilla / WC | `@sometic/elements` (+ `@sometic/dom`) | A              | shipped `sometic-*` set in [What’s included](/guide/whats-included); remaining engines via `@sometic/dom`              | none (browser CE)                     |
| Angular      | `@sometic/angular`                     | B Experimental | `storeBind`                                                                                                            | `@angular/core` `^19` (optional peer) |
| Svelte       | `@sometic/svelte`                      | B Experimental | `storeBind`                                                                                                            | `svelte` `^5` (optional peer)         |
| Solid        | `@sometic/solid`                       | B Experimental | `storeBind`                                                                                                            | `solid-js` `^1.8` (optional peer)     |
| Preact       | `@sometic/preact`                      | B Experimental | `storeBind`                                                                                                            | `preact` `^10` (optional peer)        |
| Alpine.js    | `@sometic/alpine`                      | C Experimental | `storeBind`, `button`                                                                                                  | `alpinejs` `^3.14` (optional peer)    |
| jQuery       | `@sometic/jquery`                      | C Experimental | `storeBind`, `button`                                                                                                  | `jquery` `^3.7` (optional peer)       |
| HTMX         | `@sometic/htmx`                        | C Experimental | `storeBind`, `button`                                                                                                  | `htmx.org` `^2` (optional peer)       |

## Import maps (Wave A)

### `@sometic/react` / `@sometic/vue`

| Subpath                           | Typical exports                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `@sometic/{react\|vue}/button`    | `Button`, `IconButton`, `ToggleButton`, `ButtonGroup`, `AsyncButton`                                             |
| `@sometic/{react\|vue}/field`     | `Field`                                                                                                          |
| `@sometic/{react\|vue}/input`     | `Input`, `PasswordInput`, `OtpInput`, `NumberInput`, `FileInput`, `MaskedInput`, `CurrencyInput`, `DateInput`    |
| `@sometic/{react\|vue}/form`      | `Form`, `FormProvider`, `useForm`, `useFormContext`, `useFormField`, `useFormState`, `useFieldArray`             |
| `@sometic/{react\|vue}/selection` | `Checkbox`, `Radio`, `Select`, `Switch`, `Combobox` (Vue coverage: see [What’s included](/guide/whats-included)) |
| `@sometic/{react\|vue}/overlay`   | `Alert`, `Dialog`, `Popover`, `Tooltip`, `ToastRegion`, plus menu / context-menu / drawer where shipped          |
| `@sometic/{react\|vue}/structure` | `Tabs`, `Accordion`, `Breadcrumb`, `CommandPalette`, `Tree`, feedback primitives                                 |
| `@sometic/{react\|vue}/data`      | Data table, upload, schema form, permission matrix, notification center                                          |
| `@sometic/{react\|vue}/store`     | `useStore`                                                                                                       |
| `@sometic/{react\|vue}/auth`      | React: `AuthProvider`, `useAuth`, `useSession`, `useCan` · Vue: `useAuth`, `useSession`, `useCan`                |
| `@sometic/{react\|vue}/http`      | React: `HttpProvider`, `useHttp` · Vue: `useHttp`                                                                |
| `@sometic/{react\|vue}/query`     | Query hooks over `@sometic/query`                                                                                |
| `@sometic/{react\|vue}/head`      | Document head helpers                                                                                            |

Root `@sometic/react` and `@sometic/vue` re-export selected surfaces; prefer subpaths for tree-shaking.

### `@sometic/elements`

| Subpath                       | Role                          |
| ----------------------------- | ----------------------------- |
| `@sometic/elements/button`    | Button family custom elements |
| `@sometic/elements/input`     | Field / input custom elements |
| `@sometic/elements/form`      | Form element                  |
| `@sometic/elements/selection` | Selection elements            |
| `@sometic/elements/overlay`   | Overlay elements              |
| `@sometic/elements/auth`      | Auth status element           |
| `@sometic/elements/events`    | Shared typed event helpers    |

There is no `@sometic/elements/store` or `/http` subpath. Use `@sometic/store` and `@sometic/http` directly with Vanilla or Elements.

## Wave B / C honesty

- Wave B packages export only `create*StoreBind` (+ capability constants). No React-style component subpaths.
- Wave C adds button bind helpers and host lifecycle wiring. They do not ship form / overlay / auth UI adapters.
- CLI `--framework` today accepts `vanilla` \| `react` \| `vue` only. Angular / Svelte / Solid / Preact / Alpine / jQuery / HTMX are not CLI scaffold targets yet.

## Related

- [Frameworks hub](/frameworks/)
- [Components](/components/)
- [Stores](/stores/)
- [Beta maturity](/releases/beta)
- [Upgrade](/releases/upgrade)
