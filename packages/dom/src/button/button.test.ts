import { describe, expect, it, vi } from "vitest";
import { bindButton, handleButtonPress, resolveButton } from "./index.js";

describe("resolveButton", () => {
    it("resolves native type and disabled/loading semantics", () => {
        const view = resolveButton({
            type: "submit",
            loading: true,
            name: "save",
            classes: { root: "btn" },
        });
        expect(view.type).toBe("submit");
        expect(view.nativeDisabled).toBe(true);
        expect(view.shouldIgnorePress).toBe(true);
        expect(view.attributes["aria-busy"]).toBe("true");
        expect(view.attributes["data-loading"]).toBe("true");
        expect(view.attributes["data-slot"]).toBe("root");
        expect(view.className).toContain("btn");
        expect(view.name).toBe("save");
    });

    it("skips defaults when unstyled", () => {
        const view = resolveButton({
            unstyled: true,
            defaults: { className: "default-btn" },
            classes: { root: "custom" },
        });
        expect(view.className).toBe("custom");
    });

    it("ignores press when disabled", () => {
        const onPress = vi.fn();
        const event = { preventDefault: vi.fn() };
        handleButtonPress(resolveButton({ disabled: true }), event, onPress);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(onPress).not.toHaveBeenCalled();
    });
});

describe("bindButton", () => {
    it("binds click and applies attributes", () => {
        const button = document.createElement("button");
        document.body.appendChild(button);
        const onPress = vi.fn();
        const binding = bindButton(button, () => ({
            classes: { root: "bound" },
            onPress,
        }));
        expect(button.className).toContain("bound");
        button.click();
        expect(onPress).toHaveBeenCalled();
        binding.dispose();
        button.remove();
    });
});
