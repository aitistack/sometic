import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const docsRoot = path.join(repoRoot, "apps/docs");
const cdnPinPattern = /cdn\.jsdelivr\.net\/npm\/@sometic\/([a-z0-9-]+)@([^/\s"'`)]+)/g;

const packageVersions = new Map();
for (const dir of fs.readdirSync(path.join(repoRoot, "packages"))) {
    const pkgFile = path.join(repoRoot, "packages", dir, "package.json");
    if (!fs.existsSync(pkgFile)) {
        continue;
    }
    const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
    if (
        typeof pkg.name === "string" &&
        pkg.name.startsWith("@sometic/") &&
        pkg.private !== true &&
        typeof pkg.version === "string"
    ) {
        packageVersions.set(pkg.name.slice("@sometic/".length), pkg.version);
    }
}

function walkCdnSurfaces(dir, acc = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (
                entry.name === "node_modules" ||
                entry.name === "dist" ||
                entry.name === ".vitepress"
            ) {
                continue;
            }
            walkCdnSurfaces(full, acc);
            continue;
        }
        if (/\.(md|txt|html)$/.test(entry.name)) {
            acc.push(full);
        }
    }
    return acc;
}

const files = walkCdnSurfaces(docsRoot);
for (const dir of fs.readdirSync(path.join(repoRoot, "packages"))) {
    const readme = path.join(repoRoot, "packages", dir, "README.md");
    if (fs.existsSync(readme)) {
        files.push(readme);
    }
}

let updated = 0;
for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    const after = before.replace(cdnPinPattern, (full, name, pin) => {
        const expected = packageVersions.get(name);
        if (!expected || pin === expected) {
            return full;
        }
        return full.replace(`@${pin}`, `@${expected}`);
    });
    if (after !== before) {
        fs.writeFileSync(file, after);
        updated += 1;
        console.log(path.relative(repoRoot, file).replaceAll("\\", "/"));
    }
}

console.log(`sync-cdn-pins: ${updated} files updated`);
