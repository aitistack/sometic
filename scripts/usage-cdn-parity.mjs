import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const componentsDir = join(root, "apps/docs/components");

const CDN_NOT_SHIPPED = `\`\`\`html [CDN]
<!-- CDN not available for this surface yet (no shipped custom element). Use npm adapters or Vanilla. -->
\`\`\``;

const ELEMENTS_CDN =
    "https://cdn.jsdelivr.net/npm/@sometic/elements@latest/dist/cdn/sometic-elements.esm.js";

/** @param {string} markup */
function cdnFromMarkup(markup) {
    return `\`\`\`html [CDN]
<script type="module" src="${ELEMENTS_CDN}"></script>

${markup.trim()}
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
    if (group.includes("[CDN]")) {
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

/** @type {Record<string, { url: string, snippet: string }>} */
const systemPages = {
    "apps/docs/guide/app-shell.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/app-shell@latest/dist/cdn/sometic-app-shell.esm.js",
        snippet: `import { createSometicApp } from "https://cdn.jsdelivr.net/npm/@sometic/app-shell@latest/dist/cdn/sometic-app-shell.esm.js";

// Provide a real AuthController from @sometic/auth (CDN or npm).
const app = createSometicApp({
    auth,
    baseUrl: "/api",
    query: true,
});

const me = await app.http.get("/me");
app.dispose();`,
    },
    "apps/docs/utilities/http.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.esm.js",
        snippet: `import { createHttp } from "https://cdn.jsdelivr.net/npm/@sometic/http@latest/dist/cdn/sometic-http.esm.js";

const http = createHttp({ baseUrl: "/api" });
const me = await http.get("/me");`,
    },
    "apps/docs/utilities/query.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/query@latest/dist/cdn/sometic-query.esm.js",
        snippet: `import { createQueryClient } from "https://cdn.jsdelivr.net/npm/@sometic/query@latest/dist/cdn/sometic-query.esm.js";

const client = createQueryClient();
const observer = client.observe(["todos"], async () => {
    const res = await fetch("/api/todos");
    return res.json();
});`,
    },
    "apps/docs/utilities/head.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/head@latest/dist/cdn/sometic-head.esm.js",
        snippet: `import { createHeadController } from "https://cdn.jsdelivr.net/npm/@sometic/head@latest/dist/cdn/sometic-head.esm.js";

const head = createHeadController();
head.patch({ title: "Docs" });`,
    },
    "apps/docs/stores/store.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/store@latest/dist/cdn/sometic-store.esm.js",
        snippet: `import { createStore } from "https://cdn.jsdelivr.net/npm/@sometic/store@latest/dist/cdn/sometic-store.esm.js";

const store = createStore({ count: 0 });
store.setState((s) => ({ count: s.count + 1 }));`,
    },
    "apps/docs/stores/theme.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/theme@latest/dist/cdn/sometic-theme.esm.js",
        snippet: `import { createThemeController } from "https://cdn.jsdelivr.net/npm/@sometic/theme@latest/dist/cdn/sometic-theme.esm.js";

const theme = createThemeController({
    themes: [],
    defaultThemeId: "light",
});`,
    },
    "apps/docs/authentication/index.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/auth@latest/dist/cdn/sometic-auth.esm.js",
        snippet: `import { createAuth } from "https://cdn.jsdelivr.net/npm/@sometic/auth@latest/dist/cdn/sometic-auth.esm.js";

const auth = createAuth({ provider });
await auth.signIn({ email: "a@b.c", password: "…" });`,
    },
    "apps/docs/authentication/installation.md": {
        url: "https://cdn.jsdelivr.net/npm/@sometic/auth@latest/dist/cdn/sometic-auth.esm.js",
        snippet: `import { createAuth } from "https://cdn.jsdelivr.net/npm/@sometic/auth@latest/dist/cdn/sometic-auth.esm.js";

const auth = createAuth({ provider });`,
    },
};

function appendCdnToFirstCodeGroup(text, snippet) {
    if (text.includes("[CDN]")) {
        return text;
    }
    const cdnFence = `\`\`\`js [CDN]
${snippet}
\`\`\``;

    const match = text.match(/::: code-group\n([\s\S]*?)\n:::/);
    if (!match) {
        const usage = text.match(/## Usage\s*\n/);
        if (!usage || usage.index === undefined) {
            return `${text.trimEnd()}

## CDN

::: code-group

${cdnFence}
:::
`;
        }
        return text;
    }

    const full = match[0];
    const inner = match[1];
    const rebuilt = `::: code-group
${inner}

${cdnFence}
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
    const next = appendCdnToFirstCodeGroup(before, meta.snippet);
    if (next !== before) {
        writeFileSync(path, next, "utf8");
        systemChanged += 1;
        console.log("system", rel);
    }
}
console.log(`system: ${systemChanged} files`);
