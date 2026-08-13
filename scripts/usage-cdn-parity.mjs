import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const componentsDir = join(root, "apps/docs/components");

/** @param {string} name */
function packageVersion(name) {
    const pkg = JSON.parse(
        readFileSync(join(root, "packages", name, "package.json"), "utf8"),
    );
    return String(pkg.version);
}

const ELEMENTS_VERSION = packageVersion("elements");
const ELEMENTS_IIFE = `https://cdn.jsdelivr.net/npm/@sometic/elements@${ELEMENTS_VERSION}/dist/cdn/sometic-elements.iife.js`;
const ELEMENTS_ESM = `https://cdn.jsdelivr.net/npm/@sometic/elements@${ELEMENTS_VERSION}/dist/cdn/sometic-elements.esm.js`;

const CDN_NOT_SHIPPED = `\`\`\`html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
\`\`\``;

/** @param {string} markup */
function cdnFromMarkup(markup) {
    const trimmed = markup.trim();
    return `\`\`\`html [CDN Simple]
<script src="${ELEMENTS_IIFE}"></script>

${trimmed}
\`\`\`

\`\`\`html [CDN Module]
<script
    type="module"
    src="${ELEMENTS_ESM}"
></script>

${trimmed}
\`\`\``;
}

/**
 * @param {string} ceBody
 */
function extractTagMarkup(ceBody) {
    const lines = ceBody.split("\n");
    const tags = [];
    let inScript = false;
    let pastScript = false;
    for (const line of lines) {
        if (line.includes("<script")) {
            inScript = true;
        }
        if (inScript) {
            if (line.includes("</script>")) {
                inScript = false;
                pastScript = true;
            }
            continue;
        }
        if (pastScript || line.includes("<sometic-")) {
            if (line.trim()) {
                tags.push(line);
            }
        }
    }
    const joined = tags.join("\n").trim();
    return joined.includes("<sometic-") ? joined : null;
}

/**
 * @param {string} text
 */
function transformComponent(text) {
    let next = text.replaceAll("[CE]", "[Custom Elements (Web Components)]");
    next = next.replaceAll("```tsx [JS]", "```tsx [React]");
    next = next.replaceAll("```ts [JS]", "```ts [React]");
    next = next.replaceAll("```jsx [JS]", "```jsx [React]");

    const usageMatch = next.match(/## Usage\s*\n+::: code-group\n([\s\S]*?)\n:::/);
    if (!usageMatch) {
        return next;
    }

    const group = usageMatch[1];
    if (group.includes("[CDN]") || group.includes("[CDN Simple]")) {
        return next;
    }

    const fenceRe = /```(\w+) \[([^\]]+)\]\n([\s\S]*?)```/g;
    /** @type {{lang: string, label: string, body: string}[]} */
    const fences = [];
    let m;
    while ((m = fenceRe.exec(group)) !== null) {
        fences.push({ lang: m[1], label: m[2], body: m[3].trimEnd() });
    }

    if (fences.length === 0) {
        return next;
    }

    const ce = fences.find((f) => f.label.startsWith("Custom Elements"));
    let cdnBlock = CDN_NOT_SHIPPED;
    if (ce && !/not shipped/i.test(ce.body)) {
        const markup = extractTagMarkup(ce.body);
        if (markup) {
            cdnBlock = cdnFromMarkup(markup);
        }
    }

    const rebuilt = `## Usage

::: code-group

${fences.map((f) => `\`\`\`${f.lang} [${f.label}]\n${f.body}\n\`\`\``).join("\n\n")}

${cdnBlock}
:::`;

    return next.replace(usageMatch[0], rebuilt);
}

let changed = 0;
for (const file of readdirSync(componentsDir).filter((f) => f.endsWith(".md"))) {
    const path = join(componentsDir, file);
    const before = readFileSync(path, "utf8");
    const next = transformComponent(before);
    if (next !== before) {
        writeFileSync(path, next, "utf8");
        changed += 1;
        console.log("updated", file);
    }
}
console.log(`components: ${changed} files`);

/**
 * @param {string} pkg
 * @param {string} fileBase
 */
function cdnUrls(pkg, fileBase) {
    const version = packageVersion(pkg);
    return {
        iife: `https://cdn.jsdelivr.net/npm/@sometic/${pkg}@${version}/dist/cdn/${fileBase}.iife.js`,
        esm: `https://cdn.jsdelivr.net/npm/@sometic/${pkg}@${version}/dist/cdn/${fileBase}.esm.js`,
    };
}

