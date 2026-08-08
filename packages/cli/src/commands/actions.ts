import { join } from "node:path/posix";
import {
    getRegistry,
    getRegistryItem,
    resolveItemFiles,
    type RegistryFramework,
    type RegistryMode,
} from "@sometic/registry";
import { CONFIG_FILE_NAME, createDefaultConfig, type SometicConfig } from "../lib/config.js";
import { detectProject } from "../lib/detect.js";
import {
    createBackupRoot,
    planWrite,
    readJsonFile,
    writeJsonFile,
    writePlan,
} from "../lib/fs-safe.js";
import type { CliFlags } from "../lib/argv.js";
import { existsSync } from "node:fs";
import { join as nodeJoin } from "node:path";

function loadConfig(cwd: string): SometicConfig | null {
    const path = nodeJoin(cwd, CONFIG_FILE_NAME);
    if (!existsSync(path)) {
        return null;
    }
    return readJsonFile<SometicConfig>(path);
}

function requireConfig(cwd: string): SometicConfig {
    const config = loadConfig(cwd);
    if (!config) {
        throw new Error(`Missing ${CONFIG_FILE_NAME}. Run \`sometic init\` first.`);
    }
    return config;
}

function resolveMode(flags: CliFlags, config: SometicConfig | null): RegistryMode {
    return flags.mode ?? config?.mode ?? "hybrid";
}

function resolveFramework(
    flags: CliFlags,
    config: SometicConfig | null,
    cwd: string,
): RegistryFramework {
    return flags.framework ?? config?.framework ?? detectProject(cwd).framework;
}

export function runInit(flags: CliFlags): string[] {
    const detection = detectProject(flags.cwd);
    const existing = loadConfig(flags.cwd);
    if (existing && !flags.force) {
        throw new Error(`${CONFIG_FILE_NAME} already exists (pass --force to recreate)`);
    }
    const config = createDefaultConfig({
        mode: flags.mode ?? existing?.mode ?? "hybrid",
        framework: flags.framework ?? existing?.framework ?? detection.framework,
        packageManager: detection.packageManager,
        ...(existing?.paths ? { paths: existing.paths } : {}),
        ...(existing?.aliases ? { aliases: existing.aliases } : {}),
    });
    const messages: string[] = [];
    const configPath = nodeJoin(flags.cwd, CONFIG_FILE_NAME);
    if (!flags.dryRun) {
        writeJsonFile(configPath, config, { dryRun: false });
    }
    messages.push(
        flags.dryRun ? `[dry-run] would write ${CONFIG_FILE_NAME}` : `wrote ${CONFIG_FILE_NAME}`,
    );

    const item = getRegistryItem("config");
    if (!item) {
        throw new Error("Registry missing config item");
    }
    const backupRoot = !flags.dryRun && flags.force ? createBackupRoot(flags.cwd) : undefined;
    for (const file of resolveItemFiles(item, config.framework, config.mode)) {
        const relativePath = join(config.paths.lib, file.path);
        const plan = planWrite(flags.cwd, relativePath, file.content);
        const result = writePlan(plan, {
            dryRun: flags.dryRun,
            force: flags.force,
            cwd: flags.cwd,
            ...(backupRoot ? { backupRoot } : {}),
        });
        messages.push(
            flags.dryRun
                ? `[dry-run] would write ${plan.relativePath}`
                : `wrote ${plan.relativePath}${result.backedUp ? ` (backup ${result.backedUp})` : ""}`,
        );
    }
    messages.push(
        `mode=${config.mode} framework=${config.framework} packageManager=${config.packageManager}`,
    );
    return messages;
}

