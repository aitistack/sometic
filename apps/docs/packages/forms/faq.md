# Forms FAQ

## How is async validation race-safe?

Each field keeps a token + `AbortController`. Only the latest run may write issues.

## Do server errors clear on revalidate?

No. Client revalidation retains server issues until `clearServerErrors`.

## Are drafts encrypted?

No. Injectable `DraftStorage` is the boundary; document PII risk for `localStorage`.

## Can I turn off success/error feedback?

Yes. Feedback is **on by default**. Disable all with `feedback: false`, or selectively:

```ts
createForm({
    defaultValues: {},
    feedback: { validation: true, success: false, error: true },
});
```

Use `getFeedback()` / `clearFeedback()` / `setFeedback()` to read or replace the current response.
