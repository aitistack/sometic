# `@sometic/date-native`

Default lightweight `Date` adapter for `@sometic/date-core`.

```bash
pnpm add @sometic/date-core @sometic/date-native
```

```ts
import { createNativeDateAdapter } from "@sometic/date-native";

const adapter = createNativeDateAdapter();
adapter.serialize(new Date(2024, 0, 15)); // "2024-01-15"
```

## License

MIT
