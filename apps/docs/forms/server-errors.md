# Server errors

Map API validation failures onto the same issue model as client validators. Server issues participate in form validity until cleared, and can drive field meta + feedback.

::: tip System standout: protocol helper
Prefer `mapServerErrorBody` from `@sometic/forms/server` for `{ errors: [{ path|field, code, message }] }` and flat maps, then `form.setServerErrors(...)`. With App Shell, `bindMutationForm` wires this on mutation failure.
:::

## Setting errors

```ts
import { createIssue } from "@sometic/validation";

form.setServerErrors([
    createIssue("server", "Email is already registered", { path: "email" }),
    createIssue("taken", "Username is taken", { path: "username" }),
]);
```

Behavior:

1. Issues are copied into internal `serverIssues`.
2. For each issue with a `path`, the field meta is updated (same `code` replaced, then appended).
3. If feedback `error` is enabled and there is at least one issue, feedback becomes kind `"error"` with the first message (or `"Server rejected the submission."`).
4. `validateForm` / submit treat any remaining `serverIssues` as invalid even when field validators pass.

## Clearing

```ts
form.clearServerErrors(); // all
form.clearServerErrors(["email"]); // by path
```

When clearing by path, field issues are stripped only when `issue.code === "server"`. Custom codes such as `"taken"` remain on the field until you revalidate, `clearErrors`, or replace them with a new `setServerErrors` cycle. Prefer `code: "server"` when you want path clears to remove them automatically.

## Client external errors

```ts
form.setErrors([createIssue("conflict", "Fix the highlighted fields", { path: "email" })]);
form.clearErrors();
form.clearErrors(["email"]);
```

`setErrors` feeds `clientIssues` (not tagged as server). Use for cross-field messages you compute outside validators.

## Reading issues

```ts
form.getIssues(); // fields + client + server
form.getFieldIssues("email");
form.getFieldMeta("email").issues;
form.getFeedback(); // kind + message + issues
```

## Typical submit flow

```ts
const submit = form.handleSubmit({
    onValid: async (values) => {
        const response = await fetch("/api/register", {
            method: "POST",
            body: JSON.stringify(values),
        });
        if (response.status === 422) {
            const body = (await response.json()) as {
                errors: Array<{ path: string; message: string }>;
            };
            form.setServerErrors(
                body.errors.map((error) =>
                    createIssue("server", error.message, { path: error.path }),
                ),
            );
            return;
        }
        form.clearServerErrors();
    },
});
```

Clear server errors when the user edits a path if you want optimistic recovery:

```ts
form.subscribe(() => {
    /* or inside setValue wrappers */
});
// simpler: on field change
form.clearServerErrors(["email"]);
```

## Interaction with field validation

After a successful client revalidation, field issues refresh from validators but **retain** server issues that still match an entry in `serverIssues` (path + code + message). Explicitly `clearServerErrors` when the backend state is obsolete.

## Accessibility

Announce server failures with `announceFormErrors` and focus the first path via `focusFirstInvalid` from `@sometic/forms/a11y`. Keep messages actionable and tied to visible fields.

## Related

- [Validation](/forms/validation)
- [Async validation](/forms/async-validation)
- [Fields](/forms/fields)
- [Form component](/components/form)
