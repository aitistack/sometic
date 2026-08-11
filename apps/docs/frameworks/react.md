# React

Wave A React adapters for Sometic. Thin wrappers over shared engines (`@sometic/dom`, `@sometic/forms`, `@sometic/store`, `@sometic/auth`, `@sometic/http`). Behavior stays framework-independent; React owns rendering and lifecycle.

## Overview

### When to use

- You ship a React 18 or 19 app and want native components with shared Sometic behavior.
- You need controlled / uncontrolled inputs, forms, overlays, store subscriptions, auth session hooks, or HTTP client context.

### When not to use

- No React runtime → use [Vanilla / elements](/frameworks/vanilla) or another adapter.
- You only need a store bind in Preact → prefer `@sometic/preact` (Experimental) or React if you already use React.
- Later-phase catalogs (data tables, command palette, date picker UI) are not in this package yet. See [What’s included](/guide/whats-included).

## Installation

Peer: `react` `^18 || ^19`.

<InstallCommands packages="@sometic/react" />


Add foundation packages as needed (`@sometic/theme`, `@sometic/store`, `@sometic/auth`, …). Workspace dependencies of `@sometic/react` install transitively when using a package manager that hoists correctly; pin peers explicitly in apps.

## Import map

Prefer **subpath imports** so unused families stay out of your bundle.

| Import                     | Exports                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `@sometic/react/button`    | `Button`, `IconButton`, `ToggleButton`, `ButtonGroup`, `AsyncButton`                                          |
| `@sometic/react/field`     | `Field`                                                                                                       |
| `@sometic/react/input`     | `Input`, `PasswordInput`, `OtpInput`, `NumberInput`, `FileInput`, `MaskedInput`, `CurrencyInput`, `DateInput` |
| `@sometic/react/form`      | `Form`, `FormProvider`, `useForm`, `useFormContext`, `useFormField`, `useFormState`, `useFieldArray`          |
| `@sometic/react/selection` | `Checkbox`, `Radio`, `Select`, `Switch`                                                                       |
| `@sometic/react/overlay`   | `Alert`, `Dialog`, `Popover`, `Tooltip`, `ToastRegion`                                                        |
| `@sometic/react/store`     | `useStore`                                                                                                    |
| `@sometic/react/auth`      | `AuthProvider`, `useAuth`, `useSession`, `useCan`                                                             |
| `@sometic/react/http`      | `HttpProvider`, `useHttp`                                                                                     |
| `@sometic/react`           | Root barrel (prefer subpaths)                                                                                 |

## Usage

### Button

```tsx
import { Button, AsyncButton } from "@sometic/react/button";

export function SaveActions() {
    return (
        <>
            <Button type="button" variant="primary">
                Save
            </Button>
            <AsyncButton
                action={async (signal) => {
                    const response = await fetch("/api/save", { signal });
                    if (!response.ok) {
                        throw new Error("Save failed");
                    }
                    return response.json();
                }}
            >
                Save async
            </AsyncButton>
        </>
    );
}
```

### Input and field

```tsx
import { Field } from "@sometic/react/field";
import { Input, PasswordInput } from "@sometic/react/input";

export function LoginFields() {
    return (
        <>
            <Field label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" autoComplete="email" />
            </Field>
            <Field label="Password" htmlFor="password">
                <PasswordInput id="password" name="password" autoComplete="current-password" />
            </Field>
        </>
    );
}
```

### Form

```tsx
import { Form, useForm } from "@sometic/react/form";
import { Input } from "@sometic/react/input";
import { Button } from "@sometic/react/button";

type Values = { email: string };

export function SignupForm() {
    const form = useForm<Values>({
        defaultValues: { email: "" },
    });

    return (
        <Form
            form={form}
            onValid={async (values) => {
                await fetch("/api/signup", {
                    method: "POST",
                    body: JSON.stringify(values),
                });
            }}
        >
            <Input name="email" type="email" />
            <Button type="submit">Create account</Button>
        </Form>
    );
}
```

### Overlay

```tsx
import { Dialog, Alert } from "@sometic/react/overlay";
import { Button } from "@sometic/react/button";
import { useState } from "react";

export function ConfirmDialog() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button type="button" onClick={() => setOpen(true)}>
                Open
            </Button>
            <Dialog open={open} onOpenChange={setOpen} titleId="confirm-title">
                <h2 id="confirm-title">Confirm</h2>
                <Alert>This action cannot be undone from the client alone.</Alert>
                <Button type="button" onClick={() => setOpen(false)}>
                    Close
                </Button>
            </Dialog>
        </>
    );
}
```

Dialog uses the shared modal overlay controller (focus trap, body scroll lock, Escape dismiss). Outside press does not dismiss in the current beta. Pass `titleId` / `descriptionId` or an accessible name. See [Beta maturity](/releases/beta).

### Store

```tsx
import { createStore } from "@sometic/store";
import { useStore } from "@sometic/react/store";
import { Button } from "@sometic/react/button";

const counterStore = createStore({ count: 0 });

export function Counter() {
    const count = useStore(counterStore, (state) => state.count);
    return (
        <Button
            type="button"
            onClick={() => counterStore.update((state) => ({ count: state.count + 1 }))}
        >
            {count}
        </Button>
    );
}
```

