# Schema form

Descriptor-driven forms from `@sometic/forms/schema-form`. You describe fields as data (`name`, `type`, `label`, `validators`, `enabled`, `transform`) and `createSchemaForm` builds a full `FormController` on top of `createForm`: defaults per type, registration, validation modes, meta, and submit. React and Vue ship a `SchemaForm` component that renders a default control per descriptor, or hands you the controller through a render prop or slot.

::: tip System standout: same forms core
Schema form is a thin catalog over the portable forms engine, not a second validation stack. Title, count, and published in the preview match the playground so docs and demos stay aligned.
:::

<PreviewSchemaForm />

## Usage

::: code-group

```jsx [JS]
import { SchemaForm } from "@sometic/react/data";

const fields = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "count", label: "Count", type: "number", defaultValue: 1 },
    { name: "published", label: "Published", type: "checkbox", defaultValue: false },
];

export function Example() {
    return (
        <SchemaForm
            fields={fields}
            submitLabel="Save"
            onSubmitValues={async (values) => {
                await fetch("/api/posts", { method: "POST", body: JSON.stringify(values) });
            }}
        />
    );
}
```

```tsx [TS]
import { SchemaForm, type SchemaFieldDescriptor, type SchemaFormValues } from "@sometic/react/data";

const fields: SchemaFieldDescriptor[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "count", label: "Count", type: "number", defaultValue: 1 },
    { name: "published", label: "Published", type: "checkbox", defaultValue: false },
];

export function Example(): JSX.Element {
    return (
        <SchemaForm
            fields={fields}
            submitLabel="Save"
            onSubmitValues={async (values: SchemaFormValues) => {
                await fetch("/api/posts", { method: "POST", body: JSON.stringify(values) });
            }}
        />
    );
}
```

```html [Vanilla]
<form id="post-form" novalidate></form>
<pre id="values"></pre>

<script type="module">
    import { createSchemaForm } from "@sometic/forms/schema-form";

    const host = document.querySelector("#post-form");
    const output = document.querySelector("#values");

    const form = createSchemaForm({
        fields: [
            { name: "title", label: "Title", type: "text", required: true },
            { name: "count", label: "Count", type: "number", defaultValue: 1 },
            { name: "published", label: "Published", type: "checkbox", defaultValue: false },
        ],
    });

    const sync = () => {
        output.textContent = JSON.stringify(form.getValues(), null, 2);
    };

    for (const field of form.getFields()) {
        const registration = form.registerField(field.name);
        const label = document.createElement("label");
        const text = document.createElement("span");
        text.textContent = field.label ?? field.name;

        const input = document.createElement("input");
        input.name = field.name;
        input.type = field.type === "checkbox" ? "checkbox" : (field.type ?? "text");
        if (field.type === "checkbox") {
            input.checked = registration.value === true;
        } else {
            input.value = String(registration.value ?? "");
        }
        input.addEventListener("input", () => {
            registration.onChange(
                field.type === "checkbox"
                    ? input.checked
                    : field.type === "number"
                      ? Number(input.value)
                      : input.value,
            );
            sync();
        });
        input.addEventListener("blur", () => registration.onBlur());

        label.append(text, input);
        host.append(label);
    }

    const submit = form.handleSubmit({
        onValid: async (values, { signal }) => {
            await fetch("/api/posts", { method: "POST", body: JSON.stringify(values), signal });
        },
    });
    host.addEventListener("submit", (event) => submit(event));

    sync();
</script>
```

:::

> Custom element not shipped for data surfaces in this beta; use the engine or the React and Vue components.

Custom element **not shipped** for Schema form. Vanilla uses `createSchemaForm` from `@sometic/forms/schema-form`. React ships `SchemaForm` from `@sometic/react/data`, Vue the same name from `@sometic/vue/data`. For hand-written fields and hooks see [Form](/components/form); for the underlying engine see [Forms](/forms/).

## How it works

