import { describe, expect, it, vi } from "vitest";
import { createKeyboardBindings, matchesKey } from "./index.js";

describe("keyboard", () => {
    it("matches key combinations", () => {
        const event = new KeyboardEvent("keydown", { key: "Escape", altKey: true });
        expect(matchesKey(event, { key: "Escape", altKey: true })).toBe(true);
        expect(matchesKey(event, { key: "Escape" })).toBe(false);
    });

    it("invokes bindings on attach", () => {
        const handler = vi.fn();
        const bindings = createKeyboardBindings([{ key: "Enter", handler, preventDefault: true }], {
            target: document,
        });
        bindings.attach();
        const event = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
        });
        document.dispatchEvent(event);
        expect(handler).toHaveBeenCalledTimes(1);
        bindings.dispose();
    });
});
