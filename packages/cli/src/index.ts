export { runCli, helpText } from "./cli.js";
export { parseArgv } from "./lib/argv.js";
export {
    CONFIG_FILE_NAME,
    createDefaultConfig,
    type SometicConfig,
    type SometicFramework,
    type SometicInstallMode,
} from "./lib/config.js";
export { detectProject } from "./lib/detect.js";
