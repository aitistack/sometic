import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { SometicFramework, SometicPackageManager } from "./config.js";

type ProjectDetection = {
    packageManager: SometicPackageManager;
    framework: SometicFramework;
    hasPackageJson: boolean;
};

function detectPackageManager(cwd: string): SometicPackageManager {
    if (existsSync(join(cwd, "pnpm-lock.yaml"))) {
        return "pnpm";
    }
    if (existsSync(join(cwd, "yarn.lock"))) {
        return "yarn";
    }
    if (existsSync(join(cwd, "bun.lock")) || existsSync(join(cwd, "bun.lockb"))) {
        return "bun";
    }
    if (existsSync(join(cwd, "package-lock.json"))) {
        return "npm";
    }
    const packageJsonPath = join(cwd, "package.json");
    if (existsSync(packageJsonPath)) {
        try {
            const raw = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
                packageManager?: string;
            };
            const field = raw.packageManager ?? "";
            if (field.startsWith("pnpm")) {
                return "pnpm";
            }
            if (field.startsWith("yarn")) {
                return "yarn";
            }
            if (field.startsWith("bun")) {
                return "bun";
            }
        } catch {
            return "npm";
        }
    }
    return "npm";
}

function detectFramework(cwd: string): SometicFramework {
    const packageJsonPath = join(cwd, "package.json");
    if (!existsSync(packageJsonPath)) {
        return "vanilla";
    }
    try {
        const raw = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
            dependencies?: Record<string, string>;
            devDependencies?: Record<string, string>;
        };
        const deps = {
            ...raw.dependencies,
            ...raw.devDependencies,
        };
        if (deps.react || deps["react-dom"]) {
            return "react";
        }
        if (deps.vue) {
            return "vue";
        }
    } catch {
        return "vanilla";
    }
    return "vanilla";
}

export function detectProject(cwd: string): ProjectDetection {
    return {
        packageManager: detectPackageManager(cwd),
        framework: detectFramework(cwd),
        hasPackageJson: existsSync(join(cwd, "package.json")),
    };
}
