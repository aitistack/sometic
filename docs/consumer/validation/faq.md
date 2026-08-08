# Validation FAQ

See `apps/docs/packages/validation/faq.md` (canonical consumer FAQ mirrored for the docs app).

## Why under the hood?

Validators return `ValidationIssue` objects. `runValidators` normalizes results and fills `path`. Async helpers accept `AbortSignal`.
