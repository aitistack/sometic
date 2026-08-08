# Styling — FAQ

## Does this install Tailwind or Bootstrap?

No. Those stay consumer dependencies. Pass class names (or use `createClassResolver({ merge })` with your own merger).

## How do I get Tailwind class conflict merging?

```ts
import { createClassResolver } from "@sometic/styling/classes";
import { twMerge } from "tailwind-merge";

const cx = createClassResolver({ merge: (tokens) => twMerge(tokens.join(" ")) });
```

## What does `unstyled` do?

Skips **defaults** and **variants** layers inside `resolveStyleable`. Behavior-required, state, user, and `cssVariables` still apply so accessibility hooks and consumer overrides remain.

## Why are state classes applied when `unstyled`?

So consumers can still style `[data-disabled]` / state class hooks without shipping our visual defaults.

## Are `data-*` attributes boolean `"true"` or empty?

Default is `"true"`. Pass `{ booleanValue: "" }` for empty-string presence style.

## Where do design tokens live?

Phase 5 `@sometic/theme`. This package only merges consumer-provided CSS variables into `style`.

## Is `asChild` supported?

Not in `@sometic/styling`. Use `resolvePolymorphicAs` for element swapping; adapters own framework-specific composition.

## SSR / import safety?

Pure functions. No `window`, `document`, or CSSOM access at import time.

## Bundle size?

Root entry budget ≤ 2 KB gzip. Prefer subpath imports (`/classes`, `/styles`, `/slots`, `/state`, `/polymorphic`) when you need only one surface.
