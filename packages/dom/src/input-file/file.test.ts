import { describe, expect, it } from "vitest";
import { createFileInputController } from "./index.js";

describe("createFileInputController", () => {
    it("clears files", () => {
        const controller = createFileInputController({
            defaultValue: [new File(["a"], "a.txt")],
        });
        expect(controller.value.get()).toHaveLength(1);
        controller.clear();
        expect(controller.value.get()).toHaveLength(0);
    });
});
