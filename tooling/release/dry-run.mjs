import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packagesDir = path.join(root, "packages");

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isPublishable(pkg) {
    return pkg.private !== true && typeof pkg.name === "string" && pkg.name.startsWith("@sometic/");
}

function packDryRun(cwd) {
    return spawnSync("npm", ["pack", "--dry-run"], {
        cwd,
        encoding: "utf8",
        shell: true,
    });
}

const entries = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

let failed = false;
let packed = 0;

for (const entry of entries) {
    const dir = path.join(packagesDir, entry.name);
    const pkgPath = path.join(dir, "package.json");
    if (!fs.existsSync(pkgPath)) {
        continue;
    }
    const pkg = readJson(pkgPath);
    if (!isPublishable(pkg)) {
        continue;
    }
    const result = packDryRun(dir);
    if (result.status !== 0) {
        failed = true;
        console.error(`release:dry-run failed: ${pkg.name}`);
        if (result.stderr) {
            console.error(result.stderr);
        }
        if (result.stdout) {
            console.error(result.stdout);
        }
        continue;
    }
    packed += 1;
    console.log(`release:dry-run ok: ${pkg.name}`);
}

if (packed === 0) {
    console.error("release:dry-run found no publishable packages");
    process.exitCode = 1;
} else if (failed) {
    process.exitCode = 1;
} else {
    console.log(`release:dry-run ok (${packed} packages)`);
}
