import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set(["node_modules", "dist", ".git", ".turbo", "coverage", "cache"]);
const textExt = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".mjs",
    ".cjs",
    ".json",
    ".md",
    ".mdc",
    ".yml",
    ".yaml",
    ".html",
    ".css",
    ".txt",
    ".svg",
    ".webmanifest",
]);

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (skipDirs.has(ent.name)) continue;
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (ent.name === ".vitepress") {
                const cache = path.join(p, "cache");
                walk(p, out);
                continue;
            }
            walk(p, out);
        } else {
            out.push(p);
        }
    }
    return out;
}

function shouldProcess(file) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (rel.includes("node_modules/") || rel.includes("/dist/")) return false;
    if (rel.includes(".vitepress/cache/")) return false;
    if (rel.endsWith("pnpm-lock.yaml")) return false;
    if (rel.includes("tooling/release/sometic-migrate.mjs")) return false;
    const ext = path.extname(file);
    return textExt.has(ext) || path.basename(file) === "LICENSE";
}

const replacements = [
    ["@sometic/", "@sometic/"],
    ["aiti-button", "sometic-button"],
    ["aiti-icon-button", "sometic-icon-button"],
    ["aiti-toggle-button", "sometic-toggle-button"],
    ["aiti-button-group", "sometic-button-group"],
    ["aiti-password-input", "sometic-password-input"],
    ["aiti-otp-input", "sometic-otp-input"],
    ["aiti-input", "sometic-input"],
    ["aiti-field", "sometic-field"],
    ["aiti-form", "sometic-form"],
    ["aiti-auth-status", "sometic-auth-status"],
    ["AitiAuthStatus", "SometicAuthStatus"],
    ["AitiButtonGroup", "SometicButtonGroup"],
    ["AitiToggleButton", "SometicToggleButton"],
    ["AitiIconButton", "SometicIconButton"],
    ["AitiPasswordInput", "SometicPasswordInput"],
    ["AitiOtpInput", "SometicOtpInput"],
    ["AitiButton", "SometicButton"],
    ["AitiInput", "SometicInput"],
    ["AitiField", "SometicField"],
    ["AitiForm", "SometicForm"],
];

const files = walk(root).filter(shouldProcess);
let changed = 0;

for (const file of files) {
    let text = fs.readFileSync(file, "utf8");
    const orig = text;
    const rel = path.relative(root, file).split(path.sep).join("/");
    for (const [from, to] of replacements) {
        text = text.split(from).join(to);
    }
    if (rel === "package.json") {
        text = text.split('"name": "aitistack-packages"').join('"name": "sometic-packages"');
    }
    if (text !== orig) {
        fs.writeFileSync(file, text);
        changed += 1;
    }
}

console.log(`Updated ${changed} files of ${files.length} scanned`);
