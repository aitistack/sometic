# `@sometic/react`

Native React adapters and components powered by Sometic’s framework-independent behavior engines.

`@sometic/react` is the Wave A React surface for Sometic: thin components and hooks that bind shared engines (`@sometic/dom`, `@sometic/forms`, `@sometic/store`, `@sometic/auth`, `@sometic/http`, and related packages) into React props, refs, context, and `useSyncExternalStore`. It is not a visual design system. Styling stays optional through classes, styles, and tokens you own. Behavior (press handling, field state, form submit, session subscription, HTTP client access) lives in the engines so it stays portable across stacks.

Sometic exists so application behavior is not rewritten per framework. Controllers and resolvers stay in foundation and feature packages; React only owns rendering and lifecycle. That split keeps SSR-safe import rules, disposable cleanup, and native HTML semantics intact while you still get idiomatic React APIs (`forwardRef` buttons, form providers, auth context). If you already use React 18 or 19 and want shared Sometic behavior without forking business logic into components, this package is the primary entry.

Out of the box you get a full Wave A kit with tree-shakeable subpaths: button family (`Button`, `IconButton`, `ToggleButton`, `AsyncButton`, `ButtonGroup`), field and input variants, `useForm` / `Form` / field-array helpers, `AuthProvider` with `useAuth` / `useSession` / `useCan`, `HttpProvider` / `useHttp`, `useStore`, selection controls, overlays (dialog, menu, toast region, and more), structure primitives (tabs, accordion, progress), and document head helpers. Prefer subpath imports such as `@sometic/react/button` when you only need one surface.

In the ecosystem, React sits above the engines and beside Vue and Web Components as a production adapter target. Start from [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) for primitives, then engines such as [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) and [`@sometic/store`](https://www.npmjs.com/package/@sometic/store). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Adapter model: [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

Peer: `react` `^18 || ^19`.

```bash
pnpm add @sometic/react react
```

```bash
npm install @sometic/react react
```

```bash
yarn add @sometic/react react
```

## Usage

Button (engine-backed, native `<button>` semantics):

```tsx
import { Button } from "@sometic/react/button";

export function SaveAction() {
    return (
        <Button type="button" loading={false} onClick={() => {}}>
            Save
        </Button>
    );
}
```

Form + store subscription (second surface):

```tsx
import { Form, useForm, useFormField } from "@sometic/react/form";
import { useStore } from "@sometic/react/store";
import { createStore } from "@sometic/store";

const ui = createStore({ draftSaved: false });

function EmailField() {
    const field = useFormField("email");
    return (
        <input
            value={String(field.value ?? "")}
            onChange={(event) => field.setValue(event.target.value)}
            onBlur={field.onBlur}
        />
    );
}

export function ProfileForm() {
    const form = useForm({ defaultValues: { email: "" } });
    const draftSaved = useStore(ui, (state) => state.draftSaved);

    return (
        <Form
            form={form}
            onValid={(values) => {
                ui.set({ draftSaved: true });
                console.log(values.email, draftSaved);
            }}
        >
            <EmailField />
            <button type="submit">Submit</button>
        </Form>
    );
}
```

Auth is also available via `@sometic/react/auth` (`AuthProvider`, `useSession`, `useCan`) when you wire an `AuthController` or `createAuth` options.

## Peers / when not to use

- Requires a React peer. Without React, use [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom), [`@sometic/elements`](https://www.npmjs.com/package/@sometic/elements), or another adapter.
- Do not use this package as a CSS framework or theme kit. Pair with your styling system and optional [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme).
- Prefer `@sometic/vue` or Vanilla/elements if your app is not React. Wave B packages (`angular`, `svelte`, `solid`, `preact`) currently expose store-bind foundations, not this full component kit.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [React](https://sometic.aitistack.com/frameworks/react)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
