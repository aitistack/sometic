import { describe, expect, it } from "vitest";
import { createAsyncButtonController } from "./index.js";

describe("async-button", () => {
    it("marks loading while pending and resolves", async () => {
        let release!: () => void;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        const controller = createAsyncButtonController({
            action: async () => {
                await gate;
                return 42;
            },
        });
        const pending = controller.press({
            preventDefault() {
                return;
            },
        });
        expect(controller.resolve().loading).toBe(true);
        release();
        await expect(pending).resolves.toBe(42);
        expect(controller.resolve().loading).toBe(false);
    });
});
