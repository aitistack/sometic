import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import os from "node:os";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const packagesDir = path.join(root, "packages");

function formatSize(bytes) {
    if (bytes < 1000) {
        return `${bytes} B`;
    }
    return `${(bytes / 1000).toFixed(2)} kB`;
}

function gzipLength(filePath) {
    return gzipSync(readFileSync(filePath)).length;
}

const names = readdirSync(packagesDir);
const rows = [];

for (const name of names) {
    const packageJsonPath = path.join(packagesDir, name, "package.json");
    if (!existsSync(packageJsonPath)) {
        continue;
    }
    const manifest = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const limits = manifest["size-limit"];
    if (!Array.isArray(limits)) {
        continue;
    }
    for (const entry of limits) {
        if (typeof entry.path !== "string" || typeof entry.name !== "string") {
            continue;
        }
        const filePath = path.join(packagesDir, name, entry.path);
        if (!existsSync(filePath)) {
            rows.push({
                package: manifest.name,
                name: entry.name,
                path: entry.path,
                gzip: null,
                limit: entry.limit ?? "",
                missing: true,
            });
            continue;
        }
        rows.push({
            package: manifest.name,
            name: entry.name,
            path: entry.path,
            gzip: gzipLength(filePath),
            limit: entry.limit ?? "",
            missing: false,
        });
    }
}

let sha = "unknown";
try {
    sha = execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim();
} catch {
    sha = "unknown";
}

process.stdout.write(
    [
        `# Bundle size snapshot`,
        ``,
        `- **Commit:** \`${sha}\``,
        `- **Node:** ${process.version}`,
        `- **Host:** ${os.platform()} ${os.release()} ${os.arch()}`,
        `- **Tool:** gzip of Size Limit \`path\` files after \`pnpm build\` (same files CI checks). Raw byte length of \`gzipSync\`, SI kB (1000).`,
        `- **CDN vs entry:** rows named \`cdn\` / IIFE / ESM bundles are full browser bundles. Do not compare them to store-core 1.5 kB or similar subpath targets.`,
        ``,
        `| Package | Entry | Path | Gzip | Size Limit |`,
        `| ------- | ----- | ---- | ---- | ---------- |`,
        ...rows.map((row) => {
            const gzip = row.missing ? "missing" : formatSize(row.gzip ?? 0);
            return `| \`${row.package}\` | ${row.name} | \`${row.path}\` | ${gzip} | ${row.limit} |`;
        }),
        ``,
    ].join("\n"),
);
