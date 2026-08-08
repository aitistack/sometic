import { describe, expect, it } from "vitest";
import { bindInput, createInputController, resolveInput } from "./index.js";

describe("resolveInput", () => {
    it("marks filled and invalid states", () => {
        const view = resolveInput({ value: "hi", invalid: true, required: true });
        expect(view.filled).toBe(true);
        expect(view.attributes["data-filled"]).toBe("true");
        expect(view.nativeAttributes["aria-invalid"]).toBe("true");
        expect(view.nativeAttributes.required).toBe("");
    });
});

describe("createInputController", () => {
    it("supports uncontrolled updates", () => {
        const controller = createInputController({ defaultValue: "a" });
        expect(controller.value.get()).toBe("a");
        controller.value.set("b");
        expect(controller.resolve().value).toBe("b");
    });
});

describe("bindInput", () => {
    it("ignores user edits when disabled", () => {
        const input = document.createElement("input");
        document.body.append(input);
        let value = "x";
        const binding = bindInput(input, () => ({
            value,
            disabled: true,
            onValueChange: (next) => {
                value = next;
            },
        }));
        input.value = "changed";
        input.dispatchEvent(new Event("input"));
        expect(value).toBe("x");
        expect(input.value).toBe("x");
        binding.dispose();
        input.remove();
    });

    it("emits onValueChange when enabled", () => {
        const input = document.createElement("input");
        document.body.append(input);
        let value = "";
        const binding = bindInput(input, () => ({
            value,
            onValueChange: (next) => {
                value = next;
            },
        }));
        input.value = "ok";
        input.dispatchEvent(new Event("input"));
        expect(value).toBe("ok");
        binding.dispose();
        input.remove();
    });
});
