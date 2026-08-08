import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, normalize, relative, resolve, sep } from "node:path";

type WritePlan = {
    absolutePath: string;
    relativePath: string;
    content: string;
    exists: boolean;
};

function assertSafeRelativePath(relativePath: string): void {
    const normalized = normalize(relativePath).replaceAll("\\", "/");
    if (
        normalized.startsWith("..") ||
        normalized.includes("/../") ||
        normalized.startsWith("/") ||
        normalized.includes(":")
    ) {
        throw new Error(`Unsafe path rejected: ${relativePath}`);
    }
}

function toPosix(relativePath: string): string {
    return relativePath.split(sep).join("/");
}

export function planWrite(cwd: string, relativePath: string, content: string): WritePlan {
    assertSafeRelativePath(relativePath);
    const absolutePath = resolve(cwd, relativePath);
    const rel = toPosix(relative(cwd, absolutePath));
    if (rel.startsWith("..")) {
        throw new Error(`Path escapes project root: ${relativePath}`);
    }
    return {
        absolutePath,
        relativePath: rel,
        content: content.replace(/\r\n/g, "\n"),
        exists: existsSync(absolutePath),
    };
}

function ensureDirFor(filePath: string): void {
    mkdirSync(dirname(filePath), { recursive: true });
}

function backupFile(filePath: string, backupRoot: string, cwd: string): string {
    const rel = toPosix(relative(cwd, filePath));
    const target = join(backupRoot, rel);
    ensureDirFor(target);
    copyFileSync(filePath, target);
    return target;
}

export function writePlan(
    plan: WritePlan,
    options: { dryRun: boolean; force: boolean; backupRoot?: string; cwd: string },
): { written: boolean; backedUp?: string } {
    if (plan.exists && !options.force) {
        throw new Error(
            `Refusing to overwrite ${plan.relativePath} (pass --force to backup and replace)`,
        );
    }
    if (options.dryRun) {
        return { written: false };
    }
    let backedUp: string | undefined;
    if (plan.exists && options.force && options.backupRoot) {
        backedUp = backupFile(plan.absolutePath, options.backupRoot, options.cwd);
    }
    ensureDirFor(plan.absolutePath);
    writeFileSync(plan.absolutePath, plan.content, "utf8");
    return { written: true, ...(backedUp ? { backedUp } : {}) };
}

export function readJsonFile<T>(filePath: string): T {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export function writeJsonFile(
    filePath: string,
    value: unknown,
    options: { dryRun: boolean },
): void {
    const content = `${JSON.stringify(value, null, 4)}\n`;
    if (options.dryRun) {
        return;
    }
    ensureDirFor(filePath);
    writeFileSync(filePath, content, "utf8");
}

export function createBackupRoot(cwd: string): string {
    const stamp = new Date().toISOString().replaceAll(":", "-");
    const root = join(cwd, ".sometic", "backup", stamp);
    mkdirSync(root, { recursive: true });
    return root;
}
