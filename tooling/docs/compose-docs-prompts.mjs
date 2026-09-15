import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const promptsRoot = path.resolve(__dirname, "../../apps/docs/.vitepress/prompts");
const sharedRoot = path.join(promptsRoot, "shared");
const bodiesRoot = path.join(promptsRoot, "bodies");

const SHARED_SURFACE = [
    "_product.txt",
    "_wave-a-gate-lite.txt",
    "_architecture.txt",
    "_spine.txt",
    "_api-truth-common.txt",
];

const SHARED_SCAFFOLD = [
    "_product.txt",
    "_wave-a-gate-lite.txt",
    "_architecture.txt",
    "_spine.txt",
    "_api-truth-common.txt",
];

const SURFACE_BODIES = [
    "ecosystem",
    "app-shell",
    "auth",
    "http",
    "query",
    "head",
    "forms",
    "stores",
    "theming",
    "foundation",
    "components",
];

function readPart(root, name) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) {
        throw new Error(`missing prompt part: ${path.relative(promptsRoot, file)}`);
    }
    return fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n").trimEnd();
}

function compose(parts) {
    return `${parts.join("\n\n")}\n`;
}

function listScaffoldBodies() {
    return fs
        .readdirSync(bodiesRoot)
        .filter((name) => name.startsWith("scaffold-") && name.endsWith(".txt"))
        .sort();
}

function buildOutputs() {
    /** @type {Map<string, string>} */
    const outputs = new Map();

    for (const id of SURFACE_BODIES) {
        const parts = [
            ...SHARED_SURFACE.map((name) => readPart(sharedRoot, name)),
            readPart(bodiesRoot, `${id}.txt`),
            readPart(sharedRoot, "_docs-index.txt"),
        ];
        outputs.set(`${id}.txt`, compose(parts));
    }

    for (const name of listScaffoldBodies()) {
        const parts = [
            ...SHARED_SCAFFOLD.map((part) => readPart(sharedRoot, part)),
            readPart(bodiesRoot, name),
            readPart(sharedRoot, "_docs-index.txt"),
        ];
        outputs.set(name, compose(parts));
    }

    return outputs;
}

function writeOutputs(outputs) {
    for (const [name, text] of outputs) {
        fs.writeFileSync(path.join(promptsRoot, name), text);
    }
}

function checkDrift(outputs) {
    let drifted = false;
    for (const [name, expected] of outputs) {
        const file = path.join(promptsRoot, name);
        if (!fs.existsSync(file)) {
            console.error(`prompts drift: missing output ${name}`);
            drifted = true;
            continue;
        }
        const actual = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
        if (actual !== expected) {
            console.error(`prompts drift: ${name} is out of date (run pnpm prompts:compose)`);
            drifted = true;
        }
    }
    return drifted;
}

const mode = process.argv[2] ?? "write";
const outputs = buildOutputs();

if (mode === "check") {
    const drifted = checkDrift(outputs);
    if (drifted) {
        process.exit(1);
    }
    console.log(`prompts ok (${outputs.size} files)`);
    process.exit(0);
}

if (mode !== "write") {
    console.error(`usage: compose-docs-prompts.mjs [write|check]`);
    process.exit(1);
}

writeOutputs(outputs);
console.log(`composed ${outputs.size} prompt files → ${path.relative(process.cwd(), promptsRoot)}`);
