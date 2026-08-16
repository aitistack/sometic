import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lockPath = path.join(root, "pnpm-lock.yaml");
const outputFlag = process.argv.indexOf("--output");
const outputPath =
    outputFlag >= 0 && process.argv[outputFlag + 1]
        ? path.resolve(process.cwd(), process.argv[outputFlag + 1])
        : path.join(root, "sometic.cdx.json");

const lockfile = fs.readFileSync(lockPath, "utf8");
const packagesIndex = lockfile.indexOf("\npackages:\n");
const section = packagesIndex >= 0 ? lockfile.slice(packagesIndex + "\npackages:\n".length) : "";
const keyPattern = /^ {2}(?:'([^']+)'|([^:]+)):/gm;
const components = [];
const seen = new Set();

let match = keyPattern.exec(section);
while (match) {
    const raw = match[1] ?? match[2] ?? "";
    const at = raw.lastIndexOf("@");
    if (at > 0) {
        const name = raw.slice(0, at);
        const version = raw.slice(at + 1);
        const purl = `pkg:npm/${name.replace("/", "%2F")}@${version}`;
        if (!seen.has(purl)) {
            seen.add(purl);
            components.push({
                type: "library",
                name,
                version,
                purl,
            });
        }
    }
    match = keyPattern.exec(section);
}

components.sort((left, right) => left.name.localeCompare(right.name));

const sbom = {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    version: 1,
    metadata: {
        timestamp: new Date().toISOString(),
        component: {
            type: "application",
            name: "sometic-packages",
            version: "0.1.0",
        },
        tools: [{ name: "sometic-lockfile-sbom", version: "1.0.0" }],
    },
    components,
};

fs.writeFileSync(outputPath, `${JSON.stringify(sbom, null, 4)}\n`);
console.log(`sbom wrote ${components.length} components to ${outputPath}`);
