# JavaScript

Sometic packages are plain ESM. You can consume them from JavaScript without compiling to TypeScript.

## Usage

```js
import { createStore } from "@sometic/store";
import { Button } from "@sometic/react/button";

const store = createStore({ count: 0 });

store.update((state) => ({ count: state.count + 1 }));
```

## Editor types (optional)

JSDoc imports give editor intellisense without a TS build:

```js
/**
 * @typedef {import("@sometic/theme").ThemeConfiguration} ThemeConfiguration
 */

/** @type {ThemeConfiguration} */
const config = {/* theme options */};
```

Check each package’s `.d.ts` for the exact exported type names.

## Subpaths

Subpath imports work the same as in TypeScript:

```js
import { useStore } from "@sometic/vue/store";
import "@sometic/elements/button";
```

## Caveats

- `exactOptionalPropertyTypes` does not apply in JS, but runtime still treats missing vs `undefined` differently in some engines. Prefer omitting unused options.
- Prefer `isSometicError` (or equivalent) when branching on failures instead of duck-typing message strings.
- Framework peers (`react`, `vue`, …) still apply.

## Related

- [TypeScript](/guide/typescript)
- [Components](/components/)
- [Frameworks](/frameworks/)
- [Beta maturity](/releases/beta)
