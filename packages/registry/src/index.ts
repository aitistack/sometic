import { createHash } from "node:crypto";

export type RegistryFramework = "vanilla" | "react" | "vue";

export type RegistryMode = "package" | "source" | "hybrid";

export type RegistryItemType = "config" | "theme" | "component";

export type RegistryFile = {
    path: string;
    content: string;
    checksum: string;
};

export type RegistryItem = {
    name: string;
    title: string;
    description: string;
    type: RegistryItemType;
    modes: readonly RegistryMode[];
    frameworks: readonly RegistryFramework[];
    dependencies: readonly string[];
    files: readonly RegistryFile[];
};

export function checksumContent(content: string): string {
    const normalized = content.replace(/\r\n/g, "\n");
    return createHash("sha256").update(normalized, "utf8").digest("hex");
}

export function createRegistryFile(path: string, content: string): RegistryFile {
    const normalized = content.replace(/\r\n/g, "\n");
    return {
        path,
        content: normalized,
        checksum: checksumContent(normalized),
    };
}

function themeFile(): RegistryFile {
    return createRegistryFile(
        "theme.ts",
        `import { createThemeController } from "@sometic/theme";
import { darkTheme, lightTheme } from "@sometic/theme/presets";

export const themeController = createThemeController({
    themes: [lightTheme, darkTheme],
    defaultThemeId: "light",
    mode: "system",
});
`,
    );
}

function buttonVanillaHybrid(): RegistryFile {
    return createRegistryFile(
        "button.ts",
        `import { bindButton, type BindButtonOptions } from "@sometic/dom/button";

export function bindSometicButton(
    element: HTMLButtonElement,
    getOptions: () => BindButtonOptions,
): ReturnType<typeof bindButton> {
    return bindButton(element, getOptions);
}
`,
    );
}

function buttonReactHybrid(): RegistryFile {
    return createRegistryFile(
        "button.tsx",
        `export { Button, AsyncButton, IconButton, ToggleButton, ButtonGroup } from "@sometic/react/button";
`,
    );
}

function buttonVueHybrid(): RegistryFile {
    return createRegistryFile(
        "button.ts",
        `export { Button, AsyncButton, IconButton, ToggleButton, ButtonGroup } from "@sometic/vue/button";
`,
    );
}

function buttonVanillaSource(): RegistryFile {
    return createRegistryFile(
        "button.ts",
        `import { bindButton, type BindButtonOptions } from "@sometic/dom/button";

/** Local ownership wrapper — customize classes/styles here; keep engine imports. */
export function bindSometicButton(
    element: HTMLButtonElement,
    getOptions: () => BindButtonOptions,
): ReturnType<typeof bindButton> {
    return bindButton(element, () => {
        const options = getOptions();
        return {
            ...options,
            classes: {
                root: ["sometic-btn", options.classes?.root].filter(Boolean),
            },
        };
    });
}
`,
    );
}

function readmeFile(): RegistryFile {
    return createRegistryFile(
        "README.md",
        `# Sometic UI (generated)

Hybrid mode keeps security-sensitive and engine logic in \`@sometic/*\` packages.
Own styling and composition files in this folder. Do not copy auth refresh/OAuth internals here.

Run \`sometic add <item>\` to add more templates. Docs: https://sometic.dev
`,
    );
}

export const REGISTRY_ITEMS: readonly RegistryItem[] = [
    {
        name: "config",
        title: "Project config",
        description: "sometic.config.json scaffold and local README.",
        type: "config",
        modes: ["package", "source", "hybrid"],
        frameworks: ["vanilla", "react", "vue"],
        dependencies: [],
        files: [readmeFile()],
    },
    {
        name: "theme",
        title: "Theme controller facade",
        description: "Thin theme controller wrapper over @sometic/theme.",
        type: "theme",
        modes: ["hybrid", "source", "package"],
        frameworks: ["vanilla", "react", "vue"],
        dependencies: ["@sometic/theme"],
        files: [themeFile()],
    },
    {
        name: "button",
        title: "Button wrapper",
        description: "Framework-aware button facade. Engines stay in packages.",
        type: "component",
        modes: ["hybrid", "source", "package"],
        frameworks: ["vanilla", "react", "vue"],
        dependencies: ["@sometic/dom", "@sometic/react", "@sometic/vue"],
        files: [],
    },
] as const;

export function getRegistry(): readonly RegistryItem[] {
    return REGISTRY_ITEMS;
}

export function getRegistryItem(name: string): RegistryItem | undefined {
    return REGISTRY_ITEMS.find((item) => item.name === name);
}

export function resolveButtonFiles(
    framework: RegistryFramework,
    mode: RegistryMode,
): readonly RegistryFile[] {
    if (framework === "react") {
        return [buttonReactHybrid()];
    }
    if (framework === "vue") {
        return [buttonVueHybrid()];
    }
    if (mode === "source") {
        return [buttonVanillaSource()];
    }
    return [buttonVanillaHybrid()];
}

export function resolveItemFiles(
    item: RegistryItem,
    framework: RegistryFramework,
    mode: RegistryMode,
): readonly RegistryFile[] {
    if (item.name === "button") {
        return resolveButtonFiles(framework, mode);
    }
    return item.files;
}

export function verifyChecksums(item: RegistryItem): void {
    for (const file of item.files) {
        const actual = checksumContent(file.content);
        if (actual !== file.checksum) {
            throw new Error(`Checksum mismatch for ${item.name}:${file.path}`);
        }
    }
}

export function verifyRegistryChecksums(): void {
    for (const item of REGISTRY_ITEMS) {
        verifyChecksums(item);
        if (item.name === "button") {
            for (const framework of item.frameworks) {
                for (const mode of item.modes) {
                    for (const file of resolveButtonFiles(framework, mode)) {
                        const actual = checksumContent(file.content);
                        if (actual !== file.checksum) {
                            throw new Error(
                                `Checksum mismatch for button/${framework}/${mode}:${file.path}`,
                            );
                        }
                    }
                }
            }
        }
    }
}
