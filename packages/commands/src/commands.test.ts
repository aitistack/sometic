import { describe, expect, it, vi } from "vitest";
import { createCommandRegistry } from "./commands.js";

describe("createCommandRegistry", () => {
    it("registers, lists, gets, and unregisters commands", async () => {
        const onEvent = vi.fn();
        const registry = createCommandRegistry({ onEvent });
        const execute = vi.fn(() => "ok");

        const unregister = registry.register({
            id: "save",
            label: "Save",
            execute,
        });

        expect(registry.has("save")).toBe(true);
        expect(registry.list()).toEqual(["save"]);
        expect(registry.get("save")?.label).toBe("Save");
        expect(onEvent).toHaveBeenCalledWith({ type: "register", id: "save" });

        await expect(registry.execute("save", { entityId: "1" })).resolves.toBe("ok");
        expect(execute).toHaveBeenCalledWith({ entityId: "1" });
        expect(onEvent).toHaveBeenCalledWith({
            type: "execute",
            id: "save",
            result: "ok",
        });

        unregister();
        expect(registry.has("save")).toBe(false);
        expect(onEvent).toHaveBeenCalledWith({ type: "unregister", id: "save" });

        registry.register({ id: "save", execute: () => 1 });
        registry.unregister("save");
        expect(registry.has("save")).toBe(false);
        registry.unregister("missing");
        registry.dispose();
    });

    it("rejects invalid and duplicate ids", () => {
        const registry = createCommandRegistry();
        expect(() =>
            registry.register({ id: " ", execute: () => undefined }),
        ).toThrow(/non-empty string/);
        expect(() =>
            registry.register({ id: "", execute: () => undefined }),
        ).toThrow(/non-empty string/);

        registry.register({ id: "save", execute: () => undefined });
        expect(() =>
            registry.register({ id: "save", execute: () => undefined }),
        ).toThrow(/already registered/);
        registry.dispose();
    });

    it("honors canExecute and surfaces execute failures", async () => {
        const registry = createCommandRegistry();
        const listener = vi.fn();
        registry.subscribe(listener);

        registry.register({
            id: "delete",
            canExecute: (context) => context?.["allowed"] === true,
            execute: () => "deleted",
        });

        expect(registry.canExecute("delete")).toBe(false);
        expect(registry.canExecute("delete", { allowed: true })).toBe(true);
        expect(registry.canExecute("missing")).toBe(false);

        await expect(registry.execute("delete")).rejects.toMatchObject({
            code: "COMMAND_NOT_EXECUTABLE",
        });
        await expect(registry.execute("missing")).rejects.toMatchObject({
            code: "COMMAND_NOT_FOUND",
        });

        registry.register({
            id: "boom",
            execute: () => {
                throw new Error("nope");
            },
        });
        await expect(registry.execute("boom")).rejects.toThrow(/nope/);
        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({ type: "error", id: "boom" }),
        );

        const stop = registry.subscribe(() => undefined);
        stop();
        registry.dispose();
    });

    it("supports async execute and defaults canExecute to true", async () => {
        const registry = createCommandRegistry();
        registry.register({
            id: "async",
            execute: async () => {
                await Promise.resolve();
                return 42;
            },
        });
        expect(registry.canExecute("async")).toBe(true);
        await expect(registry.execute<number>("async")).resolves.toBe(42);
        registry.dispose();
    });

    it("rejects work after dispose and ignores unregister from disposed registry", () => {
        const registry = createCommandRegistry();
        const unregister = registry.register({
            id: "save",
            execute: () => undefined,
        });
        registry.dispose();
        expect(registry.disposed).toBe(true);
        expect(() => unregister()).not.toThrow();
        expect(() => registry.has("save")).toThrow(/disposed/);
        expect(() => registry.list()).toThrow(/disposed/);
        expect(() => registry.register({ id: "x", execute: () => undefined })).toThrow(
            /disposed/,
        );
        expect(() => registry.subscribe(() => undefined)).toThrow(/disposed/);
    });
});
