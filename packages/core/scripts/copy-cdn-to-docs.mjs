import process from "node:process";
import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cdnDir = join(root, "dist", "cdn");
const docsCdn = join(root, "..", "..", "apps", "docs", "public", "cdn");

const files = ["sometic-core.esm.js", "sometic-core.iife.js"];

if (!existsSync(cdnDir)) {
    process.exit(0);
}

mkdirSync(docsCdn, { recursive: true });

for (const file of files) {
    const from = join(cdnDir, file);
    if (!existsSync(from)) {
        continue;
    }
    copyFileSync(from, join(docsCdn, file));
}
