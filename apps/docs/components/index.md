# Components

Framework-native adapters and custom elements over shared Sometic behavior engines. Install the adapter you use (`@sometic/react`, `@sometic/vue`, or `@sometic/elements`) plus `@sometic/dom` when you need engines directly.

## Button family

| Component                                  | Summary                                                         |
| ------------------------------------------ | --------------------------------------------------------------- |
| [Button](/components/button)               | Native `<button>` with loading, slots, and shared styling state |
| [Icon button](/components/icon-button)     | Icon-only action that requires a non-empty accessible name      |
| [Button group](/components/button-group)   | `role="group"` layout for related actions                       |
| [Toggle button](/components/toggle-button) | Pressed/unpressed toggle with `aria-pressed`                    |
| [Async button](/components/async-button)   | Runs an abortable async `action` and owns loading state         |

## Field & text inputs

| Component                                    | Summary                                                     |
| -------------------------------------------- | ----------------------------------------------------------- |
| [Field](/components/field)                   | Label, description, control, and error with generated IDs   |
| [Form](/components/form)                     | React / Vue / `sometic-form` adapters over the forms engine |
| [Input](/components/input)                   | Controllable text-like native input with state attributes   |
| [Password input](/components/password-input) | Password field with show/hide reveal control                |
| [OTP input](/components/otp-input)           | Fixed-length one-time code input (`one-time-code`)          |

## Specialized inputs

| Component                                    | Summary                                                |
| -------------------------------------------- | ------------------------------------------------------ |
| [Number input](/components/number-input)     | Numeric value as `number \| null` with optional clamp  |
| [File input](/components/file-input)         | Native file picker emitting `File[]`                   |
| [Masked input](/components/masked-input)     | Pattern mask (`#` / `A` / `*`) with raw value callback |
| [Currency input](/components/currency-input) | Locale-aware currency display over a numeric value     |
| [Date input](/components/date-input)         | Date value via a pluggable `DateAdapter`               |

## Selection

| Component                        | Summary                               |
| -------------------------------- | ------------------------------------- |
| [Checkbox](/components/checkbox) | Boolean / indeterminate checkbox      |
| [Switch](/components/switch)     | Instant on/off switch semantics       |
| [Radio](/components/radio)       | Mutually exclusive radio option       |
| [Select](/components/select)     | Native select with controllable value |

## Overlay & feedback

| Component                      | Summary                                      |
| ------------------------------ | -------------------------------------------- |
| [Dialog](/components/dialog)   | Modal dialog with focus and dismiss behavior |
| [Popover](/components/popover) | Anchored non-modal popover                   |
| [Tooltip](/components/tooltip) | Hover/focus tooltip                          |
| [Toast](/components/toast)     | Toast queue and region                       |
| [Alert](/components/alert)     | Inline status alert                          |

## Launch essentials

| Component    | Docs                                     |
| ------------ | ---------------------------------------- |
| Drawer       | [Drawer](/components/drawer)             |
| Menu         | [Menu](/components/menu)                 |
| Context menu | [Context menu](/components/context-menu) |
| Tabs         | [Tabs](/components/tabs)                 |
| Accordion    | [Accordion](/components/accordion)       |
| Breadcrumb   | [Breadcrumb](/components/breadcrumb)     |
| Command palette | [Command palette](/components/command-palette) |
| Tree         | [Tree](/components/tree)                 |
| Combobox     | [Combobox](/components/combobox)         |
| Progress     | [Progress](/components/progress)         |
| Spinner      | [Spinner](/components/spinner)           |
| Skeleton     | [Skeleton](/components/skeleton)         |
| Badge        | [Badge](/components/badge)               |
| Status       | [Status](/components/status)             |
| Empty state  | [Empty state](/components/empty-state)   |
| Error state  | [Error state](/components/error-state)   |
| Offline state| [Offline state](/components/offline-state) |
| Conflict state | [Conflict state](/components/conflict-state) |

## Data & business

| Component | Docs |
| --------- | ---- |
| Data table | [Data table](/components/data-table) |
| Query builder | [Query builder](/components/query-builder) |
| Upload | [Upload](/components/upload) |
| Schema form | [Schema form](/components/schema-form) |
| Permission matrix | [Permission matrix](/components/permission-matrix) |
| Activity | [Activity](/components/activity) |
| Approval | [Approval](/components/approval) |
| Notification center | [Notification center](/components/notification-center) |

## Structure family docs

React and Vue both ship Tabs, Accordion, Breadcrumb, Command palette, Tree, and feedback primitives from `@sometic/react/structure` and `@sometic/vue/structure`. Custom elements are not shipped for the navigation surfaces; use those adapters or `@sometic/dom`.

- [Structure FAQ](/components/structure-faq)
- [Structure comparison](/components/structure-comparison)