/** @type {Record<string, { simple: string, module: string }>} */
const systemPages = {
    "apps/docs/guide/app-shell.md": (() => {
        const { iife, esm } = cdnUrls("app-shell", "sometic-app-shell");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const app = SometicAppShell.createSometicApp({
        auth,
        baseUrl: "/api",
        query: true,
    });

    app.http.get("/me").then((me) => {
        console.log(me);
    });
    app.dispose();
</script>`,
            module: `import { createSometicApp } from "${esm}";

const app = createSometicApp({
    auth,
    baseUrl: "/api",
    query: true,
});

const me = await app.http.get("/me");
app.dispose();`,
        };
    })(),
    "apps/docs/utilities/http.md": (() => {
        const { iife, esm } = cdnUrls("http", "sometic-http");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const http = SometicHttp.createHttp({ baseUrl: "/api" });
    http.get("/me").then((me) => {
        console.log(me);
    });
</script>`,
            module: `import { createHttp } from "${esm}";

const http = createHttp({ baseUrl: "/api" });
const me = await http.get("/me");`,
        };
    })(),
    "apps/docs/utilities/query.md": (() => {
        const { iife, esm } = cdnUrls("query", "sometic-query");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const client = SometicQuery.createQueryClient();
</script>`,
            module: `import { createQueryClient } from "${esm}";

const client = createQueryClient();
const observer = client.observe(["todos"], async () => {
    const res = await fetch("/api/todos");
    return res.json();
});`,
        };
    })(),
    "apps/docs/utilities/head.md": (() => {
        const { iife, esm } = cdnUrls("head", "sometic-head");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const head = SometicHead.createHeadController();
    head.patch({ title: "Docs" });
</script>`,
            module: `import { createHeadController } from "${esm}";

const head = createHeadController();
head.patch({ title: "Docs" });`,
        };
    })(),
    "apps/docs/stores/store.md": (() => {
        const { iife, esm } = cdnUrls("store", "sometic-store");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const store = SometicStore.createStore({ count: 0 });
    store.setState((s) => ({ count: s.count + 1 }));
</script>`,
            module: `import { createStore } from "${esm}";

const store = createStore({ count: 0 });
store.setState((s) => ({ count: s.count + 1 }));`,
        };
    })(),
    "apps/docs/stores/theme.md": (() => {
        const { iife, esm } = cdnUrls("theme", "sometic-theme");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const theme = SometicTheme.createThemeController({
        themes: [],
        defaultThemeId: "light",
    });
</script>`,
            module: `import { createThemeController } from "${esm}";

const theme = createThemeController({
    themes: [],
    defaultThemeId: "light",
});`,
        };
    })(),
    "apps/docs/authentication/index.md": (() => {
        const { iife, esm } = cdnUrls("auth", "sometic-auth");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const auth = SometicAuth.createAuth({ provider });
</script>`,
            module: `import { createAuth } from "${esm}";

const auth = createAuth({ provider });
await auth.signIn({ email: "a@b.c", password: "secret" });`,
        };
    })(),
    "apps/docs/authentication/installation.md": (() => {
        const { iife, esm } = cdnUrls("auth", "sometic-auth");
        return {
            simple: `<script src="${iife}"></script>
<script>
    const auth = SometicAuth.createAuth({ provider });
</script>`,
            module: `import { createAuth } from "${esm}";

const auth = createAuth({ provider });`,
        };
    })(),
};

/**
 * @param {string} text
 * @param {{ simple: string, module: string }} blocks
 */
function appendCdnToFirstCodeGroup(text, blocks) {
    if (text.includes("[CDN]") || text.includes("[CDN Simple]")) {
        return text;
    }
    const cdnFences = `\`\`\`html [CDN Simple]
${blocks.simple}
\`\`\`

\`\`\`html [CDN Module]
<script type="module">
${blocks.module}
</script>
\`\`\``;

    const match = text.match(/::: code-group\n([\s\S]*?)\n:::/);
    if (!match) {
        return text;
    }

    const full = match[0];
    const inner = match[1];
    const rebuilt = `::: code-group
${inner}

${cdnFences}
:::`;
    return text.replace(full, rebuilt);
}

let systemChanged = 0;
for (const [rel, meta] of Object.entries(systemPages)) {
    const path = join(root, rel);
    if (!existsSync(path)) {
        console.log("skip missing", rel);
        continue;
    }
    const before = readFileSync(path, "utf8");
    const next = appendCdnToFirstCodeGroup(before, meta);
    if (next !== before) {
        writeFileSync(path, next, "utf8");
        systemChanged += 1;
        console.log("system", rel);
    }
}
console.log(`system: ${systemChanged} files`);
