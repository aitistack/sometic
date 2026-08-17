# `@sometic/head`

Portable document head / SEO controller with SSR serialization for Sometic.

`createHeadController` manages stacked head patches (title, meta, link, html/body attrs, JSON-LD) as a disposable, subscribeable controller. `applyHead` writes snapshots into a document; `serializeHead` produces markup-friendly output for SSR. SEO helpers under `@sometic/head/seo` build Open Graph, Twitter, canonical, hreflang, and route stacks.

It exists because head management is application behavior that should not be locked to one meta framework plugin. Controllers are framework-agnostic: React/Vue adapters or Vanilla apps can push route patches and tear them down on navigation. Conflict detection helps catch duplicate titles or competing canonicals during development.

Standout exports: `createHeadController`, `applyHead`, `serializeHead`, `mergePatches`, plus `createPageSeoPatch`, `createOpenGraphPatch`, `createTwitterPatch`, `createJsonLdPatch`, `createCanonicalLink`, `createHreflangLinks`, `createRouteHeadStack`, and `detectHeadConflicts`.

Depends on [`@sometic/core`](https://www.npmjs.com/package/@sometic/core). Often composed with [`@sometic/theme`](https://www.npmjs.com/package/@sometic/theme) and [`@sometic/app-shell`](https://www.npmjs.com/package/@sometic/app-shell) (theme attrs mirrored into head). Docs: [introduction](https://sometic.dev/guide/introduction) and [head utilities](https://sometic.dev/utilities/head).

## Install

```bash
pnpm add @sometic/head
```

```bash
npm install @sometic/head
```

```bash
yarn add @sometic/head
```

## Usage

Create a controller and apply snapshots in the browser:

```ts
import { applyHead, createHeadController } from "@sometic/head";

const head = createHeadController({
    initial: { title: "Sometic App" },
});

head.set("home", {
    title: "Home",
    meta: [{ name: "description", content: "Welcome" }],
});

head.subscribe((snapshot) => {
    applyHead(document, snapshot);
});
```

Build SEO patches with the seo subpath:

```ts
import { createCanonicalLink, createOpenGraphPatch, createPageSeoPatch } from "@sometic/head/seo";

head.set("product", {
    ...createPageSeoPatch({
        title: "Notebook",
        description: "A portable notebook",
    }),
    link: [createCanonicalLink("https://example.com/notebook")],
});

head.set(
    "product-og",
    createOpenGraphPatch({
        title: "Notebook",
        description: "A portable notebook",
        url: "https://example.com/notebook",
        type: "website",
    }),
);
```

## CDN

Docs: [https://sometic.dev/utilities/head](https://sometic.dev/utilities/head).

### Simple script

```html
<script src="https://cdn.jsdelivr.net/npm/@sometic/head@0.1.2/dist/cdn/sometic-head.iife.js"></script>
<script>
    const head = SometicHead.createHeadController();
    head.patch({ title: "Docs" });
</script>
```

### Module script

```html
<script type="module">
    import { createHeadController } from "https://cdn.jsdelivr.net/npm/@sometic/head@0.1.2/dist/cdn/sometic-head.esm.js";

    const head = createHeadController();
    head.patch({ title: "Docs" });
</script>
```

## Peers / when not to use

Depends on `@sometic/core`. No framework peers.

Skip `@sometic/head` if your framework already owns a complete head pipeline you will never share across stacks. Prefer framework meta APIs alone for tiny static marketing sites with no shared controller. Always call `applyHead` only in browser/document contexts.

## Docs

- [Introduction](https://sometic.dev/guide/introduction)
- [Head utilities](https://sometic.dev/utilities/head)
- [App shell](https://sometic.dev/guide/app-shell)

## License

MIT