`useStore` integrates with `useSyncExternalStore`. Pass a selector (and optional equality function) to limit re-renders. Dispose long-lived stores when the app tears down.

### Auth

```tsx
import { AuthProvider, useAuth, useSession, useCan } from "@sometic/react/auth";
import { createAuth, requirePermission } from "@sometic/auth";
import type { ReactNode } from "react";

const auth = createAuth({/* provider + session options */});

export function AppAuth({ children }: { children: ReactNode }) {
    return <AuthProvider auth={auth}>{children}</AuthProvider>;
}

export function SessionBadge() {
    const controller = useAuth();
    const session = useSession();
    const canEdit = useCan(requirePermission("post:edit"));
    return (
        <span>
            {session.status} · canEdit={String(canEdit)} ·{" "}
            <button type="button" onClick={() => void controller.signOut()}>
                Sign out
            </button>
        </span>
    );
}
```

`AuthProvider` accepts either `auth` (an `AuthController`) or `options` (`CreateAuthOptions`). `useAuth()` returns the controller from context. `useSession` / `useCan` can take an optional controller override.

Wire a concrete provider package (`@sometic/auth-local`, Firebase, Supabase, OIDC) at the auth core boundary. Client auth is UX orchestration; enforce authorization on the server.

### HTTP

```tsx
import { HttpProvider, useHttp } from "@sometic/react/http";
import { createHttp } from "@sometic/http";
import type { ReactNode } from "react";

const http = createHttp({
    baseUrl: "/api",
});

export function AppHttp({ children }: { children: ReactNode }) {
    return <HttpProvider client={http}>{children}</HttpProvider>;
}

export function LoadProfile() {
    const client = useHttp();
    return (
        <button
            type="button"
            onClick={() => {
                void client.get("/me");
            }}
        >
            Load
        </button>
    );
}
```

`HttpProvider` accepts `client` or `options`. `useHttp()` returns the `HttpClient` from context.

## How it works

- Components call shared controllers from feature packages; they do not reimplement validation, focus, or auth refresh.
- Styling stays unstyled by default: pass `className`, `classes`, `styles`, or theme CSS variables.
- Controllable props follow Sometic conventions: `value` / `defaultValue` / `onValueChange` where applicable.
- No browser globals at import time. Safe to import in SSR modules; attach DOM-only work in effects or event handlers.

## SSR notes

- Importing `@sometic/react/*` does not touch `window` or `document`.
- Create auth / HTTP / store instances in module scope only when they are SSR-safe (no `localStorage` at construction without an injected storage). Prefer per-request or client-only creation when using browser storage.
- Custom elements are a separate path (`@sometic/elements`). Do not register CEs during SSR; use React components on the server and hydrate with the same props.
- Overlays that lock scroll or move focus should open only after mount.

See also [SSR guide](/guide/ssr).

## Recipes

### Controlled input with store

```tsx
const formStore = createStore({ email: "" });

function EmailField() {
    const email = useStore(formStore, (s) => s.email);
    return (
        <Input
            name="email"
            value={email}
            onValueChange={(next) => formStore.set({ email: next })}
        />
    );
}
```

### Tree-shake one family

```ts
import { Button } from "@sometic/react/button";
// avoid: import { Button } from "@sometic/react";
```

### Theme + React

Install `@sometic/theme`, apply CSS variables on a root element, and style components with your design system. See [Theming](/theming/).

## Edge cases

- Multiple React roots sharing one store: fine if you `dispose()` once when nothing else needs the store.
- Strict Mode double-mount: controllers used inside effects must clean up with the effect return.
- `exactOptionalPropertyTypes`: omit optional props instead of passing `undefined` unless the prop type allows it.
- AsyncButton: abort via the provided `AbortSignal`; do not ignore cancellation.

## FAQ

### Do I need `@sometic/elements` in a React app?

No. Use `@sometic/react` components. Elements are for Vanilla / multi-framework HTML hosts.

### Can I use React with Preact compat?

Not a claimed support path. Use `@sometic/react` with React, or Experimental `@sometic/preact` for store bind only.

### Where is Menu / Combobox / Tabs?

Deferred. Do not treat Popover or Select as those APIs. Track [Beta maturity](/releases/beta).

### Why subpath imports?

Keeps button-only apps from pulling form / overlay / auth code. Matches package `exports` in `@sometic/react`.

### How does `useStore` relate to Zustand?

Same external-store idea, Sometic-owned core, shared with Vue and Vanilla. See [Store](/stores/store).

### Are peers bundled?

No. `react` is a peer. Do not expect the adapter to ship a React runtime.

### What about React Server Components?

Client components only for interactive adapters. Keep engines and config in shared modules that avoid browser APIs at import time.

### TypeScript version?

Packages target modern TypeScript with strict flags. Use the declarations shipped next to `dist`.

## Related

- [Components](/components/)
- [Stores](/stores/)
- [Beta maturity](/releases/beta)
- [Vue](/frameworks/vue)
- [Compatibility](/frameworks/compatibility)
- [SSR](/guide/ssr)
