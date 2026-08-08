import { describe, expect, it } from "vitest";
import { createNativeDateAdapter } from "@sometic/date-native";
import { createDateInputController } from "./index.js";

describe("createDateInputController", () => {
    it("bridges native yyyy-mm-dd values", () => {
        const adapter = createNativeDateAdapter();
        const controller = createDateInputController({ adapter });
        controller.setFromNativeValue("2024-02-03");
        const current = controller.value.get();
        expect(current?.getFullYear()).toBe(2024);
        expect(current?.getMonth()).toBe(1);
        expect(current?.getDate()).toBe(3);
        expect(controller.resolve().value).toBe("2024-02-03");
    });
});