export function runAdd(itemName: string, flags: CliFlags): string[] {
    if (!itemName) {
        throw new Error("Usage: sometic add <item>");
    }
    const config = requireConfig(flags.cwd);
    const item = getRegistryItem(itemName);
    if (!item) {
        throw new Error(`Unknown registry item: ${itemName}`);
    }
    const mode = resolveMode(flags, config);
    const framework = resolveFramework(flags, config, flags.cwd);
    if (!item.frameworks.includes(framework)) {
        throw new Error(`Item ${itemName} does not support framework ${framework}`);
    }
    if (!item.modes.includes(mode)) {
        throw new Error(`Item ${itemName} does not support mode ${mode}`);
    }
    const files = resolveItemFiles(item, framework, mode);
    const base =
        itemName === "config" || itemName === "theme" ? config.paths.lib : config.paths.components;
    const messages: string[] = [];
    const backupRoot = !flags.dryRun && flags.force ? createBackupRoot(flags.cwd) : undefined;
    for (const file of files) {
        const relativePath = join(base, file.path);
        const plan = planWrite(flags.cwd, relativePath, file.content);
        const result = writePlan(plan, {
            dryRun: flags.dryRun,
            force: flags.force,
            cwd: flags.cwd,
            ...(backupRoot ? { backupRoot } : {}),
        });
        messages.push(
            flags.dryRun
                ? `[dry-run] would write ${plan.relativePath}`
                : `wrote ${plan.relativePath}${result.backedUp ? ` (backup ${result.backedUp})` : ""}`,
        );
    }
    if (item.dependencies.length > 0 && mode !== "source") {
        messages.push(`install deps (${config.packageManager}): ${item.dependencies.join(" ")}`);
    }
    return messages;
}

export function runList(): string[] {
    return getRegistry().map(
        (item) => `${item.name}\t${item.type}\t${item.title} — ${item.description}`,
    );
}

export function runInfo(itemName: string): string[] {
    if (!itemName) {
        throw new Error("Usage: sometic info <item>");
    }
    const item = getRegistryItem(itemName);
    if (!item) {
        throw new Error(`Unknown registry item: ${itemName}`);
    }
    const lines = [
        `name: ${item.name}`,
        `title: ${item.title}`,
        `type: ${item.type}`,
        `modes: ${item.modes.join(", ")}`,
        `frameworks: ${item.frameworks.join(", ")}`,
        `dependencies: ${item.dependencies.join(", ") || "(none)"}`,
        "files:",
    ];
    if (item.name === "button") {
        for (const framework of item.frameworks) {
            for (const file of resolveItemFiles(item, framework, "hybrid")) {
                lines.push(
                    `  - [${framework}/hybrid] ${file.path} (${file.checksum.slice(0, 12)}…)`,
                );
            }
        }
    } else {
        for (const file of item.files) {
            lines.push(`  - ${file.path} (${file.checksum.slice(0, 12)}…)`);
        }
    }
    return lines;
}

export function runConfig(args: string[], flags: CliFlags): string[] {
    const config = requireConfig(flags.cwd);
    if (args.length === 0) {
        return [JSON.stringify(config, null, 4)];
    }
    const [action, key, value] = args;
    if (action === "get") {
        if (!key) {
            throw new Error("Usage: sometic config get <key>");
        }
        if (key === "mode") {
            return [config.mode];
        }
        if (key === "framework") {
            return [config.framework];
        }
        if (key === "packageManager") {
            return [config.packageManager];
        }
        if (key === "paths.lib") {
            return [config.paths.lib];
        }
        if (key === "paths.components") {
            return [config.paths.components];
        }
        throw new Error(`Unknown config key: ${key}`);
    }
    if (action === "set") {
        if (!key || value === undefined) {
            throw new Error("Usage: sometic config set <key> <value>");
        }
        const next = {
            ...config,
            paths: { ...config.paths },
            aliases: { ...config.aliases },
        };
        if (key === "mode") {
            if (value !== "package" && value !== "source" && value !== "hybrid") {
                throw new Error("mode must be package|source|hybrid");
            }
            next.mode = value;
        } else if (key === "framework") {
            if (value !== "vanilla" && value !== "react" && value !== "vue") {
                throw new Error("framework must be vanilla|react|vue");
            }
            next.framework = value;
        } else if (key === "paths.lib") {
            next.paths.lib = value;
        } else if (key === "paths.components") {
            next.paths.components = value;
        } else {
            throw new Error(`Unsupported config key for set: ${key}`);
        }
        writeJsonFile(nodeJoin(flags.cwd, CONFIG_FILE_NAME), next, {
            dryRun: flags.dryRun,
        });
        return [flags.dryRun ? `[dry-run] would set ${key}=${value}` : `set ${key}=${value}`];
    }
    throw new Error("Usage: sometic config [get|set] ...");
}

export function deferredCommand(name: string): string[] {
    return [
        `\`${name}\` is not implemented in Phase 17 Option A.`,
        "Use init/add/list/info/config for now. diff/update/doctor ship in a follow-up.",
    ];
}
