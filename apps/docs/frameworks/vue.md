# Vue

Wave A Vue 3 adapters for Sometic. Thin SFC-friendly wrappers over the same engines as React and Elements. One behavior model; Vue owns reactivity and templates.

## Overview

### When to use

- Vue `^3.5` apps that want native components and composables with shared Sometic behavior.
- Forms, inputs, overlays, store subscriptions, auth session refs, and HTTP client access.

### When not to use

- Vue 2 / Options-only legacy stacks without a Vue 3 migration path.
- No Vue runtime → [Vanilla / elements](/frameworks/vanilla).
- Data tables and date picker UI are not shipped yet. See [What’s included](/guide/whats-included).

## Installation

Peer: `vue` `^3.5`.

<InstallCommands packages="@sometic/vue" />

## Import map

Prefer **subpath imports**.

| Import                   | Exports                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `@sometic/vue/button`    | `Button`, `IconButton`, `ToggleButton`, `ButtonGroup`, `AsyncButton`                                          |
| `@sometic/vue/field`     | `Field`                                                                                                       |
| `@sometic/vue/input`     | `Input`, `PasswordInput`, `OtpInput`, `NumberInput`, `FileInput`, `MaskedInput`, `CurrencyInput`, `DateInput` |
| `@sometic/vue/form`      | `Form`, `FormProvider`, `useForm`, `useFormContext`, `useFormField`, `useFormState`, `useFieldArray`          |
| `@sometic/vue/selection` | `Checkbox`, `Radio`, `Select`, `Switch`                                                                       |
| `@sometic/vue/overlay`   | `Alert`, `Dialog`, `Popover`, `Tooltip`, `ToastRegion`                                                        |
| `@sometic/vue/structure` | `Tabs`, `TabTrigger`, `TabPanel`, `Accordion`, `AccordionItem`, `Breadcrumb`, `BreadcrumbItem`, `CommandPalette`, `Tree`, `Badge`, `Progress`, `Spinner`, `Skeleton` |
| `@sometic/vue/store`     | `useStore`                                                                                                    |
| `@sometic/vue/auth`      | `useAuth`, `useSession`, `useCan`                                                                             |
| `@sometic/vue/http`      | `useHttp`                                                                                                     |
| `@sometic/vue`           | Root barrel (prefer subpaths)                                                                                 |

Note: Vue auth / HTTP expose composables (`useAuth`, `useHttp`) rather than React-style provider components. Pass a shared `AuthController` / `HttpClient` (or create options) into the composable.

## Usage

### Button

```vue
<script setup lang="ts">
import { Button, AsyncButton } from "@sometic/vue/button";

async function save(signal: AbortSignal) {
    const response = await fetch("/api/save", { signal });
    if (!response.ok) {
        throw new Error("Save failed");
    }
    return response.json();
}
</script>

<template>
    <Button type="button">Save</Button>
    <AsyncButton :action="save">Save async</AsyncButton>
</template>
```

### Input and field

```vue
<script setup lang="ts">
import { Field } from "@sometic/vue/field";
import { Input, PasswordInput } from "@sometic/vue/input";
</script>

<template>
    <Field label="Email" html-for="email">
        <Input id="email" name="email" type="email" autocomplete="email" />
    </Field>
    <Field label="Password" html-for="password">
        <PasswordInput id="password" name="password" autocomplete="current-password" />
    </Field>
</template>
```

### Form

```vue
<script setup lang="ts">
import { Form, useForm } from "@sometic/vue/form";
import { Input } from "@sometic/vue/input";
import { Button } from "@sometic/vue/button";

type Values = { email: string };

const { form } = useForm<Values>({
    defaultValues: { email: "" },
});

async function onValid(values: Values) {
    await fetch("/api/signup", {
        method: "POST",
        body: JSON.stringify(values),
    });
}
</script>

<template>
    <Form :form="form" :on-valid="onValid">
        <Input name="email" type="email" />
        <Button type="submit">Create account</Button>
    </Form>
</template>
```

### Overlay

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Dialog, Alert } from "@sometic/vue/overlay";
import { Button } from "@sometic/vue/button";

const open = ref(false);
</script>

<template>
    <Button type="button" @click="open = true">Open</Button>
    <Dialog v-model:open="open" title-id="confirm-title">
        <h2 id="confirm-title">Confirm</h2>
        <Alert>Server authorization still required.</Alert>
        <Button type="button" @click="open = false">Close</Button>
    </Dialog>
</template>
```

Dialog follows the same modal controller rules as React: focus trap, scroll lock, Escape dismiss; outside press does not dismiss in beta. Provide `titleId` / `descriptionId` (or an accessible name).

### Structure

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
    Tabs,
    TabTrigger,
    TabPanel,
    Accordion,
    AccordionItem,
    Breadcrumb,
    BreadcrumbItem,
    CommandPalette,
    Tree,
} from "@sometic/vue/structure";

const paletteOpen = ref(false);
const commands = [
    { id: "docs", label: "Open docs", keywords: ["guide"], group: "Navigation" },
    { id: "theme", label: "Toggle theme", group: "Theme" },
];
const treeItems = [
    {
        id: "docs",
        label: "Docs",
        children: [{ id: "intro", label: "Introduction" }],
    },
];
</script>

<template>
    <Tabs default-value="overview">
        <TabTrigger value="overview">Overview</TabTrigger>
        <TabTrigger value="api">API</TabTrigger>
        <TabPanel value="overview">Portable tab selection with ARIA resolve.</TabPanel>
        <TabPanel value="api">createTabsController + resolveTabTrigger/Panel.</TabPanel>
    </Tabs>
    <Accordion type="single" default-value="a">
        <AccordionItem value="a" title="Accessibility">
            Focus, dismiss, and ARIA live in the core engines.
        </AccordionItem>
        <AccordionItem value="b" title="Styling">
            Unstyled by default. Own tokens and layout.
        </AccordionItem>
    </Accordion>
    <Breadcrumb>
        <BreadcrumbItem>
            <a href="/">Docs</a>
        </BreadcrumbItem>
        <BreadcrumbItem current>Structure</BreadcrumbItem>
    </Breadcrumb>
    <button type="button" @click="paletteOpen = true">Open command palette</button>
    <CommandPalette
        v-model:open="paletteOpen"
        :commands="commands"
        @select="(command) => console.log(command.id)"
    />
    <Tree :items="treeItems" default-value="docs" :default-expanded="['docs']" />
</template>
```

