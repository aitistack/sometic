# Date adapters

Sometic date handling is adapter-based. `@sometic/date-core` defines the `DateAdapter` contract. Implementations live in separate packages so Day.js and date-fns stay optional peers.

Date **input** controllers live in `@sometic/dom/input-date`. Calendar / DatePicker catalogs beyond the shipped input are not invented here; use the date input and adapter boundary that already shipped.

## Overview

| Package                | Role                                         | Peer       |
| ---------------------- | -------------------------------------------- | ---------- |
| `@sometic/date-core`   | `DateAdapter` contract + `assertDateAdapter` | none       |
| `@sometic/date-native` | Default `Date` implementation                | none       |
| `@sometic/date-dayjs`  | Day.js bridge                                | `dayjs`    |
| `@sometic/date-fns`    | date-fns bridge                              | `date-fns` |

### When to use

- Parsing / formatting dates for `@sometic/dom` date inputs
- Keeping calendar math out of UI adapters
- Swapping native vs Day.js vs date-fns without rewriting controllers

### When not to use

- Full application i18n calendars with custom locales beyond adapter options (extend or wrap the adapter)
- Treating deferred calendar picker catalogs as shipped (they are not)
- Storing timezone policy in the UI layer without an explicit adapter strategy

## Installation

Default (native):

<InstallCommands packages="@sometic/date-core @sometic/date-native" />

Optional peers:

Day.js:

<InstallCommands packages="@sometic/date-dayjs dayjs" />

date-fns:

<InstallCommands packages="@sometic/date-fns date-fns" />

## Usage

### Native adapter + date input controller

```ts
import { createNativeDateAdapter } from "@sometic/date-native";
import { assertDateAdapter } from "@sometic/date-core";
import { createDateInputController } from "@sometic/dom/input-date";

const adapter = createNativeDateAdapter({
    locale: "en-US",
    weekStartsOn: 1,
});
assertDateAdapter(adapter);

const date = createDateInputController({
    adapter,
    defaultValue: null,
    onValueChange: (value) => {
        console.log(value);
    },
});

const parsed = adapter.parse("2026-08-06");
if (parsed.valid) {
    date.value.set(parsed.date);
}

date.setFromNativeValue("2026-08-06");
```

### Day.js / date-fns

```ts
import dayjs from "dayjs";
import { createDayjsDateAdapter } from "@sometic/date-dayjs";
import { createDateFnsDateAdapter } from "@sometic/date-fns";

const dayjsAdapter = createDayjsDateAdapter(dayjs, { locale: "en" });
const dateFnsAdapter = createDateFnsDateAdapter({ weekStartsOn: 0 });
```

Inject the same `DateAdapter` shape into any controller that accepts `adapter`.

## Key APIs

### `DateAdapter`

```ts
type DateAdapter = {
    parse(value: string, format?: string): ParseResult;
    format(date: Date, format?: string): string;
    isValid(date: Date): boolean;
    compare(a: Date, b: Date): number;
    add(date: Date, amount: number, unit: DateUnit): Date;
    startOf(date: Date, unit: DateUnit): Date;
    endOf(date: Date, unit: DateUnit): Date;
    serialize(date: Date): string;
    deserialize(value: string): ParseResult;
};

type DateUnit = "day" | "month" | "year";
type ParseResult = { date: Date | null; valid: boolean };
```

| Factory                                      | Package                |
| -------------------------------------------- | ---------------------- |
| `createNativeDateAdapter(options?)`          | `@sometic/date-native` |
| `createDayjsDateAdapter(dayjsApi, options?)` | `@sometic/date-dayjs`  |
| `createDateFnsDateAdapter(options?)`         | `@sometic/date-fns`    |
| `assertDateAdapter(adapter)`                 | `@sometic/date-core`   |

`DateAdapterOptions`: optional `locale`, `weekStartsOn` (`0`-`6`).

## How it works

Controllers depend on the contract, not on a specific library. Native uses the platform `Date`. Day.js and date-fns adapters translate to the same methods so DOM / React / Vue date inputs stay identical.

`serialize` / `deserialize` are the persistence seam (ISO-oriented). `parse` / `format` are display seams and may accept optional format strings depending on the adapter.

## Edge cases

| Edge                              | Behavior                                                                    |
| --------------------------------- | --------------------------------------------------------------------------- |
| Invalid parse                     | `{ date: null, valid: false }`                                              |
| Missing peer for dayjs / date-fns | Install the peer; adapters do not bundle libraries                          |
| Custom adapter                    | Implement `DateAdapter` and pass `assertDateAdapter` in tests               |
| Time zones                        | Adapters use the host environment; document your app’s TZ policy separately |

## FAQ

### Which adapter should I pick?

Start with `@sometic/date-native`. Switch to Day.js or date-fns when your app already standardizes on those libraries.

### Why inject Day.js as an argument?

So the adapter never imports a hard dependency at package load time beyond the peer contract, and tests can pass a stub API.

### Is there a DatePicker component catalog?

Use the shipped [Date input](/components/date-input) and this adapter boundary. Broader calendar picker catalogs are outside this docs pass; do not assume Deferred catalogs are published.

### Can forms validate dates?

Yes. Combine adapter parse results with [`@sometic/validation`](/primitives/validation) and [Forms](/forms/).

## Related

- [Date input](/components/date-input)
- [DOM engines](/primitives/dom)
- [Validation](/primitives/validation)
- [Forms](/forms/)
- [Package index](/api/packages)
- [Components](/components/)
