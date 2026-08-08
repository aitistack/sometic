import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const changesetDir = path.join(root, ".changeset");

const files = fs
    .readdirSync(changesetDir)
    .filter((name) => name.endsWith(".md") && name !== "README.md");

if (files.length === 0) {
    console.log("changeset:status — no pending changesets");
    process.exit(0);
}

console.log("changeset:status — pending changesets:");
for (const file of files) {
    console.log(` - ${file}`);
}