1. **Defaults from descriptors**: `buildSchemaFormDefaults` maps each field type to a starting value (`""` for text, email, password, select, textarea, and date; `null` for number; `false` for checkbox) unless the descriptor sets `defaultValue`. Explicit `defaultValues` passed to `createSchemaForm` win over both.
2. **Registration**: every descriptor is registered on the underlying form with its `validators`, `validateOn`, `debounceMs`, `enabled`, and `transform`. `registerField(name)` returns `{ name, value, onChange, onBlur, disabled, "aria-invalid"? }` for your control.
3. **Full form engine**: the result is a `FormController` plus schema helpers, so `getValues`, `setValue`, `getFieldMeta`, `getFormMeta`, `validateField`, `validateForm`, `reset`, `partialReset`, `setServerErrors`, `clearServerErrors`, `createFieldArray`, `subscribe`, and `handleSubmit` all work exactly as in [Form](/components/form).
4. **Dynamic schemas**: `setFields(next)` unregisters descriptors that disappeared and re-registers the rest, so a schema fetched from an API can change at runtime without rebuilding the form.
5. **Adapters**: React and Vue create the controller once, subscribe for rerenders, call `setFields` when the `fields` prop changes, render `<form noValidate>`, and dispose on unmount. Without children they render one `<label>` per field with `data-slot="field"`, `data-invalid`, an error span, and a submit button.
6. **Escape hatch**: pass a function child (React) or use the default slot (Vue) to receive the `SchemaFormController` and render your own controls, including Sometic [Input](/components/input), [Select](/components/select), or [Checkbox](/components/checkbox).

## Anatomy

| Part          | `data-slot` | Notes                                                        |
| ------------- | ----------- | ------------------------------------------------------------ |
| Form host     | -           | Real `<form noValidate>`, submit wired to `handleSubmit`      |
| Field wrapper | `field`     | `<label>` with `data-invalid` reflecting field meta           |
| Field label   | `label`     | `field.label` or the field name                               |
| Control       | -           | Native input typed from `field.type`, `checked` for checkbox  |
| Error         | `error`     | Rendered when `getFieldMeta(name).error` is set               |
| Submit        | `submit`    | Button labeled by `submitLabel`                               |

## Props / attributes

### React `SchemaFormProps`

Extends `HTMLAttributes<HTMLFormElement>` minus `children` and `onSubmit` (submit belongs to the controller).

| Prop             | Type                                                   | Default      | Description                                    |
| ---------------- | ------------------------------------------------------ | ------------ | ---------------------------------------------- |
| `fields`         | `readonly SchemaFieldDescriptor[]`                     | **required** | Field descriptors, re-applied when they change |
| `defaultValues`  | `SchemaFormValues`                                     | -            | Overrides descriptor defaults on creation      |
| `onSubmitValues` | `(values: SchemaFormValues) => void \| Promise<void>`  | -            | Runs on a valid submit                         |
| `submitLabel`    | `string`                                               | `"Submit"`   | Submit button text                             |
| `children`       | `(form: SchemaFormController) => ReactNode`            | default rows | Render prop for custom controls                |
| Native attrs     | remaining form HTML attrs                              | -            | Forwarded to `<form>`                          |

### `SchemaFieldDescriptor`

| Field          | Type                                                                             | Description                                        |
| -------------- | -------------------------------------------------------------------------------- | -------------------------------------------------- |
| `name`         | `string`                                                                         | Field path, unique per form                        |
| `label`        | `string`                                                                         | Visible label, falls back to `name`                |
| `type`         | `"text" \| "email" \| "password" \| "number" \| "checkbox" \| "select" \| "textarea" \| "date"` | Drives default value and default control |
| `description`  | `string`                                                                         | Helper text you render                             |
| `placeholder`  | `string`                                                                         | Passed to the default control                      |
| `required`     | `boolean`                                                                        | Sets the native `required` attribute on default rows |
| `defaultValue` | `unknown`                                                                        | Overrides the type default                         |
| `validators`   | `readonly Validator[]`                                                           | From `@sometic/validation` or your own             |
| `validateOn`   | `"onChange" \| "onBlur" \| "onSubmit" \| "onTouched"`                            | Per-field validation mode                          |
| `debounceMs`   | `number`                                                                         | Debounce for `onChange` validation                 |
| `enabled`      | `boolean \| ((values: unknown) => boolean)`                                      | Conditional fields, drives `registration.disabled` |
| `transform`    | `(value: unknown) => unknown`                                                    | Normalizes input before it reaches values          |
| `options`      | `readonly { value: string; label?: string; disabled?: boolean }[]`               | Choices for `select` controls you render           |

