# Head / SEO

`@sometic/head` is a portable document-head controller: nestable title/meta/link patches, SSR serialization, and thin React/Vue adapters. It is not a React-only Helmet fork. The same engine works across stacks.

::: tip System standout: SEO recipes + theme bind
Use `@sometic/head/seo` for page/OG/Twitter/canonical/hreflang/JSON-LD patches, `createRouteHeadStack`, and `detectHeadConflicts`. Pair with [`bindThemeToHead`](/guide/app-shell) so `color-scheme` and `theme-color` stay in sync with `@sometic/theme`.
:::

<CopyPrompt surface="head" />

## Overview

| Concern       | API                                                                               |
| ------------- | --------------------------------------------------------------------------------- |
| Create        | `createHeadController(options?)`                                                  |
| Patch         | `set(id, patch)` / `remove(id)`                                                   |
| Read          | `get()` → `HeadSnapshot`                                                          |
| Subscribe     | `subscribe(listener)` → unsubscribe                                               |
| Browser apply | `applyHead(document, snapshot)`                                                   |
| SSR           | `serializeHead(snapshot)`                                                         |
| Merge         | `mergePatches(patches)`                                                           |
| React         | `HeadProvider`, `Head`, `useHead`, `useHeadController` from `@sometic/react/head` |
| Vue           | `provideHead`, `useHead`, `useHeadController` from `@sometic/vue/head`            |

## Installation

<InstallCommands packages="@sometic/head" />

React adapter (peer):

<InstallCommands packages="@sometic/react @sometic/head" />

Vue adapter (peer):

<InstallCommands packages="@sometic/vue @sometic/head" />

## Usage

::: code-group

```js [JS]
import { applyHead, createHeadController, serializeHead } from "@sometic/head";

const head = createHeadController({
    initial: { title: "Sometic", titleTemplate: "%s | Docs" },
});

head.set("page", {
    title: "Architecture",
    meta: [{ name: "description", content: "Controllers and adapters" }],
});

applyHead(document, head.get());
const ssrTags = serializeHead(head.get());
```

```ts [TS]
import { applyHead, createHeadController, serializeHead, type HeadPatch } from "@sometic/head";

const head = createHeadController({
    initial: { title: "Sometic", titleTemplate: "%s | Docs" },
});

const patch: HeadPatch = {
    title: "Architecture",
    meta: [{ name: "description", content: "Controllers and adapters" }],
};
head.set("page", patch);

applyHead(document, head.get());
const ssrTags: string = serializeHead(head.get());
```

```js [Vanilla]
import { applyHead, createHeadController, serializeHead } from "@sometic/head";

const head = createHeadController({
    initial: { title: "Sometic", titleTemplate: "%s | Docs" },
});

head.set("page", {
    title: "Architecture",
    meta: [{ name: "description", content: "Controllers and adapters" }],
    link: [{ rel: "canonical", href: "https://sometic.dev/architecture" }],
    htmlAttrs: { lang: "en" },
    bodyAttrs: { class: "docs" },
    jsonLd: [{ type: "application/ld+json", data: { "@type": "WebSite", name: "Sometic" } }],
});

const stop = head.subscribe((snapshot) => {
    applyHead(document, snapshot);
});
applyHead(document, head.get());

// SSR string for <head> injection:
const tags = serializeHead(head.get());
```

```html [CDN Simple]
<script src="https://cdn.jsdelivr.net/npm/@sometic/head@0.1.2/dist/cdn/sometic-head.iife.js"></script>
<script>
    const head = SometicHead.createHeadController();
    head.patch({ title: "Docs" });
</script>
```

```html [CDN Module]
<script type="module">
    import { createHeadController } from "https://cdn.jsdelivr.net/npm/@sometic/head@0.1.2/dist/cdn/sometic-head.esm.js";

    const head = createHeadController();
    head.patch({ title: "Docs" });
</script>
```

:::

### React

```tsx
import { Head, HeadProvider } from "@sometic/react/head";

export function App() {
    return (
        <HeadProvider options={{ initial: { titleTemplate: "%s | Sometic" } }}>
            <Head title="Home" meta={[{ name: "description", content: "…" }]} />
            {/* routes */}
        </HeadProvider>
    );
}
```

```tsx
import { useHead } from "@sometic/react/head";

export function ProductPage({ name }: { name: string }) {
    useHead({
        title: name,
        meta: [{ property: "og:title", content: name }],
    });
    return <h1>{name}</h1>;
}
```

### Vue

