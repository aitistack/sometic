# `@sometic/date-native`

Native JavaScript `Date` adapter for the Sometic `DateAdapter` contract.

`createNativeDateAdapter` implements [`@sometic/date-core`](https://www.npmjs.com/package/@sometic/date-core) using only the platform `Date` API. It is the default choice when you do not want Day.js or date-fns peers. Date-only strings use `yyyy-MM-dd` serialize/deserialize with calendar validation.

It exists so date inputs can work out of the box without pulling a calendar library. Zero-dependency adapters keep bundle size low for simple forms while still matching the same API used by Day.js and date-fns adapters.

Standout behavior: strict date-only parsing (rejects impossible calendar days), `add` / `startOf` / `endOf` for day/month/year, and `assertDateAdapter` at creation time. Optional `DateAdapterOptions` are accepted for API symmetry even when unused by the native implementation.

Use with [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) date inputs and [`@sometic/elements`](https://www.npmjs.com/package/@sometic/elements) `sometic-date-input`. Related: [`@sometic/date-dayjs`](https://www.npmjs.com/package/@sometic/date-dayjs), [`@sometic/date-fns`](https://www.npmjs.com/package/@sometic/date-fns), [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [date primitives](https://sometic.aitistack.com/primitives/date).

## Install

**Copy** buttons live on the docs (npm pages cannot run clipboard UI). Open the link, then click **Copy** next to pnpm / npm / yarn:

[Open install commands with Copy](https://sometic.aitistack.com/guide/installation)

```bash
pnpm add @sometic/date-native
```

```bash
npm install @sometic/date-native
```

```bash
yarn add @sometic/date-native
```

## Usage

Create the adapter and format a value:

```ts
import { createNativeDateAdapter } from "@sometic/date-native";

const adapter = createNativeDateAdapter();
const text = adapter.format(new Date(2026, 7, 9), "yyyy-MM-dd");
const parsed = adapter.deserialize("2026-08-09");
```

Pass it into a date input controller:

```ts
import { createDateInputController } from "@sometic/dom/input-date";
import { createNativeDateAdapter } from "@sometic/date-native";

const adapter = createNativeDateAdapter();
const dateInput = createDateInputController({ adapter });
```

## Peers / when not to use

Depends on `@sometic/date-core`. No calendar library peers.

Prefer [`@sometic/date-dayjs`](https://www.npmjs.com/package/@sometic/date-dayjs) or [`@sometic/date-fns`](https://www.npmjs.com/package/@sometic/date-fns) when you already standardize on those libraries for locale-heavy formatting. Native adapter format support is intentionally narrow (date-only oriented).

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Date primitives](https://sometic.aitistack.com/primitives/date)
- [Date packages](https://sometic.aitistack.com/packages/date/)

## License

MIT
