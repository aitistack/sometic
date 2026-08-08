import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

try {
    execSync("pnpm exec depcruise --config dependency-cruiser.cjs packages apps tooling", {
        cwd: root,
        stdio: "inherit",
    });
    console.log("circular: ok");
} catch {
    process.exitCode = 1;
}
