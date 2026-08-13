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

if (failed) {
    process.exit(1);
}
console.log("docs:check passed (pages + component Usage React/Vue/Vanilla/Custom Elements/CDN)");
