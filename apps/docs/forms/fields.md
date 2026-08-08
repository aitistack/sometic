# Fields

Fields are named paths on a `FormController`. `register` attaches validators, transforms, enablement, and returns bindings for inputs. Meta tracks dirty/touched/visited/pending/issues for each path.

## Registration

```ts
const field = form.register("email", {
    validators: [required(), email()],
    validateOn: "onBlur",
    debounceMs: 300,
    defaultValue: "",
    transform: (value) => String(value).trim(),
    enabled: (values) => values.mode === "email",
});
```

### `FieldRegistrationOptions`

| Option         | Type                               | Default               | Description                                      |
| -------------- | ---------------------------------- | --------------------- | ------------------------------------------------ |
| `validators`   | `readonly Validator[]`             | ,                     | Sync and/or async                                |
| `validateOn`   | `ValidationMode`                   | form `validationMode` | Per-field override                               |
| `debounceMs`   | `number`                           | form `debounceMs`     | Applied on `onChange` only when &gt; 0           |
| `defaultValue` | `unknown`                          | ,                     | Seeded if path undefined                         |
| `transform`    | `(value) => unknown`               | ,                     | Applied before write                             |
| `enabled`      | `boolean \| ((values) => boolean)` | `true`                | Disabled fields clear issues and skip validation |

### `RegisterResult`

| Field             | Description                                                  |
| ----------------- | ------------------------------------------------------------ |
| `name`            | Path string                                                  |
| `value`           | Current value                                                |
| `onChange(value)` | `setValue` + mode-aware validation                           |
| `onBlur()`        | Sets touched + visited; validates with `"onBlur"` mode rules |
| `disabled`        | `!enabled`                                                   |
| `aria-invalid`    | Present only when currently invalid                          |

## Framework helpers

### React

```tsx
const { value, meta, setValue, onBlur, form } = useFormField("email", {
    validators: [required()],
});
```

Registers on mount, unregisters on unmount. `onBlur` marks touched/visited and calls `validateField` (always runs validators).

### Vue

```ts
const field = useFormField("email", { validators: [required()] });
// or useFormField(form, "email", options)
```

Same register/unregister lifecycle tied to the component scope.

### Custom element

`sometic-form` scans named native controls on connect and registers them. `required` → built-in required validator. Prefer `element.controller.register(...)` for transforms, async validators, or nested paths.

## Meta

```ts
type FieldMeta = {
    dirty: boolean;
    touched: boolean;
    visited: boolean;
    valid: boolean;
    invalid: boolean;
    pending: boolean;
    enabled: boolean;
    error?: string;
    issues: ValidationIssue[];
};
```

| Flag      | Meaning                              |
| --------- | ------------------------------------ |
| `dirty`   | `!Object.is(current, defaultAtPath)` |
| `touched` | Blur / `setTouched`                  |
| `visited` | Focus path / `setVisited`            |
| `pending` | Async validation in flight           |
| `valid`   | No error **and** not pending         |
| `error`   | First issue message (convenience)    |

Form aggregate:

```ts
form.getFormMeta();
// dirty, touched, valid, invalid, pending, submitting, submitCount
```

## Values and paths

```ts
form.setValue("user.email", "a@b.com");
form.getValue("items[0].qty");
form.setTouched("email", true);
form.setVisited("email", true);
```

Path grammar matches `@sometic/validation` (`parsePath` / `joinPath` / `getAt` / `setAt`).

## Validation triggers

Given the field’s `validateOn` (or form default):

| Call ↓ / mode →          | `onSubmit` | `onBlur` | `onTouched`     | `onChange` |
| ------------------------ | ---------- | -------- | --------------- | ---------- |
| change                   | skip       | skip     | only if touched | run        |
| blur                     | skip       | run      | run             | run        |
| submit / `validateField` | run        | run      | run             | run        |

`validateField(path)` forces the submit-mode path (always runs). `validateForm(paths?)` validates registered fields (optional subset); form-level validators run only on a full-form validate (no path filter). Remaining `serverIssues` fail the form even if field validators pass.

## Unregister and reset

```ts
form.unregister("email");
form.reset(); // optional new defaultValues
form.partialReset(["email", "items[0].name"]);
```

Unregister aborts in-flight validation and strips client/server issues for that path.

## Accessibility tips

- Keep native `name` equal to the form path when possible so `focusFirstInvalid` can query `[name="…"]`.
- Or set `data-field-path` on the control.
- Bind `aria-invalid` from meta / `RegisterResult`.
- Surface `meta.error` or `meta.issues` next to the field with `aria-describedby`.

## Related

- [Forms overview](/forms/)
- [Validation](/forms/validation)
- [Async validation](/forms/async-validation)
- [Field arrays](/forms/field-arrays)
- [Form component](/components/form)
- [Field component](/components/field)
