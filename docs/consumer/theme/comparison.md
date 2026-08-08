# Theme — Comparison

## vs CSS variables hand-written in `:root`

Sometic adds registration, system mode, persistence, density/RTL attributes, and a stable snapshot for any framework binding.

## vs `next-themes` / React-only theme providers

Those shine in Next.js apps. `@sometic/theme` stays framework-neutral so Vue/Svelte/Vanilla share one engine; adapters can wrap it later.

## vs design-token build tools (Style Dictionary)

Build tools excel at compile-time pipelines. This package is the **runtime** controller + helpers. Use both: generate tokens at build time, drive switching at runtime.

## vs putting tokens in `@sometic/styling`

Rejected by architecture: styling resolves classes/styles; theme owns tokens and generation (ADR-0003 / styling-model).

## When not to use

If you only need `clsx`-style class merging — use `@sometic/styling`. If you need a full Figma→code token CI — use a dedicated build pipeline and feed results into `defineTokens`.