```ts
import { provideHead, useHead } from "@sometic/vue/head";

provideHead({ initial: { titleTemplate: "%s | Sometic" } });
useHead({ title: "Home" });
```

## `HeadPatch` fields

| Field           | Type           | Description                                                                                                                                                             |
| --------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`         | `string`       | Document title segment. Combined with `titleTemplate` when present.                                                                                                     |
| `titleTemplate` | `string`       | Template for the final title. If it contains `%s`, that token is replaced with `title`. Otherwise the engine concatenates `title` + space + template when both are set. |
| `meta`          | `HeadMeta[]`   | Meta tags to merge (see below).                                                                                                                                         |
| `link`          | `HeadLink[]`   | Link tags to merge (see below).                                                                                                                                         |
| `htmlAttrs`     | `HeadAttrs`    | Attributes applied to `<html>` (`Record<string, string \| undefined>`).                                                                                                 |
| `bodyAttrs`     | `HeadAttrs`    | Attributes applied to `<body>`.                                                                                                                                         |
| `jsonLd`        | `HeadJsonLd[]` | JSON-LD script payloads (see below).                                                                                                                                    |

Patches are layered by `set(id, patch)` order. Later patches override earlier ones for scalar fields; `meta` / `link` / `jsonLd` arrays are concatenated across layers; attr maps are merged key-by-key.

### `HeadMeta`

| Field       | Type     | Description                 |
| ----------- | -------- | --------------------------- |
| `name`      | `string` | Standard meta `name`        |
| `property`  | `string` | Open Graph–style `property` |
| `content`   | `string` | Meta content                |
| `charset`   | `string` | Charset meta                |
| `httpEquiv` | `string` | `http-equiv` meta           |

### `HeadLink`

| Field         | Type     | Description             |
| ------------- | -------- | ----------------------- |
| `rel`         | `string` | Required. Link relation |
| `href`        | `string` | Required. Target URL    |
| `as`          | `string` | Resource hint `as`      |
| `type`        | `string` | MIME type               |
| `crossOrigin` | `string` | CORS mode               |
| `media`       | `string` | Media query             |

### `HeadJsonLd`

| Field  | Type                                                   | Description                                                            |
| ------ | ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `type` | `string`                                               | Optional script type (defaults to JSON-LD handling in serialize/apply) |
| `data` | `Record<string, unknown> \| Record<string, unknown>[]` | Structured data object(s)                                              |

### `HeadSnapshot` (from `get()`)

| Field       | Type                     | Description                                |
| ----------- | ------------------------ | ------------------------------------------ |
| `title`     | `string`                 | Resolved title after template merge        |
| `meta`      | `HeadMeta[]`             | Merged meta list                           |
| `link`      | `HeadLink[]`             | Merged link list                           |
| `htmlAttrs` | `Record<string, string>` | Merged html attrs (undefined keys dropped) |
| `bodyAttrs` | `Record<string, string>` | Merged body attrs                          |
| `jsonLd`    | `HeadJsonLd[]`           | Merged JSON-LD entries                     |

## Controller API

### `createHeadController(options?)`

| Option    | Type        | Description                          |
| --------- | ----------- | ------------------------------------ |
| `initial` | `HeadPatch` | Seed patch registered as id `"root"` |

Returns `HeadController`:

| Method      | Signature                                                    | Description                 |
| ----------- | ------------------------------------------------------------ | --------------------------- |
| `get`       | `() => HeadSnapshot`                                         | Current merged snapshot     |
| `set`       | `(id: string, patch: HeadPatch) => void`                     | Upsert a named patch layer  |
| `remove`    | `(id: string) => void`                                       | Remove a patch layer        |
| `subscribe` | `(listener: (snapshot: HeadSnapshot) => void) => () => void` | Listen for changes          |
| `dispose`   | `() => void`                                                 | Clear listeners and patches |

### `applyHead(document, snapshot)`

Writes the snapshot into a live `Document`: title, meta/link tags managed by the engine, `html`/`body` attributes, and JSON-LD script nodes. Call only in the browser (or any environment with a real `Document`).

### `serializeHead(snapshot)`

Returns an HTML string fragment suitable for SSR `<head>` injection (title, meta, link, JSON-LD scripts). Does not include `htmlAttrs` / `bodyAttrs` as tags. Apply those on the server template’s `<html>` / `<body>` from the snapshot fields.

### `mergePatches(patches)`

Pure merge of an ordered `HeadPatch[]` into a `HeadSnapshot` (same rules as the controller).

## SEO helpers (`@sometic/head/seo`)

| Helper                 | Role                                                           |
| ---------------------- | -------------------------------------------------------------- |
| `createPageSeoPatch`   | Title / description / robots / keywords                        |
| `createOpenGraphPatch` | `og:*` meta                                                    |
| `createTwitterPatch`   | Twitter card meta                                              |
| `createCanonicalLink`  | Canonical `<link>`                                             |
| `createHreflangLinks`  | Alternate language links                                       |
| `createJsonLdPatch`    | Article / Product / Organization / SoftwareApplication JSON-LD |
| `createRouteHeadStack` | `enter(routeId, patch)` / `leave(routeId)` over controller ids |
| `detectHeadConflicts`  | Non-throwing warnings (duplicate names, OG without canonical)  |

## React adapters (`@sometic/react/head`)

### `HeadProvider`

| Prop         | Type                          | Default | Description                                           |
| ------------ | ----------------------------- | ------- | ----------------------------------------------------- |
| `controller` | `HeadController`              | -       | Optional external controller                          |
| `options`    | `CreateHeadControllerOptions` | -       | Used when `controller` is omitted                     |
| `apply`      | `boolean`                     | `true`  | When `true`, subscribe and `applyHead` in the browser |
| `children`   | `ReactNode`                   | -       | Tree that can call `useHead` / render `Head`          |

### `Head`

Accepts all `HeadPatch` fields as props, plus optional `children` (rendered through; head side effects only). Registers a patch via `useHead` with a stable React `useId`.

### `useHead(patch)`

Registers `patch` for the component lifetime; removes on unmount. Requires `HeadProvider`.

### `useHeadController()`

Returns the context `HeadController`. Throws if no provider.

Also re-exports `createHeadController`, `applyHead`, `serializeHead`, and head types.

## Vue adapters (`@sometic/vue/head`)

### `provideHead(optionsOrController?, apply = true)`

Provides a controller (creates one from `CreateHeadControllerOptions` unless you pass an existing controller). When `apply` is true, subscribes and calls `applyHead`. Disposes a created controller on scope dispose.

### `useHead(patch, id?)`

Registers `patch` under `id` (random id by default). Requires `provideHead`. Updates reactively via `watchEffect`.

### `useHeadController()`

Injects the provided controller. Throws if missing.

Also re-exports core head APIs and types.

## SSR

1. Create a controller (or merge patches) on the server.
2. Call `serializeHead(controller.get())` and inject into HTML `<head>`.
3. Apply `htmlAttrs` / `bodyAttrs` from the snapshot onto your document shell.
4. Do **not** call `applyHead` during SSR module evaluation, only after you have a `Document`, or skip apply and serialize only.
5. On the client, hydrate with the same initial patch (or `apply: false` on the provider until ready) so the first client apply does not thrash.

## When to use / When not

**Use** when you need portable head management across React, Vue, and Vanilla with one merge model and SSR serialization.

**Do not use** if you only need a one-off static `<title>` in a single HTML file with no nesting or SSR; plain markup is enough.

## FAQ

**How is this different from `react-helmet-async`?** Helmet is React-tree oriented. `@sometic/head` is a framework-agnostic controller: the same `HeadPatch` / snapshot / `serializeHead` path works in Vanilla and Vue. React/Vue adapters are thin. You are not locked into a React-only head library.

**Does it replace `react-helmet-async` in a React app?** It can for title/meta/link/json-ld/html/body attrs. If you depend on Helmet-specific APIs or ecosystem plugins, migrate patch-by-patch.

**Can I nest patches?** Yes. Each `set(id, patch)` / `useHead` / `<Head>` is a layer. Remove or unmount to drop a layer.

**Title template with `%s`?** `titleTemplate: "%s | Docs"` and `title: "Home"` → `"Home | Docs"`.

**Who owns meta deduplication?** Arrays concatenate across layers. Prefer stable ids and replace whole patches when updating a page so you do not accumulate duplicate metas.

**SSR + client apply?** Serialize on the server; `HeadProvider` / `provideHead` apply in the browser by default. Pass `apply={false}` / `provideHead(…, false)` when you need manual control.

**Bundle tip?** Import from `@sometic/head` (or `@sometic/react/head` / `@sometic/vue/head`); keep peers external in adapters.

## Related

- [SSR](/guide/ssr)
- [HTTP](/utilities/http)
- [Comparison](/guide/comparison)
- [Package index](/api/packages)
