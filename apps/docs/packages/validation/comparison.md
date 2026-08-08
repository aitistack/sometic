# Validation comparison

| Approach                         | When to use                                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| `@sometic/validation`            | Portable validators shared across Vanilla/React/Vue without a schema lib |
| Zod / Yup / Valibot              | Prefer your existing schemas; wrap later via `SchemaAdapter` when needed |
| HTML constraint validation alone | Simple native forms; insufficient for cross-field/async/server errors    |

Sometic does **not** require a schema library. Optional adapters are additive.
