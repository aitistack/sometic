# `@sometic/feature-flags`

Framework-free feature flag evaluation for Sometic: define flags, apply remote config, and layer local overrides without pulling in a vendor SDK.

`createFeatureFlagController` resolves each flag from override, then remote, then default. Variants can be booleans, strings, numbers, or `null`, so a single key can drive both on/off checks and experiment arms. Controllers are disposable, SSR-safe, and never touch browser globals at import time.

Why it exists: product rollouts need the same evaluation rules in React, Vue, Vanilla, and workers. This package owns that resolution so every surface sees the same snapshot.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core) only.

Docs: [introduction](https://sometic.dev/guide/introduction) and [https://sometic.dev](https://sometic.dev).

## Install

```bash
pnpm add @sometic/feature-flags
```

```bash
npm install @sometic/feature-flags
```

```bash
yarn add @sometic/feature-flags
```

## Usage

```ts
import { createFeatureFlagController } from "@sometic/feature-flags";

const flags = createFeatureFlagController({
    flags: [
        { key: "checkout.v2", defaultValue: false, defaultVariant: "control" },
        { key: "theme", defaultValue: true, defaultVariant: "light" },
    ],
    remote: {
        "checkout.v2": { enabled: true, variant: "treatment" },
    },
});

if (flags.isEnabled("checkout.v2")) {
    renderCheckout(flags.getVariant("checkout.v2"));
}

flags.setOverride("checkout.v2", { enabled: false });
flags.clearOverrides();
flags.dispose();
```

Subscribe when the UI should react to remote refreshes or debug overrides:

```ts
const stop = flags.subscribe((snapshots) => renderFlags(snapshots));

flags.setRemote({ "checkout.v2": { enabled: true, variant: "treatment" } });
stop();
```

## API

- `createFeatureFlagController({ flags, remote?, overrides?, onChange? })`.
- `isEnabled(key)`, `getVariant(key)`, `getSnapshot(key)`, `list()`.
- `setOverride(key, override | null)`, `setRemote(remote)`, `clearOverrides()`.
- `subscribe(listener)`, `dispose()`, `disposed`.

Empty definitions, duplicate keys, blank keys, unknown keys, and calls after `dispose()` throw typed errors (`FEATURE_FLAG_*`).

## When not to use

Skip it when a hosted flag service already owns evaluation and you only need their SDK. Prefer a full experimentation platform when you need targeting rules, percentage rollouts, or analytics attribution baked in. This package evaluates flags you already have; it does not fetch them for you.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [https://sometic.dev](https://sometic.dev)

## License

MIT