### `CreateSchemaFormOptions`

Everything `createForm` accepts except `defaultValues` is passed through (`validators`, `validationMode`, `debounceMs`, `feedback`), plus `fields` and an optional `defaultValues` map.

### `SchemaFormController`

`FormController<SchemaFormValues>` plus `getFields()`, `getField(name)`, `setFields(fields)`, `registerField(name)`, and `registerAll()`.

### Helpers

`defaultValueForSchemaFieldType(type)`, `listSchemaFieldNames(fields)`, and `buildSchemaFormDefaults(fields)` are exported for building previews, tests, and server-side defaults.

### Vue

`SchemaForm` from `@sometic/vue/data`. Props: `fields`, `defaultValues`, `submitLabel`. Emits `submitValues` with the values object. The default slot receives the controller.

```vue
<script setup lang="ts">
import { SchemaForm } from "@sometic/vue/data";

const fields = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "count", label: "Count", type: "number", defaultValue: 1 },
    { name: "published", label: "Published", type: "checkbox", defaultValue: false },
];

function onSubmitValues(values) {
    console.log(values);
}
</script>

<template>
    <SchemaForm :fields="fields" submit-label="Save" @submit-values="onSubmitValues" />
</template>
```

### Custom element

**CE not shipped.** Use the engine, React, or Vue. The generic `sometic-form` element in [Form](/components/form) covers the custom-element case for hand-written markup.

## Events / callbacks

| Surface        | Event                    | Payload                       |
| -------------- | ------------------------ | ----------------------------- |
| React          | `onSubmitValues`         | `SchemaFormValues`            |
| Vue            | `submitValues`           | `SchemaFormValues`            |
| Custom element | -                        | -                             |
| Controller     | `subscribe(listener)`    | void, any state change        |
| Controller     | `handleSubmit({ onValid, onInvalid, successMessage, errorMessage })` | values with an `AbortSignal`, or issues |

`onValid` receives `{ signal }`; pass it to `fetch` so a submit that unmounts cancels cleanly.

## Controlled vs uncontrolled

The controller owns values, which is what makes a schema-driven form possible: descriptors change, values follow. Seed once with descriptor `defaultValue` or `defaultValues`. After that, read through `getValues()` or `getFieldMeta(name)` and write through `registration.onChange` or `setValue`. `reset(values?)` returns to defaults or to a new baseline; `partialReset(paths)` resets a subset, which is useful after a partial server response. Individual DOM controls can be controlled (bind `registration.value`) or uncontrolled (let the DOM hold text and sync on input); the default React and Vue rows are controlled.

## Accessibility

- Adapters render a real `<form noValidate>`, so browser bubbles never fight Sometic issues while Enter-to-submit keeps working.
- Default rows wrap the control in a `<label>`, which gives every field a programmatic name without extra `id` wiring.
- Invalid fields get `aria-invalid` from the registration and `data-invalid` on the wrapper; the error text renders in `[data-slot="error"]`. When you render your own controls, connect that text with `aria-describedby`.
- `required` descriptors set the native attribute, so assistive tech announces the requirement even before validation runs.
- Use `@sometic/forms/a11y` (`announceFormErrors`, `focusFirstInvalid`, `formatIssueSummary`) on invalid submit so keyboard and screen reader users land on the first problem.
- Conditional fields should be removed from `fields` (or disabled through `enabled`) rather than hidden with CSS, so they leave the tab order and the accessibility tree together.
- Checkbox fields render as native checkboxes, not toggle divs, so Space works and state is announced.

## Styling

No styles ship. Target `[data-slot="field"][data-invalid="true"]`, `[data-slot="label"]`, `[data-slot="error"]`, and `[data-slot="submit"]`, or ignore the default rows entirely and render your own markup through the render prop or slot. Sometic [Field](/components/field) and [Input](/components/input) compose cleanly with `registerField` when you want the styled Sometic controls.

## Edge cases

