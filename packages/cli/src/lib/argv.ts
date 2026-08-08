export type CliFlags = {
    cwd: string;
    dryRun: boolean;
    force: boolean;
    yes: boolean;
    mode?: "package" | "source" | "hybrid";
    framework?: "vanilla" | "react" | "vue";
    help: boolean;
};

type ParsedCli = {
    command: string;
    args: string[];
    flags: CliFlags;
};

export function parseArgv(argv: string[]): ParsedCli {
    const flags: CliFlags = {
        cwd: process.cwd(),
        dryRun: false,
        force: false,
        yes: false,
        help: false,
    };
    const positional: string[] = [];
    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index]!;
        if (token === "--") {
            positional.push(...argv.slice(index + 1));
            break;
        }
        if (token === "--dry-run") {
            flags.dryRun = true;
            continue;
        }
        if (token === "--force") {
            flags.force = true;
            continue;
        }
        if (token === "--yes" || token === "-y") {
            flags.yes = true;
            continue;
        }
        if (token === "--help" || token === "-h") {
            flags.help = true;
            continue;
        }
        if (token === "--cwd") {
            const value = argv[index + 1];
            if (!value) {
                throw new Error("--cwd requires a path");
            }
            flags.cwd = value;
            index += 1;
            continue;
        }
        if (token.startsWith("--cwd=")) {
            flags.cwd = token.slice("--cwd=".length);
            continue;
        }
        if (token === "--mode") {
            const value = argv[index + 1];
            if (value !== "package" && value !== "source" && value !== "hybrid") {
                throw new Error("--mode must be package|source|hybrid");
            }
            flags.mode = value;
            index += 1;
            continue;
        }
        if (token.startsWith("--mode=")) {
            const value = token.slice("--mode=".length);
            if (value !== "package" && value !== "source" && value !== "hybrid") {
                throw new Error("--mode must be package|source|hybrid");
            }
            flags.mode = value;
            continue;
        }
        if (token === "--framework") {
            const value = argv[index + 1];
            if (value !== "vanilla" && value !== "react" && value !== "vue") {
                throw new Error("--framework must be vanilla|react|vue");
            }
            flags.framework = value;
            index += 1;
            continue;
        }
        if (token.startsWith("--framework=")) {
            const value = token.slice("--framework=".length);
            if (value !== "vanilla" && value !== "react" && value !== "vue") {
                throw new Error("--framework must be vanilla|react|vue");
            }
            flags.framework = value;
            continue;
        }
        if (token.startsWith("-")) {
            throw new Error(`Unknown flag: ${token}`);
        }
        positional.push(token);
    }
    const [command = "help", ...args] = positional;
    return { command, args, flags };
}
