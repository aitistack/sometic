# Date adapters

Contract: `@sometic/date-core` (`DateAdapter`).

| Package               | Role                          |
| --------------------- | ----------------------------- |
| `@sometic/date-native` | Default `Date` implementation |
| `@sometic/date-dayjs`  | Optional; peer `dayjs`        |
| `@sometic/date-fns`    | Optional; peer `date-fns`     |

```ts
import { createNativeDateAdapter } from "@sometic/date-native";
import { createDateInputController } from "@sometic/dom/input-date";

const adapter = createNativeDateAdapter();
const date = createDateInputController({ adapter });
```

DatePicker UI is Phase 17. This phase only establishes the adapter boundary + date input bridge.
