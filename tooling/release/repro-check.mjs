import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetDir = path.join(root, "packages", "events");
const pkg = JSON.parse(fs.readFileSync(path.join(targetDir, "package.json"), "utf8"));

if (pkg.private === true) {
    console.error("release:repro-check: @sometic/events must be publishable");
    process.exit(1);
}

const epochResult = spawnSync("git", ["log", "-1", "--format=%ct"], {
    cwd: root,
    encoding: "utf8",
    shell: true,
});
const epoch = (epochResult.stdout ?? "").trim();
if (!/^\d+$/.test(epoch)) {
    console.error("release:repro-check: could not read git commit time");
    process.exit(1);
}

function packOnce() {
    const result = spawnSync("npm", ["pack", "--json"], {
        cwd: targetDir,
        encoding: "utf8",
        shell: true,
        env: {
            ...process.env,
            SOURCE_DATE_EPOCH: epoch,
        },
    });
    if (result.status !== 0) {
        throw new Error(result.stderr || result.stdout || "npm pack failed");
    }
    const parsed = JSON.parse(result.stdout);
    const filename = Array.isArray(parsed) ? parsed[0]?.filename : parsed?.filename;
    if (typeof filename !== "string") {
        throw new Error("npm pack --json did not return a filename");
    }
    const tarball = path.join(targetDir, filename);
    const bytes = fs.readFileSync(tarball);
    const hash = createHash("sha256").update(bytes).digest("hex");
    fs.unlinkSync(tarball);
    return { filename, hash };
}

const first = packOnce();
const second = packOnce();

if (first.hash !== second.hash) {
    console.error(
        `release:repro-check failed: ${first.filename} hashes differ (${first.hash} vs ${second.hash})`,
    );
    console.error(
        "Minified CDN IIFE output is not claimed bit-identical; this check uses @sometic/events.",
    );
    process.exit(1);
}

console.log(
    `release:repro-check ok: ${pkg.name} ${first.filename} sha256=${first.hash} SOURCE_DATE_EPOCH=${epoch}`,
);
