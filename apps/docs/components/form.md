# Form

Framework adapters over `@sometic/forms`: React `Form` / hooks, Vue `Form` / composables, and the `sometic-form` custom element. Same `FormController` behavior everywhere, validation modes, field meta, submit, server errors, and field arrays.

::: tip Connected fields
`handleSubmit` validates **controller values**, not DOM `FormData`. Bind every field with `useFormField` (value + `setValue` + `onBlur`). A bare `<input name="…">` or unbound `<Input name="…">` will submit empty defaults and look like a broken submit handler.
:::

<PreviewForm />

## Usage

::: code-group

```tsx [React]
import { useForm, Form, useFormField } from "@sometic/react/form";
import { Input } from "@sometic/react/input";
import { required, email } from "@sometic/validation";

export function Example() {
    const form = useForm({ defaultValues: { email: "" } });
    const emailField = useFormField(
        "email",
        {
            validators: [required(), email()],
        },
        form,
    );
    return (
        <Form form={form} onValid={async (values) => console.log(values)}>
            <Input
                value={String(emailField.value ?? "")}
                onValueChange={emailField.setValue}
                onBlur={emailField.onBlur}
            />
            <button type="submit">Send</button>
        </Form>
    );
}
```

```vue [Vue]
<script setup>
import { useForm, Form } from "@sometic/vue/form";

const { form } = useForm({ defaultValues: { email: "" } });
</script>

<template>
    <Form :form="form" :on-valid="(values) => console.log(values)">
        <input name="email" />
        <button type="submit">Send</button>
    </Form>
</template>
```

```js [Vanilla]
import { createForm } from "@sometic/forms";

const formEl = document.querySelector("form");
const form = createForm({ defaultValues: { email: "" } });

formEl.addEventListener("submit", (event) => {
    void form.handleSubmit({
        onValid(values) {
            console.log(values);
        },
    })(event);
});
```

```html [Custom Elements (Web Components)]
<script type="module">
    import { registerFormElements } from "@sometic/elements/form";
    registerFormElements();
</script>

<sometic-form>
    <input name="email" />
    <button type="submit">Send</button>
</sometic-form>
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.6/dist/cdn/sometic-elements.iife.js"></script>

<sometic-form>
    <input name="email" />
    <button type="submit">Send</button>
</sometic-form>
```

```html [CDN Module]
<script
    type="module"
    src="https://cdn.jsdelivr.net/npm/@sometic/elements@1.1.6/dist/cdn/sometic-elements.esm.js"
></script>

<sometic-form>
    <input name="email" />
    <button type="submit">Send</button>
</sometic-form>
```

:::

> React/Vue `Form` props use **`onValid`** / optional **`onInvalid`** (see below). Wire submit through those handlers; the preview Usage snippet above is illustrative of composition shape.

For the engine itself (validators, drafts, a11y helpers), see [Forms](/forms/).

## How it works

1. **Engine (`@sometic/forms`)**: `createForm` / `FormController` owns values, field registration, meta (dirty/touched/invalid), validation scheduling, submit (`handleSubmit`), server errors, field arrays, and optional feedback.
2. **Adapters**: React `useForm` creates a controller; `Form` wraps a native `<form noValidate>`, provides context, and binds `handleSubmit({ onValid, onInvalid })`. Vue mirrors with composables and disposes on scope end. `sometic-form` auto-registers named controls and emits CE events.
3. **DOM**: No separate “form resolve”; fields are ordinary inputs/selects/checkboxes bound via hooks or CE scan. Validation factories come from `@sometic/validation`.

## Anatomy

| Part                | Role                                                                               |
| ------------------- | ---------------------------------------------------------------------------------- |
| `FormController`    | Source of truth for values, meta, issues, submit                                   |
| `<form noValidate>` | Adapter host; native constraint validation disabled in favor of Sometic validators |
| Fields              | Registered paths (`email`, `items[0].name`) bound via hooks or CE auto-scan        |
| Feedback            | Optional validation / success / error messages from the controller                 |

CE moves light children into an internal `<form>` and auto-registers named `input` / `select` / `textarea`.

## Props / attributes

### React `FormProps`

| Prop        | Type                                                                         | Default      | Description         |
| ----------- | ---------------------------------------------------------------------------- | ------------ | ------------------- |
| `form`      | `FormController<Record<string, unknown>>`                                    | **required** | Controller instance |
| `onValid`   | `SubmitHandlers["onValid"]`, `(values, { signal }) => void \| Promise<void>` | **required** | Success path        |
| `onInvalid` | `SubmitHandlers["onInvalid"]`, `(issues, values) => void \| Promise<void>`   | ,            | Invalid submit      |
| `className` | `string`                                                                     | ,            | Host `<form>` class |
| `children`  | `ReactNode`                                                                  | ,            | Fields              |

### Hooks (React)

| API                | Role                                                 |
| ------------------ | ---------------------------------------------------- |
| `useForm(options)` | Creates `FormController` from `CreateFormOptions`    |
| `FormProvider`     | Context provider                                     |
| `useFormContext`   | Read controller from context                         |
| `useFormState`     | `{ values, meta }` snapshot subscription             |
| `useFormField`     | `{ value, meta, setValue, onBlur, form }` for a path |
| `useFieldArray`    | `FieldArrayController` for list fields               |

