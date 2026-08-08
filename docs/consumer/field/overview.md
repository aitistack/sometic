# Field overview

`@sometic/dom/field` generates stable ids and aria wiring for label, description, and error text around a control.

```ts
import { createFieldIds, resolveField } from "@sometic/dom/field";

const ids = createFieldIds();
const view = resolveField({ ids, hasDescription: true, hasError: true, invalid: true });
// view.controlAttributes includes aria-labelledby / aria-describedby / aria-invalid
```

Forms/validation arrive in Phase 9. See Input FAQ for controlled value rules.
