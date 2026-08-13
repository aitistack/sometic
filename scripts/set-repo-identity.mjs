#!/usr/bin/env node
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
const docs = arg("docs", "https://sometic.dev");

if (org === "aitistack" && repo === "sometic") {
    console.warn(
        "Using defaults aitistack / sometic. Re-run with --org and --repo if your GitHub path differs.",
    );
}

const gitUrl = `git+https://github.com/${org}/${repo}.git`;
const issuesUrl = `https://github.com/${org}/${repo}/issues`;
const homeUrl = docs.replace(/\/$/, "");
const repoHost = `github.com/${org}/${repo}`;

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

function rewriteText(text) {
    return text
        .replace(/git\+https:\/\/github\.com\/YOUR_ORG\/YOUR_REPO\.git/g, gitUrl)
        .replace(/https:\/\/github\.com\/YOUR_ORG\/YOUR_REPO\/issues/g, issuesUrl)
        .replace(/github\.com\/YOUR_ORG\/YOUR_REPO/g, repoHost)
        .replace(/git\+https:\/\/github\.com\/aitistack\/sometic\.git/g, gitUrl)
        .replace(/https:\/\/github\.com\/aitistack\/sometic\/issues/g, issuesUrl)
        .replace(/github\.com\/aitistack\/sometic/g, repoHost)
        .replace(/https:\/\/sometic\.aitistack\.com/g, homeUrl);
}

function isPublishablePackageJson(file, json) {
    const relative = path.relative(root, file).replace(/\\/g, "/");
    return (
        relative.startsWith("packages/") &&
        relative.endsWith("/package.json") &&
        json.private !== true &&
        typeof json.name === "string" &&
        json.name.startsWith("@sometic/")
    );
}

let changed = 0;
for (const file of walk(root)) {
    const before = fs.readFileSync(file, "utf8");
    let next = rewriteText(before);

    if (file.endsWith("package.json")) {
        try {
            const json = JSON.parse(next);
            let touched = false;

            if (isPublishablePackageJson(file, json)) {
                if (!json.repository || typeof json.repository !== "object") {
                    json.repository = { type: "git" };
                    touched = true;
                }
                if (json.repository.url !== gitUrl) {
                    json.repository.url = gitUrl;
                    touched = true;
                }
                if (json.repository.type !== "git") {
                    json.repository.type = "git";
                    touched = true;
                }
                if (!json.bugs || typeof json.bugs !== "object") {
                    json.bugs = {};
                    touched = true;
                }
                if (json.bugs.url !== issuesUrl) {
                    json.bugs.url = issuesUrl;
                    touched = true;
                }
                if (json.homepage !== homeUrl) {
                    json.homepage = homeUrl;
                    touched = true;
                }
            } else {
                if (json.repository && typeof json.repository === "object") {
                    if (json.repository.url !== gitUrl) {
                        json.repository.url = gitUrl;
                        touched = true;
                    }
                }
                if (json.bugs && typeof json.bugs === "object") {
                    if (json.bugs.url !== issuesUrl) {
                        json.bugs.url = issuesUrl;
                        touched = true;
                    }
                }
                if (
                    typeof json.homepage === "string" &&
                    /aitistack|sometic\.aitistack\.com|aitiStack|YOUR_ORG/.test(json.homepage)
                ) {
                    json.homepage = homeUrl;
                    touched = true;
                }
            }

            const serialized = `${JSON.stringify(json, null, 4)}\n`;
            if (touched || serialized !== before) {
                next = serialized;
            }
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