### `useForm` / `createForm` options

| Name             | Type                                                  | Default      | Description                       |
| ---------------- | ----------------------------------------------------- | ------------ | --------------------------------- |
| `defaultValues`  | `TValues`                                             | **required** | Initial values (cloned)           |
| `validators`     | `Validator[]`                                         | ,            | Form-level validators             |
| `validationMode` | `"onChange" \| "onBlur" \| "onSubmit" \| "onTouched"` | `"onSubmit"` | Default field mode                |
| `debounceMs`     | `number`                                              | `0`          | Default debounce for onChange     |
| `feedback`       | `boolean \| flags`                                    | all on       | Validation/success/error feedback |

### `sometic-form` attributes

| Attribute    | Description                                   |
| ------------ | --------------------------------------------- |
| `novalidate` | Observed; form always uses Sometic validation |
| `shadow`     | Optional open shadow root                     |

Access `element.controller` for the full `FormController` API.

## Events / callbacks

| Surface    | Event                   | Payload                |
| ---------- | ----------------------- | ---------------------- |
| React/Vue  | `onValid` / `onInvalid` | values / issues        |
| CE         | `form-change`           | `{ values }`           |
| CE         | `form-submit`           | `{ values }`           |
| CE         | `form-invalid`          | `{ issues }`           |
| CE         | `form-announce`         | `{ message }`          |
| Controller | `subscribe(listener)`   | void, any state change |

## Controlled vs uncontrolled

Form values are owned by the controller (always “controlled” at the engine layer). Individual inputs may be uncontrolled DOM nodes that you sync via `setValue` on change, or fully controlled through `useFormField`’s `value`. Default values seed once via `defaultValues`.

## Form participation

Adapters render a real `<form noValidate>`. Named native controls still appear in `FormData` if you read the DOM, but Sometic submit uses controller values + validators. Prefer registering fields and reading `onValid` values rather than scraping the DOM. CE maps `required` attributes to built-in required validators.

## Accessibility

- Native labels and `name` attributes remain the primary association model.
- Field meta exposes invalid state for `aria-invalid`.
- Use `@sometic/forms/a11y`: `announceFormErrors`, `focusFirstInvalid`, `formatIssueSummary`.
- CE invalid submit announces assertively and focuses the first invalid control.
- Prefer `noValidate` + Sometic validators so AT and UI share one issue model.

## Styling

Adapters do not ship visual chrome. Style the native `<form>` and fields with your design system. Map controller feedback via `feedbackAttributes` from `@sometic/forms/feedback` (`data-feedback`, `role="status"|"alert"`).

## Edge cases

- **React lifecycle**: `useForm` does not auto-dispose; call `form.dispose()` if you need teardown.
- **Vue lifecycle**: `useForm` disposes when the scope ends.
- **Async validation races**, latest token wins; older runs abort.
- **Server errors**, retained across client revalidation until `clearServerErrors`.
- **Double submit**, use submit meta / disable the submit button while pending; pass `signal` from `onValid` into fetch.
- **SSR**, create forms in effects or client-only entry; CE registration is browser-gated.

## Performance notes

One controller per form instance; field subscriptions should be granular (`useFormField` / selectors) to avoid whole-tree rerenders. Debounce `onChange` validation with `debounceMs`. Import `@sometic/react/form` and `@sometic/validation` factories à la carte.

## When to use / When not

**Use** for multi-field flows that need shared validation, dirty/touched meta, async submit, server error mapping, or field arrays, across React, Vue, or vanilla.

**Do not use** for a single uncontrolled input with native validation only, non-form app state (`@sometic/store`), or as a drop-in replacement for schema libraries without a `SchemaAdapter`.

## FAQ

**React vs Vue lifecycle?** React `useForm` keeps the controller for the component lifetime and does not auto-dispose. Vue `useForm` disposes on scope dispose.

**Why `noValidate`?** So browser popups do not fight Sometic issues. Reimplement required/pattern with `@sometic/validation` factories.

**How do server errors work?** `form.setServerErrors(issues)`, see [Server errors](/forms/server-errors). Prefer `code: "server"` when you want `clearServerErrors(paths)` to strip field issues.

**Field arrays?** `useFieldArray` / `form.createFieldArray`, see [Field arrays](/forms/field-arrays).

**Draft persistence?** Compose `createDraftController` from `@sometic/forms/drafts`, see [Persistence](/forms/persistence).

**Is feedback on by default?** Yes. Disable with `feedback: false` or selective flags.

**Can I mix Sometic Input with Form?** Yes, bind `value`/`onValueChange` (or checkbox/select equivalents) through `useFormField`.

**FormData helper?** The engine can produce FormData from values; see forms package docs for `toFormData`-style helpers in the API reference.

## Related links

- [Forms overview](/forms/)
- [Fields](/forms/fields)
- [Validation](/forms/validation)
- [Field](/components/field)
- [Input](/components/input)
- [Checkbox](/components/checkbox)
- [Select](/components/select)
