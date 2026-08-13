# `@sometic/forms`

Framework-independent form engine for field registration, validation orchestration, drafts, steps, and feedback.

`@sometic/forms` owns form state: values, field meta (dirty/touched/visited/invalid), submit handling, server error injection, field arrays, multi-step definitions, and draft persistence helpers. It pairs with [`@sometic/validation`](https://www.npmjs.com/package/@sometic/validation) for native validators and schema adapters instead of baking Yup or Zod into the core.

Sometic treats forms as portable application behavior, not a React Hook Form clone tied to one renderer. Controllers are disposable, SSR-safe to construct, and easy to bind from Vanilla, Web Components, or thin framework hooks. Accessibility helpers (`focusFirstInvalid`, `announceFormErrors`) and feedback builders keep invalid submit UX consistent across stacks.

Standout exports include `createForm`, `createFieldArrayController`, `createDraftController` with memory/localStorage draft storage, `createFormSteps`, FormData bridges (`valuesToFormData`, `formDataToValues`), and feedback helpers (`createValidationFeedback`, `feedbackAttributes`). Subpaths such as `@sometic/forms/drafts`, `@sometic/forms/steps`, `@sometic/forms/a11y`, and `@sometic/forms/server` keep bundles intentional.

This package sits on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) and [`@sometic/validation`](https://www.npmjs.com/package/@sometic/validation). UI wiring often comes from [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) / [`@sometic/elements`](https://www.npmjs.com/package/@sometic/elements), and session-safe composition can use [`@sometic/app-shell`](https://www.npmjs.com/package/@sometic/app-shell). See the [introduction](https://sometic.dev/guide/introduction) and [forms overview](https://sometic.dev/packages/forms/).

## Install

```bash
pnpm add @sometic/forms
```

```bash
npm install @sometic/forms
```

```bash
yarn add @sometic/forms
```

## Usage

Create a form with field validators and submit handlers:

```ts
import { createForm } from "@sometic/forms";
import { email, minLength, required } from "@sometic/validation";

const form = createForm({
    defaultValues: { email: "", password: "" },
});

form.register("email", {
    validators: [required("Email is required"), email()],
});
form.register("password", {
    validators: [required("Password is required"), minLength(8)],
});

const onSubmit = form.handleSubmit({
    onValid: async (values) => {
        await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });
    },
    onInvalid: () => {
        console.log(form.getIssues());
    },
});

await onSubmit();
```

Persist drafts and build FormData for native multipart posts:

```ts
import { createDraftController, createMemoryDraftStorage, valuesToFormData } from "@sometic/forms";

const drafts = createDraftController({
    key: "login-draft",
    version: 1,
    storage: createMemoryDraftStorage(),
    getValues: () => form.getValues(),
    setValues: (values) => {
        for (const [path, value] of Object.entries(values)) {
            form.setValue(path, value);
        }
    },
});

await drafts.save();
const body = valuesToFormData(form.getValues());
```

## Peers / when not to use

Depends on `@sometic/core` and `@sometic/validation`. No framework peers.

Do not use `@sometic/forms` for server-state caching (that is [`@sometic/query`](https://www.npmjs.com/package/@sometic/query)) or session identity ([`@sometic/auth`](https://www.npmjs.com/package/@sometic/auth)). If you only need one-off validators without form meta/submit orchestration, import `@sometic/validation` alone.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [Forms package](https://sometic.dev/packages/forms/)
- [Forms guide](https://sometic.dev/forms/)
- [Validation](https://sometic.dev/packages/validation/)

## License

MIT
