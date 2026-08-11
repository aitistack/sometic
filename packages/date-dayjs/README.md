# `@sometic/date-dayjs`

Day.js adapter for the Sometic `DateAdapter` contract.

`createDayjsDateAdapter(dayjsApi)` wraps a Day.js factory so Sometic date inputs can parse, format, add, and serialize dates through Day.js while UI engines stay library-agnostic. Day.js remains a peer; this package only adapts it to [`@sometic/date-core`](https://www.npmjs.com/package/@sometic/date-core).

Use it when your app already depends on Day.js and you want one calendar stack for both domain code and Sometic date fields. Pass the same `dayjs` import you use elsewhere (including any plugins you configure before creating the adapter).

Standout details: date-only `YYYY-MM-DD` / `yyyy-MM-dd` handling, `serialize`/`deserialize` for stable form values, and `assertDateAdapter` on create. `DateAdapterOptions` are accepted for contract symmetry.

Related packages: [`@sometic/date-core`](https://www.npmjs.com/package/@sometic/date-core), [`@sometic/date-native`](https://www.npmjs.com/package/@sometic/date-native), [`@sometic/date-fns`](https://www.npmjs.com/package/@sometic/date-fns), [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom), [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [date primitives](https://sometic.aitistack.com/primitives/date).

## Install

```bash
pnpm add @sometic/date-dayjs dayjs
```

```bash
npm install @sometic/date-dayjs dayjs
```

```bash
yarn add @sometic/date-dayjs dayjs
```

## Usage

Create an adapter from your Day.js import:

```ts
import dayjs from "dayjs";
import { createDayjsDateAdapter } from "@sometic/date-dayjs";

const adapter = createDayjsDateAdapter(dayjs);
const label = adapter.format(new Date(2026, 7, 9), "YYYY-MM-DD");
const next = adapter.add(new Date(2026, 7, 9), 1, "month");
```

Wire it into a DOM date input controller:

```ts
import dayjs from "dayjs";
import { createDateInputController } from "@sometic/dom/input-date";
import { createDayjsDateAdapter } from "@sometic/date-dayjs";

const adapter = createDayjsDateAdapter(dayjs);
const dateInput = createDateInputController({ adapter });
```

## Peers / when not to use

Peer: `dayjs` (^1.11.0). Depends on `@sometic/date-core`.

Skip this package if you do not use Day.js. Prefer [`@sometic/date-native`](https://www.npmjs.com/package/@sometic/date-native) for zero calendar peers, or [`@sometic/date-fns`](https://www.npmjs.com/package/@sometic/date-fns) for date-fns stacks.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Date primitives](https://sometic.aitistack.com/primitives/date)
- [Date packages](https://sometic.aitistack.com/packages/date/)

## License

MIT
