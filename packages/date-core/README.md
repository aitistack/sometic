# `@sometic/date-core`

Date adapter contract for Sometic date-aware inputs and forms.

`@sometic/date-core` defines the `DateAdapter` interface and `assertDateAdapter` helper. Adapters must implement parse/format, validity, compare, add, startOf/endOf, and serialize/deserialize. No concrete calendar library ships here; implementations live in separate packages.

This contract exists so date inputs and future date pickers can stay portable. Apps choose native `Date`, Day.js, or date-fns without rewriting UI engines. [`@sometic/dom`](https://www.npmjs.com/package/@sometic/dom) date input controllers accept a `DateAdapter` instead of importing a specific library.

Standout surface: `DateAdapter`, `DateAdapterOptions` (`locale`, `weekStartsOn`), `DateUnit` (`day` | `month` | `year`), `ParseResult`, and runtime assertion so malformed adapters fail early in tests.

Adapters: [`@sometic/date-native`](https://www.npmjs.com/package/@sometic/date-native) (default), [`@sometic/date-dayjs`](https://www.npmjs.com/package/@sometic/date-dayjs), [`@sometic/date-fns`](https://www.npmjs.com/package/@sometic/date-fns). Foundation context via [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) in the wider stack. Docs: [introduction](https://sometic.aitistack.com/guide/introduction) and [date primitives](https://sometic.aitistack.com/primitives/date).

## Install

One-click **Copy** controls (npm package pages cannot host clipboard buttons):

[Copy install commands on the docs](https://sometic.aitistack.com/guide/installation)

```bash
pnpm add @sometic/date-core
```

```bash
npm install @sometic/date-core
```

```bash
yarn add @sometic/date-core
```

Install a concrete adapter package as well (for example `@sometic/date-native`).

## Usage

Type against the contract when injecting an adapter:

```ts
import { assertDateAdapter, type DateAdapter } from "@sometic/date-core";

function formatIsoDate(adapter: DateAdapter, value: Date): string {
    assertDateAdapter(adapter);
    return adapter.serialize(value);
}
```

Consume adapter methods without caring which library backs them:

```ts
import type { DateAdapter } from "@sometic/date-core";

function addOneWeek(adapter: DateAdapter, value: Date): Date {
    return adapter.add(value, 7, "day");
}

function parseYmd(adapter: DateAdapter, text: string): Date | null {
    const result = adapter.deserialize(text);
    return result.valid ? result.date : null;
}
```

## Peers / when not to use

No peers. This package is types/contracts only plus `assertDateAdapter`.

Do not expect parsing/formatting to work from `@sometic/date-core` alone; install an adapter. Prefer adapter packages over inventing a one-off `DateAdapter` unless you are integrating another calendar library.

## Docs

- [Introduction](https://sometic.aitistack.com/guide/introduction)
- [Date primitives](https://sometic.aitistack.com/primitives/date)
- [Date packages](https://sometic.aitistack.com/packages/date/)

## License

MIT