- **Duplicate `name` values**: registration is keyed by name, so the second descriptor silently wins. Keep names unique.
- **Renaming a field** through `setFields` unregisters the old name and drops its value; migrate by passing `defaultValues` or calling `setValue` after the swap.
- **`defaultValues` for unknown names** stay in the values object even without a descriptor, which is handy for hidden metadata you submit.
- **Number fields** default to `null`, not `0`, so "empty" and "zero" stay distinguishable. Parse the input yourself (`Number(input.value)`) or use `transform`.
- **`enabled: false`** marks the registration disabled; disabled fields do not block submit validation, so gate the value server side too.
- **Async validators** race-guard internally: the latest run wins and older runs are ignored.
- **Server errors** survive client revalidation until `clearServerErrors(paths)`; issues with `code: "server"` are the ones that get stripped.
- **Double submit**: `handleSubmit` tracks submit state in form meta. Disable your submit button while `getFormMeta().submitting` is true.
- **React lifecycle**: `SchemaForm` disposes its controller on unmount. A controller you create yourself with `createSchemaForm` is yours to dispose.
- **Fields prop identity (React)**: the adapter calls `setFields` whenever the `fields` reference changes, so define the array outside render or memoize it, or every render re-registers.
- **SSR**: nothing touches the DOM at import time. `buildSchemaFormDefaults(fields)` gives you the same initial values on the server for markup or hydration checks.

## Performance notes

One controller per form; subscriptions are form-wide, so very large schemas re-render the whole tree in the default rows. For 50-plus fields, use the render prop and subscribe per field with [Form](/components/form) hooks (`useFormField`) instead of the default renderer. `debounceMs` on `onChange` validation avoids validating on every keystroke, and `validateOn: "onBlur"` avoids it entirely while typing. Descriptors are cloned on `getFields()`, so cache the array rather than calling it inside a loop. The schema-form entry is a subpath (`@sometic/forms/schema-form`), so importing it does not pull drafts, steps, or server helpers.

## When to use / When not

**Use** when the field list is data: admin CRUD screens, settings pages, API-driven or per-tenant forms, and anywhere the same schema must render in React, Vue, and Vanilla.

**Do not use** when the layout is bespoke and static (hand-write fields with [Form](/components/form)), when you need a rich JSON Schema dialect with `$ref`, `oneOf`, and nested objects (descriptors are flat and deliberately small), or as a validation library on its own. Validators come from [Validation](/primitives/validation). Prefer the full [Forms](/forms/) engine when you need complex dirty tracking, field arrays, or server error maps beyond schema fields.

## FAQ

**Is this JSON Schema?** No. Descriptors are a small flat list with a Sometic-shaped contract. If your source is JSON Schema, map it to descriptors and keep the mapping in one place; the engine stays predictable that way.

**How do nested objects and arrays work?** Field names are paths, so `setValue("address.city", value)` works, and `createFieldArray("items")` gives list behavior. The descriptor list itself is flat, so you drive nesting with names.

**Where do validators come from?** `@sometic/validation` factories, or plain functions matching `Validator`. Zod and Yup adapters exist as separate packages. Put them in `descriptor.validators`.

**Can I use my own inputs?** Yes. Pass a function child (React) or use the slot (Vue), then wire `form.registerField(name)` to any control, including Sometic [Input](/components/input), [Select](/components/select), and [Checkbox](/components/checkbox).

**How do I show a select?** Provide `options` on the descriptor and render your own `<select>` through the render prop. The default renderer emits native inputs only, so it never guesses your option markup.

**Can the schema change at runtime?** Yes. Change the `fields` prop or call `setFields`. Removed fields are unregistered, remaining fields keep their values.

**How do I handle server-side validation errors?** `form.setServerErrors(issues)` after a failed request, then `clearServerErrors(paths)` when the user edits. See [Server errors](/forms/server-errors).

**How do I persist a draft?** Compose `createDraftController` from `@sometic/forms/drafts` around the same values. See [Persistence](/forms/persistence).

**Is there a `sometic-schema-form` element?** No. Use `sometic-form` from [Form](/components/form) with your own markup, or the engine directly.

## Related links

- [Form](/components/form)
- [Forms overview](/forms/)
- [Validation](/forms/validation)
- [Field](/components/field)
- [Beta maturity](/releases/beta)

The vanilla playground demos the engine in section `#schema-form` with `title`, `count`, and `published` fields.