Import from `@sometic/vue/structure`. Keyboard, lazy mount, and overlay chrome for Command palette come from the same `@sometic/dom` engines as React.

### Store

```vue
<script setup lang="ts">
import { createStore } from "@sometic/store";
import { useStore } from "@sometic/vue/store";
import { Button } from "@sometic/vue/button";

const counterStore = createStore({ count: 0 });
const count = useStore(counterStore, (state) => state.count);

function increment() {
    counterStore.update((state) => ({ count: state.count + 1 }));
}
</script>

<template>
    <Button type="button" @click="increment">{{ count }}</Button>
</template>

`useStore` returns a `ComputedRef`. Unwrap with `count` in templates or `count.value` in script.
```

### Auth

```ts
import { createAuth, requirePermission } from "@sometic/auth";
import { useAuth, useSession, useCan } from "@sometic/vue/auth";

const auth = createAuth({/* provider + session options */});

const { session } = useAuth(auth);
const canEdit = useCan(auth, requirePermission("post:edit"));
const sessionOnly = useSession(auth);
```

There is no `AuthProvider` in `@sometic/vue/auth`. Keep the `AuthController` in a module or app-level provide/inject of your own if you want DI.

### HTTP

```ts
import { createHttp } from "@sometic/http";
import { useHttp } from "@sometic/vue/http";

const client = createHttp({ baseUrl: "/api" });
const { http } = useHttp(client);

await http.get("/me");
```

## How it works

- Components and composables wrap shared controllers; validation, dismiss, and refresh logic are not reimplemented per framework.
- Templates stay close to native HTML: `type`, `name`, `autocomplete`, and form participation work as you expect.
- Unstyled by default. Use `class`, `classes`, `styles`, and theme CSS variables.
- Imports are SSR-safe: no `window` / `document` at module evaluation.

## SSR notes

- Nuxt / Vite SSR: import Vue adapters freely in universal code.
- Create storage-backed auth or theme stores only after you inject a storage adapter safe for the current environment.
- Prefer Vue components over custom elements for SSR markup. If you mix Elements, register them client-only.
- Open overlays after mount so focus and scroll lock do not run during render.

See [SSR guide](/guide/ssr).

## Recipes

### Script setup + tree-shaken button

```ts
import { Button } from "@sometic/vue/button";
```

### Share one store across routes

Create the store in a Pinia-free module (or alongside Pinia) and import it from features. Dispose only when the SPA truly shuts down.

### Elements inside Vue

You can mount `sometic-*` tags for gradual migration, but Wave A Vue components are the supported path for Vue apps. Avoid duplicating the same control as both a Vue component and a custom element.

## Edge cases

- `v-model` / controllable props: follow each component’s documented model (often `value` + `onValueChange` or Vue emit equivalents).
- AsyncButton cancellation: honor the `AbortSignal`.
- Multiple app instances on one page: do not share disposed stores or auth controllers across remounts without recreation.
- Peer `vue` must resolve to a single major in the app; duplicate Vue copies break provides and reactivity.

## FAQ

### Vue 2 support?

Not claimed. Peer is Vue 3.5+.

### Why no `AuthProvider`?

Vue’s composable style takes the controller or create options directly. Add your own `provide`/`inject` if you want a provider pattern.

### Can I use the React package from Vue?

No. Use `@sometic/vue` or `@sometic/elements`.

### Where is Menu / Combobox?

Not in `@sometic/vue/overlay` or `@sometic/vue/selection` yet. Use React or `@sometic/dom` for Menu and Combobox. See [Beta maturity](/releases/beta).

### Where is Command palette / Tree / Tabs?

`@sometic/vue/structure`: `Tabs`, `TabTrigger`, `TabPanel`, `Accordion`, `AccordionItem`, `Breadcrumb`, `BreadcrumbItem`, `CommandPalette`, `Tree`, plus `Badge`, `Progress`, `Spinner`, `Skeleton`.

### Does `useStore` return a ref?

Yes. It returns a Vue `ComputedRef` of the selected slice (or full state). Templates auto-unwrap; use `.value` in script.

### Are SFC styles required?

No. Components are unstyled. Bring Tailwind, scoped CSS, or theme variables.

### CLI framework value?

`sometic init --framework vue` is supported for hybrid scaffolding. See [CLI](/guide/cli).

### TypeScript with `vue-tsc`?

Ship `.d.ts` from the package. Enable `verbatimModuleSyntax` / strict options consistent with the monorepo when possible.

## Related

- [Components](/components/)
- [Stores](/stores/)
- [Beta maturity](/releases/beta)
- [React](/frameworks/react)
- [Compatibility](/frameworks/compatibility)
- [SSR](/guide/ssr)
