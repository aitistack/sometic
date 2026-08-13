import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const docsRoot = path.join(repoRoot, "apps/docs");
const allow = new Set([path.join(docsRoot, "migration", "from-aitistack-to-sometic.md")]);

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (
            ent.name === ".vitepress" ||
            ent.name === "node_modules" ||
            ent.name === "packages" ||
            ent.name === "architecture"
        ) {
            continue;
        }
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) walk(p, out);
        else if (ent.name.endsWith(".md")) out.push(p);
    }
    return out;
}

const files = walk(docsRoot);
let failed = false;
for (const file of files) {
    if (allow.has(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(docsRoot, file);
    if (text.includes("@sometic/")) {
        console.error(`stale @sometic/ in ${rel}`);
        failed = true;
    }
    if (text.includes("@sometic-ui/")) {
        console.error(`stale @sometic-ui/ in ${rel}`);
        failed = true;
    }
}

if (failed) {
    process.exit(1);
}
console.log("docs:scope-check passed");
