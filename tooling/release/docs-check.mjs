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

const maintainerRequired = ["docs/maintainer/FIRST_PUBLISH.md"];

let failed = false;
for (const rel of required) {
    const file = path.join(docsRoot, rel);
    if (!fs.existsSync(file)) {
        console.error(`missing: ${rel}`);
        failed = true;
    }
}
for (const rel of maintainerRequired) {
    const file = path.join(repoRoot, rel);
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
    for (const label of ["[JS]", "[TS]", "[Vanilla]"]) {
        if (!usageBlock.includes(label)) {
            console.error(`${rel}: Usage missing code-group label ${label}`);
            failed = true;
        }
    }
    if (/```\w* \[(React|Vue|CE)\]/.test(usageBlock)) {
        console.error(
            `${rel}: Usage still uses [React]/[Vue]/[CE] labels; use [JS]|[TS]|[Vanilla]`,
        );
        failed = true;
    }
}

if (failed) {
    process.exit(1);
}
console.log("docs:check passed (pages + component Usage JS/TS/Vanilla triad)");
