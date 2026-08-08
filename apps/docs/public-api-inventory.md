# Public API inventory (generation input)

Internal inventory for Phase 13 consumer docs. Not part of VitePress navigation.

## Packages

| Package                  | Primary exports (entry)                                                                           | Docs                           |
| ------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------ |
| `@sometic/core`          | environment, id, disposable, error, result, contracts, controllable-state, async-operation, utils | /primitives/core               |
| `@sometic/events`        | emitter APIs                                                                                      | /primitives/events             |
| `@sometic/store`         | createStore, persistence helpers                                                                  | /stores/store                  |
| `@sometic/store-immer`   | immer adapter                                                                                     | /stores/store-immer            |
| `@sometic/styling`       | class/style/slot resolvers                                                                        | /primitives/styling            |
| `@sometic/theme`         | createThemeController, tokens                                                                     | /theming/                      |
| `@sometic/accessibility` | focus/keyboard/dismissable/announcer                                                              | /primitives/accessibility      |
| `@sometic/positioning`   | computePosition, flip/shift, PositioningAdapter                                                   | /primitives/positioning        |
| `@sometic/dom`           | portal/scroll/observers + input/selection/overlay engines                                         | /primitives/dom                |
| `@sometic/validation`    | validators, composition                                                                           | /primitives/validation         |
| `@sometic/forms`         | form engine                                                                                       | /forms/                        |
| `@sometic/auth`          | createAuth, storage, test-provider                                                                | /authentication/               |
| `@sometic/auth-local`    | createLocalAuthProvider                                                                           | /authentication/local-provider |
| `@sometic/auth-firebase` | createFirebaseAuthProvider                                                                        | /authentication/firebase       |
| `@sometic/auth-supabase` | createSupabaseAuthProvider                                                                        | /authentication/supabase       |
| `@sometic/auth-oidc`     | createOidcAuthProvider                                                                            | /authentication/oidc           |
| `@sometic/http`          | createHttp, ./auth, ./retry                                                                       | /utilities/http                |
| `@sometic/elements`      | sometic-* custom elements                                                                         | /frameworks/vanilla            |
| `@sometic/react`         | Button/Input/Form/Auth/Http adapters                                                              | /frameworks/react              |
| `@sometic/vue`           | Vue adapters                                                                                      | /frameworks/vue                |
| `@sometic/alpine`        | Alpine store/button Wave C                                                                        | /frameworks/alpine             |
| `@sometic/jquery`        | jQuery store/button Wave C                                                                        | /frameworks/jquery             |
| `@sometic/htmx`          | HTMX store/button Wave C                                                                          | /frameworks/htmx               |
| `@sometic/registry`      | CLI templates + checksums                                                                         | /guide/cli                     |
| `@sometic/cli`           | `sometic` CLI                                                                                     | /guide/cli                     |
| `@sometic/date-*`        | date adapters                                                                                     | /primitives/date               |
| `@sometic/eslint-config` | shareable ESLint config                                                                           | /api/packages                  |

## Components

Button, IconButton, ButtonGroup, ToggleButton, Input, Field, PasswordInput, OtpInput, Checkbox, Switch, Radio, Select, Dialog, Popover, Tooltip, Toast, Alert, Form element, Auth status element.

## Brand asset mapping

| VitePress path   | Source                                | Use               |
| ---------------- | ------------------------------------- | ----------------- |
| `/logo.png`      | brand `logo-dark.png` (dark wordmark) | Light mode navbar |
| `/logo-dark.png` | brand `logo.png` (light wordmark)     | Dark mode navbar  |
| `/icon.png`      | brand `icon.png`                      | Favicon / hero    |
