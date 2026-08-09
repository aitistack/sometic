import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const packagesDir = path.join(root, "packages");

const requiredFields = [
    "name",
    "version",
    "license",
    "type",
    "exports",
    "files",
    "sideEffects",
    "repository",
    "publishConfig",
];

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isPublishable(pkg) {
    return pkg.private !== true && typeof pkg.name === "string" && pkg.name.startsWith("@sometic/");
}

function hasNonDistExports(exportsMap) {
    const rootExport = exportsMap["."];
    if (typeof rootExport === "string") {
        return !rootExport.includes("/dist/");
    }
    if (rootExport && typeof rootExport === "object") {
        const importPath = rootExport.import ?? rootExport.default;
        return typeof importPath === "string" && !importPath.includes("/dist/");
    }
    return false;
}

function validatePackage(dirName) {
    const dir = path.join(packagesDir, dirName);
    const pkgPath = path.join(dir, "package.json");
    if (!fs.existsSync(pkgPath)) {
        return [];
    }

    const pkg = readJson(pkgPath);
    const errors = [];

    if (!isPublishable(pkg)) {
        return errors;
    }

    for (const field of requiredFields) {
        if (pkg[field] === undefined) {
            errors.push(`${pkg.name}: missing field "${field}"`);
        }
    }

    if (pkg.type !== "module") {
        errors.push(`${pkg.name}: type must be "module"`);
    }

    if (pkg.sideEffects !== false && !Array.isArray(pkg.sideEffects)) {
        errors.push(`${pkg.name}: sideEffects must be false or an array`);
    }

    const exportsMap = pkg.exports;
    if (!exportsMap || typeof exportsMap !== "object" || !exportsMap["."]) {
        errors.push(`${pkg.name}: exports["."] is required`);
    } else {
        const rootExport = exportsMap["."];
        if (typeof rootExport === "object") {
            if (!rootExport.types || !rootExport.import) {
                errors.push(`${pkg.name}: exports["."] must include types and import`);
            }
        }
    }

    if (!pkg.files?.includes("dist") && !hasNonDistExports(exportsMap)) {
        errors.push(`${pkg.name}: files must include "dist"`);
    }

    const repositoryUrl =
        pkg.repository && typeof pkg.repository === "object" ? pkg.repository.url : undefined;
    const bugsUrl = pkg.bugs && typeof pkg.bugs === "object" ? pkg.bugs.url : undefined;
    for (const [label, value] of [
        ["repository.url", repositoryUrl],
        ["bugs.url", bugsUrl],
    ]) {
        if (typeof value === "string" && /YOUR_ORG|YOUR_REPO/.test(value)) {
            errors.push(`${pkg.name}: ${label} still contains YOUR_ORG/YOUR_REPO placeholder`);
        }
    }
    if (typeof repositoryUrl === "string" && !/github\.com\/[^/]+\/[^/]+/.test(repositoryUrl)) {
        errors.push(`${pkg.name}: repository.url must point at a GitHub repository`);
    }
    if (!bugsUrl) {
        errors.push(`${pkg.name}: missing bugs.url`);
    }

    if (!Array.isArray(pkg.keywords) || pkg.keywords.length < 4) {
        errors.push(`${pkg.name}: keywords must be an array with at least 4 entries`);
    }

    const readmePath = path.join(dir, "README.md");
    if (!fs.existsSync(readmePath)) {
        errors.push(`${pkg.name}: missing README.md`);
    } else {
        const readme = fs.readFileSync(readmePath, "utf8");
        if (readme.trim().length < 1200) {
            errors.push(
                `${pkg.name}: README.md must be at least 1200 characters for npm consumers`,
            );
        }
        if (readme.includes("\u2014")) {
            errors.push(`${pkg.name}: README.md must not use em dashes`);
        }
    }

    const licensePath = path.join(dir, "LICENSE");
    const rootLicense = path.join(root, "LICENSE");
    if (!fs.existsSync(licensePath) && !fs.existsSync(rootLicense)) {
        errors.push(`${pkg.name}: missing LICENSE`);
    }

    return errors;
}

const entries = fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
const allErrors = entries.flatMap((entry) => validatePackage(entry.name));

if (allErrors.length > 0) {
    console.error(
        "packages:validate failed:\n" + allErrors.map((error) => ` - ${error}`).join("\n"),
    );
    process.exitCode = 1;
} else {
    console.log(`packages:validate ok (${entries.length} package directories scanned)`);
}
