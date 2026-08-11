# Forms

Framework-independent form engine (`@sometic/forms`) paired with `@sometic/validation`. Controllers own values, field meta, validation scheduling, submit, server errors, and optional drafts / steps / feedback, React, Vue, and `sometic-form` are thin adapters over the same API.

::: tip System standout: server map + private drafts
`mapServerErrorBody` (`@sometic/forms/server`) normalizes Problem Details-ish payloads. Drafts support `omit` / `pick` / `sanitize` so passwords never hit storage. Pair submit with [`bindMutationForm`](/guide/app-shell) for epoch-safe mutation + invalidate.
:::

<CopyPrompt surface="forms" />

## Installation

<InstallCommands packages="@sometic/forms @sometic/validation" />

Framework UI:

```bash
pnpm add @sometic/react   # or @sometic/vue / @sometic/elements
```

## Import map

| Path                       | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `@sometic/forms`           | `createForm`, types, re-exports              |
| `@sometic/forms/drafts`    | Draft persistence                            |
| `@sometic/forms/steps`     | Multi-step wizard helpers                    |
| `@sometic/forms/form-data` | `FormData` ↔ values                          |
| `@sometic/forms/a11y`      | Announce + focus first invalid               |
| `@sometic/forms/feedback`  | Feedback factories + attributes              |
| `@sometic/validation`      | Validators, compose, issues, schema contract |
| `@sometic/react/form`      | Hooks + `Form`                               |
| `@sometic/vue/form`        | Composables + `Form`                         |
| `@sometic/elements/form`   | `sometic-form`                               |

## Quick start

::: code-group

```js [JS]
import { createForm } from "@sometic/forms";
import { required, email, pipe } from "@sometic/validation";

const form = createForm({
    defaultValues: { email: "", name: "" },
    validationMode: "onSubmit",
    debounceMs: 0,
});

form.register("email", {
    validators: [pipe(required(), email())],
    validateOn: "onBlur",
});

form.register("name", { validators: [required()] });

const submit = form.handleSubmit({
    onValid: async (values, { signal }) => {
        await fetch("/api/profile", {
            method: "POST",
            body: JSON.stringify(values),
            signal,
        });
    },
    onInvalid: (issues) => {
        console.warn(issues);
    },
    successMessage: "Profile saved.",
});
```

```ts [TS]
import { createForm } from "@sometic/forms";
import { required, email, pipe } from "@sometic/validation";
import type { FormController } from "@sometic/forms";

type ProfileValues = { email: string; name: string };

const form: FormController<ProfileValues> = createForm({
    defaultValues: { email: "", name: "" },
    validationMode: "onSubmit",
    debounceMs: 0,
});

form.register("email", {
    validators: [pipe(required(), email())],
    validateOn: "onBlur",
});

form.register("name", { validators: [required()] });

const submit = form.handleSubmit({
    onValid: async (values, { signal }) => {
        await fetch("/api/profile", {
            method: "POST",
            body: JSON.stringify(values),
            signal,
        });
    },
    onInvalid: (issues) => {
        console.warn(issues);
    },
    successMessage: "Profile saved.",
});
```

```js [Vanilla]
import { createForm } from "@sometic/forms";
import { required, email, pipe } from "@sometic/validation";

const form = createForm({
    defaultValues: { email: "", name: "" },
    validationMode: "onSubmit",
    debounceMs: 0,
});

form.register("email", {
    validators: [pipe(required(), email())],
    validateOn: "onBlur",
});

form.register("name", { validators: [required()] });

const formEl = document.querySelector("#profile");
formEl?.addEventListener("submit", (event) => {
    event.preventDefault();
    void form.handleSubmit({
        onValid: async (values, { signal }) => {
            await fetch("/api/profile", {
                method: "POST",
                body: JSON.stringify(values),
                signal,
            });
        },
        onInvalid: (issues) => {
            console.warn(issues);
        },
        successMessage: "Profile saved.",
    })();
});
```

:::

Subscribe for UI updates:

```ts
const unsubscribe = form.subscribe(() => {
    const meta = form.getFormMeta();
    const values = form.getValues();
});
```

Always call `form.dispose()` when the form leaves the page (Vue adapters do this for you; React `useForm` does not).

## Core concepts

| Concept          | Meaning                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| `FormController` | Explicit, disposable instance, no module singleton                                         |
| Paths            | `email`, `user.email`, `items[0].qty` via `@sometic/validation` path helpers               |
| `FieldMeta`      | `dirty`, `touched`, `visited`, `valid`, `invalid`, `pending`, `enabled`, `error`, `issues` |
| `FormMeta`       | Aggregate dirty/touched/valid/pending + `submitting`, `submitCount`                        |
| `ValidationMode` | `onChange` \| `onBlur` \| `onSubmit` \| `onTouched`                                        |
| Issues           | `{ code, message, path?, params? }` from `@sometic/validation`                             |

Defaults: `validationMode: "onSubmit"`, `debounceMs: 0`, feedback flags all enabled.

## Controller surface (summary)

| Method                                  | Role                               |
| --------------------------------------- | ---------------------------------- |
| `getValues` / `getValue` / `setValue`   | Read/write (cloned reads)          |
| `register` / `unregister`               | Field lifecycle + `RegisterResult` |
| `getFieldMeta` / `getFormMeta`          | UI state                           |
| `validateField` / `validateForm`        | Imperative validation              |
| `handleSubmit`                          | Abortable submit pipeline          |
| `setServerErrors` / `clearServerErrors` | API error mapping                  |
| `setErrors` / `clearErrors`             | Client external errors             |
| `reset` / `partialReset`                | Restore defaults                   |
| `createFieldArray`                      | Array helpers                      |
| `subscribe` / `dispose`                 | Reactivity + cleanup               |

Full field details: [Fields](/forms/fields). Validation: [Validation](/forms/validation). Adapters: [Form component](/components/form).

## When to use

Shared validation and submit orchestration that must look identical in React, Vue, and vanilla, including async validators, server errors, and drafts.

## When not to use

- Trivial one-off native forms with no shared logic
- Global app state unrelated to a form document, use `@sometic/store`
- Replacing a schema library without an adapter, implement `SchemaAdapter` if you need Zod/Yup

## Related

- [Form component](/components/form)
- [Fields](/forms/fields)
- [Validation](/forms/validation)
- [Async validation](/forms/async-validation)
- [Field arrays](/forms/field-arrays)
- [Server errors](/forms/server-errors)
- [Persistence](/forms/persistence)
- [Validation package](/primitives/validation)
