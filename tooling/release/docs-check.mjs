import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const docsRoot = path.join(repoRoot, "apps/docs");

const required = [
    "index.md",
    "guide/introduction.md",
    "guide/why-sometic.md",
    "guide/whats-included.md",
    "guide/comparison.md",
    "components/button.md",
    "components/form.md",
    "components/dialog.md",
    "releases/beta.md",
    "public/logo.png",
    "public/logo-dark.png",
    "public/icon.png",
    "public/favicon.ico",
];

let failed = false;
for (const rel of required) {
    const file = path.join(docsRoot, rel);
    if (!fs.existsSync(file)) {
        console.error(`missing: ${rel}`);
        failed = true;
    }
}

const componentsDir = path.join(docsRoot, "components");
const skip = new Set(["index.md"]);
for (const name of fs.readdirSync(componentsDir)) {
    if (!name.endsWith(".md") || skip.has(name)) {
        continue;
    }
    const rel = `components/${name}`;
    const text = fs.readFileSync(path.join(componentsDir, name), "utf8");
    const usageIdx = text.search(/^## Usage\s*$/m);
    if (usageIdx < 0) {
        console.error(`${rel}: missing ## Usage`);
        failed = true;
        continue;
    }
    const afterUsage = text.slice(usageIdx);
    const nextHeading = afterUsage.search(/\n## /);
    const usageBlock = nextHeading >= 0 ? afterUsage.slice(0, nextHeading) : afterUsage;
    for (const label of ["[React]", "[Vue]", "[Vanilla]", "[Custom Elements (Web Components)]"]) {
        if (!usageBlock.includes(label)) {
            console.error(`${rel}: Usage missing code-group label ${label}`);
            failed = true;
        }
    }
    const hasLegacyCdn = usageBlock.includes("[CDN]");
    const hasSplitCdn = usageBlock.includes("[CDN Simple]") && usageBlock.includes("[CDN Module]");
    if (!hasLegacyCdn && !hasSplitCdn) {
        console.error(
            `${rel}: Usage missing CDN surface ([CDN] stub, or [CDN Simple] + [CDN Module])`,
        );
        failed = true;
    }
    if (/```\w* \[CE\]/.test(usageBlock)) {
        console.error(`${rel}: Usage still uses [CE]; use [Custom Elements (Web Components)]`);
        failed = true;
    }
}

const skipLinkDirs = new Set(["packages", "architecture", ".vitepress", "node_modules", "dist"]);
const skipLinkFiles = new Set([
    "public-api-inventory.md",
    "guide/development.md",
    "guide/repository-structure.md",
    "guide/release.md",
    "guide/getting-started.md",
    "guide/examples.md",
]);

function publishedMarkdownFiles(dir, prefix = "") {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            if (skipLinkDirs.has(entry.name)) {
                continue;
            }
            files.push(...publishedMarkdownFiles(path.join(dir, entry.name), rel));
            continue;
        }
        if (!entry.name.endsWith(".md") || skipLinkFiles.has(rel.replaceAll("\\", "/"))) {
            continue;
        }
        files.push(rel.replaceAll("\\", "/"));
    }
    return files;
}

function markdownTargetExists(fromRel, href) {
    const bare = href.split("#")[0]?.split("?")[0] ?? "";
    if (bare === "") {
        return true;
    }
    if (/^(https?:|mailto:|tel:)/i.test(bare)) {
        return true;
    }
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico|xml|txt|webmanifest)$/i.test(bare)) {
        const filePath = bare.startsWith("/")
            ? path.join(docsRoot, "public", bare.slice(1))
            : path.resolve(path.dirname(path.join(docsRoot, fromRel)), bare);
        return fs.existsSync(filePath);
    }
    const candidates = [];
    if (bare.startsWith("/")) {
        const cleaned = bare.replace(/\/$/, "") || "/";
        const withoutSlash = cleaned.replace(/^\//, "");
        candidates.push(
            path.join(docsRoot, `${withoutSlash}.md`),
            path.join(docsRoot, withoutSlash, "index.md"),
        );
    } else {
        const resolved = path.resolve(path.dirname(path.join(docsRoot, fromRel)), bare);
        candidates.push(resolved, `${resolved}.md`, path.join(resolved, "index.md"));
    }
    return candidates.some((candidate) => fs.existsSync(candidate));
}

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
for (const rel of publishedMarkdownFiles(docsRoot)) {
    const text = fs.readFileSync(path.join(docsRoot, rel), "utf8");
    const withoutFences = text.replace(/```[\s\S]*?```/g, "");
    for (const match of withoutFences.matchAll(linkPattern)) {
        const href = match[1]?.trim() ?? "";
        if (href.startsWith("<") || href.includes("{")) {
            continue;
        }
        if (!markdownTargetExists(rel, href)) {
            console.error(`${rel}: broken link ${href}`);
            failed = true;
        }
    }
}

if (failed) {
    process.exit(1);
}
console.log(
    "docs:check passed (pages + component Usage React/Vue/Vanilla/Custom Elements/CDN + links)",
);
