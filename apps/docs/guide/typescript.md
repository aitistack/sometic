# TypeScript

Every published `@sometic/*` package ships TypeScript declarations next to ESM builds. Prefer TypeScript for application code; JavaScript remains supported.

## Setup

- Module resolution that understands `exports` (Node16 / Bundler).
- `strict` recommended. Sometic itself uses strict flags including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- With `exactOptionalPropertyTypes`, omit optional props instead of passing `undefined` unless the type allows `undefined`.

## Usage

```ts
import { createStore } from "@sometic/store";
import { Button } from "@sometic/react/button";

type CounterState = { count: number };

const store = createStore<CounterState>({ count: 0 });

store.update((state) => ({ count: state.count + 1 }));
```

Import types from the same subpaths you use for values:

```ts
import type { ButtonProps } from "@sometic/react/button";
import type { Store } from "@sometic/store";
```

## Adapters

| Package             | Typing notes                                                           |
| ------------------- | ---------------------------------------------------------------------- |
| `@sometic/react`    | Props types exported beside components; hooks typed to store selectors |
| `@sometic/vue`      | Component props via shipped `.d.ts`; `useStore` returns `ComputedRef`  |
| `@sometic/elements` | Element instance types + event detail types on `/events`               |
| Wave B/C            | Narrow bind types (`AngularStoreBind`, …) and capability constants     |

## Errors

Typed errors use stable codes (`SometicError`, `isSometicError`). Prefer narrowing on `code` over string matching messages.

## FAQ

### Do I need a triple-slash reference?

No. Install the package and import normally.

### Can I weaken strictness to consume Sometic?

You can, but optional prop and `unknown` catch edges are easier under strict settings that match the library.

### Where are deep API lists?

Start from [API packages](/api/packages) and the live section docs ([Components](/components/), [Stores](/stores/)).

## Related

- [JavaScript](/guide/javascript)
- [Components](/components/)
- [Stores](/stores/)
- [Beta maturity](/releases/beta)
