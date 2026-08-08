import { describe, expect, it } from "vitest";
import { createPasswordInputController } from "./index.js";

describe("createPasswordInputController", () => {
    it("toggles revealed type", () => {
        const controller = createPasswordInputController({ defaultValue: "secret" });
        expect(controller.resolve().type).toBe("password");
        controller.toggleRevealed();
        expect(controller.resolve().type).toBe("text");
    });
});
