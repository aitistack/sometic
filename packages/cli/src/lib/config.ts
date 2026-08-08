export type SometicInstallMode = "package" | "source" | "hybrid";

export type SometicFramework = "vanilla" | "react" | "vue";

export type SometicPackageManager = "npm" | "pnpm" | "yarn" | "bun";

export type SometicConfig = {
    schemaVersion: 1;
    mode: SometicInstallMode;
    framework: SometicFramework;
    paths: {
        lib: string;
        components: string;
    };
    packageManager: SometicPackageManager;
    aliases: Record<string, string>;
};

export const CONFIG_FILE_NAME = "sometic.config.json";

export function createDefaultConfig(partial: Partial<SometicConfig> = {}): SometicConfig {
    return {
        schemaVersion: 1,
        mode: partial.mode ?? "hybrid",
        framework: partial.framework ?? "vanilla",
        paths: {
            lib: partial.paths?.lib ?? "src/lib/sometic",
            components: partial.paths?.components ?? "src/components/sometic",
        },
        packageManager: partial.packageManager ?? "pnpm",
        aliases: partial.aliases ?? { "@/*": "./src/*" },
    };
}
