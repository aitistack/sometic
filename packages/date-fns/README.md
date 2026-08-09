# `@sometic/date-fns`

date-fns adapter for the Sometic `DateAdapter` contract.

`createDateFnsDateAdapter` implements [`@sometic/date-core`](https://www.npmjs.com/package/@sometic/date-core) with date-fns helpers (`parse`, `parseISO`, `format`, `addDays` / `addMonths` / `addYears`, start/end of unit). date-fns stays a peer so tree-shaken function imports remain under your control inside the adapter package.

Choose this when your codebase already standardizes on date-fns formatting and arithmetic. Sometic date inputs then share the same semantics without teaching UI code about date-fns directly.

Standout behavior: ISO/`yyyy-MM-dd` parsing paths, format tokens via date-fns `format`, and `assertDateAdapter` on construction. `DateAdapterOptions` are accepted for contract symmetry with other adapters.

Related: [`@sometic/date-core`](https://www.npmjs.com/package/@sometic/date-core), [`@sometic/date-native`](https://www.npmjs.com/package/@sometic/date-native), [`@sometic/date-dayjs`](https://www.npmjs.com/package/@sometic/date-dayjs), [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom), [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [date primitives](https://sometic.aitistack.com/primitives/date).

## Install

One-click **Copy** controls (npm package pages cannot host clipboard buttons):

[Copy install commands on the docs](https://sometic.aitistack.com/guide/installation)

```bash
pnpm add @sometic/date-fns date-fns
```

```bash
npm install @sometic/date-fns date-fns
```

```bash
yarn add @sometic/date-fns date-fns
```

## Usage

Create the adapter and format values:

```ts
import { createDateFnsDateAdapter } from "@sometic/date-fns";

const adapter = createDateFnsDateAdapter();
const label = adapter.format(new Date(2026, 7, 9), "yyyy-MM-dd");
const parsed = adapter.parse("09/08/2026", "dd/MM/yyyy");
```

Inject into a date input controller:

```ts
import { createDateInputController } from "@sometic/dom/input-date";
import { createDateFnsDateAdapter } from "@sometic/date-fns";

const adapter = createDateFnsDateAdapter();
const dateInput = createDateInputController({ adapter });
```

## Peers / when not to use

Peer: `date-fns` (^4.0.0). Depends on `@sometic/date-core`.

Do not install this adapter unless you already want date-fns in the dependency graph. Prefer [`@sometic/date-native`](https://www.npmjs.com/package/@sometic/date-native) for a peer-free default, or [`@sometic/date-dayjs`](https://www.npmjs.com/package/@sometic/date-dayjs) for Day.js.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Date primitives](https://sometic.aitistack.com/primitives/date)
- [Date packages](https://sometic.aitistack.com/packages/date/)

## License

MIT
