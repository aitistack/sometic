# `@sometic/vue`

Native Vue adapters and components powered by Sometic’s framework-independent behavior engines.

`@sometic/vue` is the Wave A Vue 3 surface for Sometic. Components and composables map shared engines (`@sometic/dom`, `@sometic/forms`, `@sometic/store`, `@sometic/auth`, `@sometic/http`, and related packages) into Vue props, emits, provide/inject, and computed subscriptions. It is not a visual kit. You keep ownership of classes, styles, and tokens. Press handling, field metadata, form lifecycle, session updates, and HTTP access stay in the engines so the same behavior model works across stacks.

Sometic’s product promise is one behavior model for UI, forms, auth, HTTP, and document head. Vue adapters stay thin on purpose: they must not reimplement validation, auth refresh, or button resolution per framework. That keeps disposable cleanup (`onScopeDispose`), SSR-safe imports, and native element semantics aligned with React and Vanilla. Choose this package when you ship Vue 3.5+ and want idiomatic components/composables without locking behavior into Vue-only code.

Standout surfaces ship as tree-shakeable subpaths: button family (`Button`, `IconButton`, `ToggleButton`, `AsyncButton`, `ButtonGroup`), field and input variants, `useForm` / `Form` / `FormProvider` / field helpers, auth composables (`useAuth`, `useSession`, `useCan`), `useHttp`, `useStore`, selection controls, and overlays such as `Dialog`, `Popover`, `Tooltip`, and `ToastRegion`. Prefer `@sometic/vue/button` (and siblings) when you only need one module.

In the ecosystem, Vue sits with React and Web Components as a production adapter target above [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) and engines like [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom). Product overview: [Introduction](https://sometic.aitistack.com/guide/introduction). Adapter model: [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

Peer: `vue` `^3.5`.

```bash
pnpm add @sometic/vue vue
```

```bash
npm install @sometic/vue vue
```

```bash
yarn add @sometic/vue vue
```

## Usage

Button component:

```vue
<script setup lang="ts">
import { Button } from "@sometic/vue/button";
</script>

<template>
    <Button type="button" :loading="false" @click="() => {}">Save</Button>
</template>
```

Form + store (second surface):

```ts
import { Form, useForm, useFormField } from "@sometic/vue/form";
import { useStore } from "@sometic/vue/store";
import { createStore } from "@sometic/store";
import { defineComponent, h } from "vue";

const ui = createStore({ draftSaved: false });

export const ProfileForm = defineComponent({
    setup() {
        const { form } = useForm({ defaultValues: { email: "" } });
        const draftSaved = useStore(ui, (state) => state.draftSaved);
        const email = useFormField(form, "email");

        return () =>
            h(
                Form,
                {
                    form,
                    onValid: (values: { email: string }) => {
                        ui.set({ draftSaved: true });
                        console.log(values.email, draftSaved.value);
                    },
                },
                () => [
                    h("input", {
                        value: String(email.value.value ?? ""),
                        onInput: (event: Event) => {
                            email.setValue((event.target as HTMLInputElement).value);
                        },
                        onBlur: () => email.onBlur(),
                    }),
                    h("button", { type: "submit" }, "Submit"),
                ],
            );
    },
});
```

Auth composables live under `@sometic/vue/auth` (`useAuth`, `useSession`, `useCan`) when you pass `createAuth` options or an existing `AuthController`.

## Peers / when not to use

- Requires Vue 3.5+ as a peer. Without Vue, use [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom), [`@sometic/elements`](https://www.npmjs.com/package/@sometic/elements), or `@sometic/react`.
- Not a replacement for Nuxt UI kits or CSS frameworks. Pair with your own styling and optional [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme).
- Wave B packages expose store-bind foundations only; do not expect this full kit from `@sometic/svelte` / `@sometic/solid` yet.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Vue](https://sometic.aitistack.com/frameworks/vue)
- [Framework adapters](https://sometic.aitistack.com/concepts/framework-adapters)
- Docs home: [https://sometic.aitistack.com/](https://sometic.aitistack.com/)

## License

MIT
