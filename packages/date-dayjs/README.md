# `@sometic/date-dayjs`

Optional Day.js adapter for `@sometic/date-core`.

```bash
pnpm add @sometic/date-core @sometic/date-dayjs dayjs
```

```ts
import dayjs from "dayjs";
import { createDayjsDateAdapter } from "@sometic/date-dayjs";

const adapter = createDayjsDateAdapter(dayjs);
```

## License

MIT
