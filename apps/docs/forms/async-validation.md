# Async validation

Async validators are first-class: any `Validator` may return a `Promise`. The form engine aborts stale runs, tracks `pending` meta, and supports debounce on change.

## Writing an async validator

```ts
import type { Validator } from "@sometic/validation";
import { createIssue, ok } from "@sometic/validation";

const usernameAvailable: Validator<string> = async (value, context) => {
    if (!value) return ok();
    const response = await fetch(`/api/username-available?u=${encodeURIComponent(value)}`, {
        signal: context.signal,
    });
    if (context.signal?.aborted) return ok();
    const { available } = (await response.json()) as { available: boolean };
    return available
        ? ok()
        : createIssue("unavailable", "Username is taken", { path: context.path });
};

form.register("username", {
    validators: [required(), usernameAvailable],
    validateOn: "onChange",
    debounceMs: 300,
});
```

`ValidatorContext` includes `{ values, path, signal? }`. Pass `signal` into `fetch` / SDK calls so abort actually cancels work.

## Debounce

- Field / form `debounceMs` applies only when the validation **call mode** is `onChange` and `debounceMs > 0`.
- Blur and submit validation run immediately (no debounce wait).
- Standalone helper:

```ts
import { debouncePromise } from "@sometic/validation";

await debouncePromise((signal) => check(signal), 300, externalSignal);
```

Rejects with `AbortError` when aborted.

## Race and abort handling

Per field, the form keeps an `AbortController` and a monotonically increasing token:

1. A new validation aborts the previous controller.
2. Results are ignored if the signal aborted or the token no longer matches.
3. `AbortError` resolves as a soft failure (`false`) without throwing into UI.
4. `meta.pending` is true while a run is in flight; `meta.valid` requires `!pending`.

`dispose()` / `unregister()` abort in-flight field validation.

## Compose with sync rules

Prefer cheap sync checks first:

```ts
import { pipe, required, minLength } from "@sometic/validation";

form.register("username", {
    validators: [pipe(required(), minLength(3), usernameAvailable)],
    validateOn: "onChange",
    debounceMs: 300,
});
```

`pipe` short-circuits, the network call never runs for empty values. `all` / `runValidators` do not short-circuit.

## Submit and pending

`getFormMeta().pending` is true if any field is pending. Submit runs `validateForm` and waits for field validators (including async) before calling `onValid`. Avoid treating a form as valid while `pending` is true.

`handleSubmit` passes a fresh `AbortSignal` to `onValid(values, { context.signal })` for the submit request itself (separate from field validation signals).

## UX guidance

- Show a pending indicator from `meta.pending`.
- Keep debounce around 200-400ms for uniqueness checks.
- Prefer `onBlur` or debounced `onChange` for expensive calls; use `onSubmit` for final guarantees.
- Map API failures to issues with stable codes (`unavailable`, `rate-limited`).

## Related

- [Validation](/forms/validation)
- [Fields](/forms/fields)
- [Server errors](/forms/server-errors)
- [Form component](/components/form)
