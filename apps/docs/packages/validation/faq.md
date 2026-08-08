# Validation FAQ

## Why not mandate Zod?

Product rule: no schema-library lock-in. Native validators cover common cases; `SchemaAdapter` is the extension point.

## Can I use this without forms?

Yes. Forms depends on validation, not the reverse.

## How do issue codes work?

Stable `code` strings (`required`, `email`, `server`, …) plus human `message` and optional `path` / `params` for i18n.
