#!/usr/bin/env node
/**
 * Replace stale hosting strings with YOUR_ORG / YOUR_REPO / DOCS_URL.
 *
 * Usage:
 *   node scripts/set-repo-identity.mjs --org aitistack --repo sometic --docs https://sometic.aitistack.com
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function arg(name, fallback) {
    const idx = process.argv.indexOf(`--${name}`);
    if (idx >= 0 && process.argv[idx + 1]) {
        return process.argv[idx + 1];
    }
    return fallback;
}

const org = arg("org", "aitistack");
const repo = arg("repo", "sometic");
const docs = arg("docs", "https://sometic.aitistack.com");

if (org === "aitistack" && repo === "sometic") {
    console.warn(
        "Using defaults aitistack / sometic. Re-run with --org and --repo if your GitHub path differs.",
    );
}

const gitUrl = `git+https://github.com/${org}/${repo}.git`;
const issuesUrl = `https://github.com/${org}/${repo}/issues`;
const homeUrl = docs.replace(/\/$/, "");

const OLD_GIT = /git\+https:\/\/github\.com\/aitistack\/sometic\.git/g;
const OLD_ISSUES = /https:\/\/github\.com\/aitistack\/sometic\/issues/g;
const OLD_HOME = /https:\/\/sometic\.aitistack\.com/g;
const OLD_REPO_DIR = /github\.com\/aitistack\/sometic/g;

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (
            entry.name === "node_modules" ||
            entry.name === "dist" ||
            entry.name === ".git" ||
            entry.name === ".vitepress"
        ) {
            continue;
        }
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, out);
        } else if (
            entry.name === "package.json" ||
            entry.name.endsWith(".md") ||
            entry.name === "llms.txt"
        ) {
            out.push(full);
        }
    }
    return out;
}

let changed = 0;
for (const file of walk(root)) {
    const before = fs.readFileSync(file, "utf8");
    let next = before
        .replace(OLD_GIT, gitUrl)
        .replace(OLD_ISSUES, issuesUrl)
        .replace(OLD_HOME, homeUrl)
        .replace(OLD_REPO_DIR, `github.com/${org}/${repo}`);
    if (file.endsWith("package.json")) {
        try {
            const json = JSON.parse(next);
            if (json.repository && typeof json.repository === "object") {
                json.repository.url = gitUrl;
            }
            if (json.bugs && typeof json.bugs === "object") {
                json.bugs.url = issuesUrl;
            }
            if (
                typeof json.homepage === "string" &&
                /aitistack|sometic\.aitistack\.com|aitiStack/.test(json.homepage)
            ) {
                json.homepage = homeUrl;
            }
            next = `${JSON.stringify(json, null, 4)}\n`;
        } catch {
            /* leave text replace */
        }
    }
    if (next !== before) {
        fs.writeFileSync(file, next, "utf8");
        changed += 1;
        console.log(`updated ${path.relative(root, file)}`);
    }
}

console.log(`set-repo-identity: ${changed} files → org=${org} repo=${repo} docs=${homeUrl}`);
