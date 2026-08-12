# Query builder comparison

| Option | Strengths | Tradeoffs |
| ------ | --------- | --------- |
| **`@sometic/query-builder`** | Typed AST, validation, serialize, data-table bridge, framework-agnostic | No visual builder CE/React shell yet; not SQL |
| **react-querybuilder** | Polished React UI for rules | React-first; separate model from Sometic tables |
| **Hand-rolled filter form** | Fast for 1–2 fields | Nested AND/OR and operator catalogs grow messy |
| **SQL / ORMs directly in UI** | Powerful | Unsafe if you expose raw SQL; poor a11y story |

Choose Sometic when filters must round-trip into `@sometic/data-table` and stay portable. Choose react-querybuilder when you want a ready-made React chrome and can map its JSON to your API. Prefer a simple form when you only need name contains + role equals.
