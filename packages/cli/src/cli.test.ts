import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "./cli.js";

const temps: string[] = [];

function tempProject(): string {
    const dir = mkdtempSync(join(tmpdir(), "sometic-cli-"));
    temps.push(dir);
    writeFileSync(
        join(dir, "package.json"),
        JSON.stringify({ name: "tmp", private: true, dependencies: { react: "19.0.0" } }, null, 4),
    );
    return dir;
}

afterEach(() => {
    for (const dir of temps.splice(0)) {
        rmSync(dir, { recursive: true, force: true });
    }
});

describe("@sometic/cli", () => {
    it("init writes config and README; dry-run writes nothing", async () => {
        const cwd = tempProject();
        const dryLogs: string[] = [];
        const dryCode = await runCli(["init", "--cwd", cwd, "--dry-run"], {
            log: (message) => dryLogs.push(message),
            error: () => {},
        });
        expect(dryCode).toBe(0);
        expect(existsSync(join(cwd, "sometic.config.json"))).toBe(false);
        expect(dryLogs.some((line) => line.includes("[dry-run]"))).toBe(true);

        const code = await runCli(["init", "--cwd", cwd, "--framework", "react"], {
            log: () => {},
            error: () => {},
        });
        expect(code).toBe(0);
        const config = JSON.parse(readFileSync(join(cwd, "sometic.config.json"), "utf8")) as {
            mode: string;
            framework: string;
        };
        expect(config.mode).toBe("hybrid");
        expect(config.framework).toBe("react");
        expect(existsSync(join(cwd, "src/lib/sometic/README.md"))).toBe(true);
    });

    it("add button hybrid for react and refuses overwrite without force", async () => {
        const cwd = tempProject();
        await runCli(["init", "--cwd", cwd, "--framework", "react"], {
            log: () => {},
            error: () => {},
        });
        const addCode = await runCli(["add", "button", "--cwd", cwd], {
            log: () => {},
            error: () => {},
        });
        expect(addCode).toBe(0);
        const file = join(cwd, "src/components/sometic/button.tsx");
        expect(readFileSync(file, "utf8")).toContain("@sometic/react/button");

        const againLogs: string[] = [];
        const again = await runCli(["add", "button", "--cwd", cwd], {
            log: () => {},
            error: (message) => againLogs.push(message),
        });
        expect(again).toBe(1);
        expect(againLogs.join("\n")).toMatch(/Refusing to overwrite/);

        const forced = await runCli(["add", "button", "--cwd", cwd, "--force"], {
            log: () => {},
            error: () => {},
        });
        expect(forced).toBe(0);
        expect(existsSync(join(cwd, ".sometic/backup"))).toBe(true);
    });

    it("lists items and reports deferred doctor", async () => {
        const listLogs: string[] = [];
        await runCli(["list"], {
            log: (message) => listLogs.push(message),
            error: () => {},
        });
        expect(listLogs.some((line) => line.startsWith("button"))).toBe(true);

        const doctorLogs: string[] = [];
        const code = await runCli(["doctor"], {
            log: (message) => doctorLogs.push(message),
            error: () => {},
        });
        expect(code).toBe(0);
        expect(doctorLogs.join("\n")).toMatch(/not implemented/);
    });
});
