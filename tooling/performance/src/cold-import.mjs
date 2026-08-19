import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(packageRoot, "../..");

const specifiers = [
    "@sometic/core",
    "@sometic/events",
    "@sometic/store",
    "@sometic/http",
    "@sometic/auth",
    "@sometic/theme",
    "@sometic/forms",
    "@sometic/react/button",
];

function measureOnce(specifier) {
    return new Promise((resolve, reject) => {
        const child = spawn(
            process.execPath,
            [
                "--input-type=module",
                "-e",
                `const start = performance.now(); await import(${JSON.stringify(specifier)}); process.stdout.write(String(performance.now() - start));`,
            ],
            {
                cwd: packageRoot,
                env: process.env,
                stdio: ["ignore", "pipe", "pipe"],
            },
        );
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (chunk) => {
            stdout += String(chunk);
        });
        child.stderr.on("data", (chunk) => {
            stderr += String(chunk);
        });
        child.on("error", reject);
        child.on("close", (code) => {
            if (code !== 0) {
                reject(new Error(`${specifier} import failed: ${stderr || stdout}`));
                return;
            }
            resolve(Number.parseFloat(stdout));
        });
    });
}

async function medianMs(specifier, runs = 5) {
    const samples = [];
    for (let index = 0; index < runs; index += 1) {
        samples.push(await measureOnce(specifier));
    }
    samples.sort((left, right) => left - right);
    return samples[Math.floor(samples.length / 2)] ?? Number.NaN;
}

let sha = "unknown";
try {
    sha = execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim();
} catch {
    sha = "unknown";
}

const rows = [];
for (const specifier of specifiers) {
    const median = await medianMs(specifier);
    rows.push({ specifier, medianMs: median });
    process.stdout.write(`${specifier}\t${median.toFixed(2)} ms\n`);
}

process.stdout.write(
    JSON.stringify(
        {
            kind: "cold-import",
            node: process.version,
            platform: `${os.platform()} ${os.release()} ${os.arch()}`,
            commit: sha,
            rows,
        },
        null,
        4,
    ) + "\n",
);
