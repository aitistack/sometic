# Bundlers

Sometic packages are **ESM-first** with explicit `package.json` `exports` maps. They are authored for modern bundlers: Vite, Rollup, webpack 5+, esbuild, and Parcel.

## Contract

- Prefer **subpath imports**: `@sometic/react/button`, `@sometic/http`, `@sometic/head`
- Respect `exports` (no deep imports into `dist/` internals)
- Most logic packages set `"sideEffects": false`; custom-element registration entries are side-effectful by design
- No browser globals at import time (SSR-safe evaluation)

## Vite

```ts
import { defineConfig } from "vite";

export default defineConfig({
    // Subpath exports resolve natively. If a prebundle warning appears for a
    // workspace-linked package during monorepo development, add it to optimizeDeps.include.
    optimizeDeps: {
        include: ["@sometic/core", "@sometic/react"],
    },
});
```

## Rollup

```js
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
    input: "src/main.js",
    plugins: [
        nodeResolve({
            exportConditions: ["import", "module", "default"],
        }),
    ],
};
```

## webpack 5

Ensure `resolve.conditionNames` includes `import` / `module`. Fully specified ESM is not required for Sometic packages when using the published `exports` map.

## Smoke fixtures

Repository CI includes minimal consumer fixtures under `tooling/bundler-smoke/` that resolve and build against `@sometic/core`, `@sometic/react/button`, `@sometic/http`, and `@sometic/head`.

## Related

- [Tree shaking](/concepts/tree-shaking)
- [SSR](/guide/ssr)
- [Installation](/guide/installation)
- [Quick start](/guide/quick-start)
