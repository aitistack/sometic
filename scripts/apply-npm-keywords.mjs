#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(root, "packages");

const BASE = ["sometic", "typescript", "javascript", "ssr", "a11y"];

const EXTRA = {
    accessibility: ["accessibility", "focus", "aria", "keyboard", "wcag"],
    activity: ["activity", "audit", "feed", "timeline"],
    "adapter-contract": ["adapter", "framework", "contract", "portable"],
    alpine: ["alpinejs", "alpine", "html", "web"],
    angular: ["angular", "components", "ui"],
    "app-shell": ["app-shell", "layout", "navigation", "spa"],
    approval: ["approval", "workflow", "review", "state-machine"],
    auth: ["auth", "authentication", "session", "oauth"],
    "auth-firebase": ["firebase", "auth", "authentication"],
    "auth-local": ["auth", "rest", "authentication", "session"],
    "auth-oidc": ["oidc", "oauth", "openid", "auth"],
    "auth-supabase": ["supabase", "auth", "authentication"],
    cli: ["cli", "codegen", "scaffolding", "dx"],
    core: ["primitives", "disposable", "controllable-state", "foundation"],
    "data-table": ["data-table", "data-grid", "pagination", "virtualization"],
    "date-core": ["date", "calendar", "adapter", "temporal"],
    "date-dayjs": ["dayjs", "date", "adapter"],
    "date-fns": ["date-fns", "date", "adapter"],
    "date-native": ["date", "native", "intl", "adapter"],
    dom: ["dom", "controllers", "vanilla", "web-components"],
    elements: ["web-components", "custom-elements", "vanilla"],
    "eslint-config": ["eslint", "lint", "config", "dx"],
    events: ["events", "pubsub", "emitter", "typed-events"],
    forms: ["forms", "validation", "form-state", "fields"],
    head: ["document-head", "meta", "seo", "title"],
    htmx: ["htmx", "html", "hypermedia"],
    http: ["fetch", "http", "interceptors", "client"],
    jquery: ["jquery", "legacy", "dom"],
    notifications: ["notifications", "inbox", "unread", "notification-center"],
    positioning: ["positioning", "floating", "popover", "tooltip"],
    preact: ["preact", "components", "ui"],
    query: ["query", "data-fetching", "async", "cache"],
    "query-builder": ["query-builder", "filters", "ast", "search"],
    react: ["react", "components", "hooks", "ui"],
    registry: ["registry", "packages", "catalog"],
    solid: ["solidjs", "solid", "components", "ui"],
    store: ["store", "state", "selectors", "persistence"],
    "store-immer": ["immer", "store", "immutable", "state"],
    styling: ["styling", "classnames", "css", "slots"],
    svelte: ["svelte", "components", "ui"],
    theme: ["theme", "design-tokens", "css-variables", "dark-mode"],
    upload: ["upload", "download", "file-upload", "progress"],
    validation: ["validation", "validators", "forms"],
    "validation-yup": ["yup", "validation", "schema"],
    "validation-zod": ["zod", "validation", "schema"],
    vue: ["vue", "components", "composables", "ui"],
};

let updated = 0;
for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = path.join(packagesDir, entry.name, "package.json");
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (pkg.private === true || !pkg.name?.startsWith("@sometic/")) continue;

    const id = entry.name;
    const extra = EXTRA[id] ?? [id.replace(/-/g, "")];
    const keywords = [...new Set([...BASE, ...extra])];
    pkg.keywords = keywords;

    if (!pkg.bugs || typeof pkg.bugs !== "object") {
        pkg.bugs = { url: "https://github.com/aitistack/sometic/issues" };
    }
    if (!pkg.repository || typeof pkg.repository !== "object") {
        pkg.repository = {
            type: "git",
            url: "git+https://github.com/aitistack/sometic.git",
            directory: `packages/${id}`,
        };
    } else {
        pkg.repository.url = "git+https://github.com/aitistack/sometic.git";
        pkg.repository.type = "git";
        if (!pkg.repository.directory) {
            pkg.repository.directory = `packages/${id}`;
        }
    }
    pkg.bugs.url = "https://github.com/aitistack/sometic/issues";
    pkg.homepage = "https://sometic.dev";

    fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`, "utf8");
    updated += 1;
    console.log(`keywords ${pkg.name} (${keywords.length})`);
}

console.log(`apply-npm-keywords: ${updated} packages`);
