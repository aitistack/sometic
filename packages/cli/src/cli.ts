import { parseArgv } from "./lib/argv.js";
import {
    deferredCommand,
    runAdd,
    runConfig,
    runInfo,
    runInit,
    runList,
} from "./commands/actions.js";

export function helpText(): string {
    return `Sometic CLI

Usage:
  sometic <command> [options]

Commands:
  init                 Create sometic.config.json and lib README
  add <item>           Add a registry template (config|theme|button)
  list                 List registry items
  info <item>          Show registry item details
  config [get|set]     Read or update config non-interactively
  diff|update|doctor   Deferred (not in Option A)

Options:
  --cwd <path>         Project directory (default: cwd)
  --mode <mode>        package|source|hybrid
  --framework <name>   vanilla|react|vue
  --dry-run            Print actions without writing
  --force              Overwrite with backup under .sometic/backup
  --yes, -y            Non-interactive affirm (CI-friendly)
  --help, -h           Show help

Modes:
  hybrid (default)     Package engines + local wrappers
  package              Prefer package imports only
  source               Local wrappers with more ownership hooks

Never use postinstall — invoke explicitly:
  pnpm dlx @sometic/cli@latest init
`;
}

export async function runCli(
    argv: string[],
    io: { log: (message: string) => void; error: (message: string) => void } = {
        log: (message) => {
            console.log(message);
        },
        error: (message) => {
            console.error(message);
        },
    },
): Promise<number> {
    try {
        const parsed = parseArgv(argv);
        if (parsed.flags.help || parsed.command === "help") {
            io.log(helpText());
            return 0;
        }
        let messages: string[] = [];
        switch (parsed.command) {
            case "init":
                messages = runInit(parsed.flags);
                break;
            case "add":
                messages = runAdd(parsed.args[0] ?? "", parsed.flags);
                break;
            case "list":
                messages = runList();
                break;
            case "info":
                messages = runInfo(parsed.args[0] ?? "");
                break;
            case "config":
                messages = runConfig(parsed.args, parsed.flags);
                break;
            case "diff":
            case "update":
            case "doctor":
                messages = deferredCommand(parsed.command);
                break;
            default:
                throw new Error(`Unknown command: ${parsed.command}\n\n${helpText()}`);
        }
        for (const message of messages) {
            io.log(message);
        }
        return 0;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        io.error(message);
        return 1;
    }
}
