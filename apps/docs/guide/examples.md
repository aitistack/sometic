---
description: >-
    Unpublished. Invoice Desk example apps are parked. Do not add this page to
    VitePress nav or sidebar until examples are reopened.
---

<!-- Parked: srcExclude in apps/docs/.vitepress/config.ts. See .cursor/context/examples-paused.md -->

# Examples

Invoice Desk is one small authenticated workspace implemented three times: React, Vue, and Vanilla (DOM plus shipped custom elements). The three apps share a private kit for types, seed users, validators, and the in-memory API. `createSometicApp` owns the spine: session, HTTP, query, theme, a notes feature flag, and editor drafts.

Each app styles the **same unstyled Sometic components** with a different consumer styling system, so you can see the product promise in the browser: React uses Tailwind CSS, Vue uses hand-written CSS against `data-slot` and `data-state`, and Vanilla uses Bootstrap.

Clone the [Sometic repository](https://github.com/aitistack/sometic), install, and build packages first (`pnpm install` then `pnpm build`).

## When to use

- You want a production-shaped composition, not a single-component snippet
- You need to see session epoch, query cache, and form drafts clear on sign-out
- You are choosing React, Vue, or Vanilla and want the same product behavior
- You want to see unstyled Sometic components dressed with Tailwind, plain CSS, or Bootstrap

## When not to use

- You only need a button or dialog: use the component pages and in-page demos
- You need a real backend, OAuth, or hosted flags: this mock API and test auth are local only
- You need a `sometic-*` data table: that custom element is not shipped. Vanilla binds the data-table engine in Light DOM

## Run

```bash
pnpm example:invoice:react
```

```bash
pnpm example:invoice:vue
```

```bash
pnpm example:invoice:vanilla
```

Ports: React `http://127.0.0.1:5210`, Vue `http://127.0.0.1:5211`, Vanilla `http://127.0.0.1:5212`.

| App     | Port | Styling system                             | Look                                      |
| ------- | ---- | ------------------------------------------ | ----------------------------------------- |
| React   | 5210 | Tailwind CSS utilities on slot classes     | Indigo SaaS shell                         |
| Vue     | 5211 | Plain CSS + `data-slot` selectors          | Warm paper ledger                         |
| Vanilla | 5212 | Bootstrap 5 on layout and `sometic-button` | Classic Bootstrap cards, table, and forms |

Sign in as Ada (`ada@invoice.example` / `invoice-desk`) or Ben (`ben@invoice.example` / `invoice-desk`). Invoices are scoped to the signed-in user. Each login screen also has Ada and Ben shortcuts that fill the Sometic fields.

Source:

- `apps/example-invoice-react`
- `apps/example-invoice-vue`
- `apps/example-invoice-vanilla`
- `apps/example-invoice-kit`

## Usage

The spine is identical. Adapters only mount UI.

::: code-group

```ts [React]
import { createInvoiceDeskRuntime } from "@sometic/example-invoice-kit";
import { AuthProvider } from "@sometic/react/auth";
import { QueryClientProvider } from "@sometic/react/query";

const runtime = createInvoiceDeskRuntime();

<AuthProvider auth={runtime.auth}>
    <QueryClientProvider client={runtime.app.query}>{/* Invoice Desk UI */}</QueryClientProvider>
</AuthProvider>;
```

```ts [Vue]
import { createInvoiceDeskRuntime } from "@sometic/example-invoice-kit";
import { useAuth } from "@sometic/vue/auth";
import { provideQueryClient } from "@sometic/vue/query";

const runtime = createInvoiceDeskRuntime();
const { session } = useAuth(runtime.auth);
provideQueryClient(runtime.app.query);
```

```ts [Vanilla]
import { createInvoiceDeskRuntime } from "@sometic/example-invoice-kit";
import { createDataTableController } from "@sometic/dom/data-table";
import { registerButtonElements } from "@sometic/elements/button";

registerButtonElements();
const runtime = createInvoiceDeskRuntime();
const table = createDataTableController({
    columns: [/* number, customer, amount, status */],
    getRowId: (row) => row.id,
    rows: [],
});
```

```ts [Custom Elements (Web Components)]
import { registerButtonElements } from "@sometic/elements/button";

registerButtonElements();
```

```html
<sometic-button type="button">Sign out</sometic-button>
```

There is no `sometic-data-table` element. The Vanilla app renders a Light DOM table from `@sometic/dom/data-table`.

```html [CDN Simple]
<!-- Invoice Desk is a workspace app, not a CDN bundle. -->
<!-- Use the React, Vue, or Vanilla app folders in the repository. -->
```

```js [CDN Module]
// Invoice Desk is not published as a CDN bundle.
// Clone the repository and run pnpm example:invoice:react (or vue / vanilla).
```

:::

## FAQ

- **Is this an npm package?** No. The kit and apps are private workspace folders. Copy them into your repo or start from `createSometicApp` as shown on [App Shell](/guide/app-shell).
- **Is the API real?** No. `createInvoiceDeskApi` is an in-memory `fetch` stand-in. Auth uses `createTestAuthProvider`.
- **Why two users?** To prove resource scoping. Ada never sees Ben's invoices after a user switch, because query cache drops on session epoch.
- **Where is the data-table custom element?** It is not shipped. React and Vue use `@sometic/react/data` and `@sometic/vue/data`. Vanilla uses the DOM controller.
- **Do these apps use the docs fonts?** No. They use system UI. React maps Tailwind utilities onto Sometic slot `classes`. Vue authors plain CSS against slots and state attributes. Vanilla applies Bootstrap classes around Light DOM and `sometic-button`.
- **Why three visual themes?** Cores stay unstyled. The examples exist to show that the same Field, Input, Button, Select, Switch, and DataTable engines can look like three different products.
- **Can I `sometic init` this?** Not in this release. The CLI still scaffolds hybrid wrappers; it does not copy Invoice Desk.

## Why this vs alternatives

| Option                                   | Strengths                              | Tradeoffs                                       |
| ---------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| Invoice Desk examples                    | Same product, three stacks, shared kit | Not a hosted demo URL                           |
| Component pages only                     | Fast, in-page demos                    | Do not show auth epoch or query composition     |
| A framework starter (CRA, Vite template) | Familiar                               | You re-wire auth, HTTP, and query yourself      |
| Full SaaS clone                          | Looks impressive                       | Hides the portable engines under product chrome |

## Related

- [Quick start](/guide/quick-start)
- [App Shell](/guide/app-shell)
- [App primitives](/guide/app-primitives)
- [What's included](/guide/whats-included)
- [Styling](/guide/styling)
- [Tailwind](/theming/tailwind)
- [Plain CSS](/theming/plain-css)
- [Bootstrap](/theming/bootstrap)
