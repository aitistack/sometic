import { describe, expect, it, vi } from "vitest";
import { createDismissableLayer } from "./index.js";

describe("dismissable", () => {
    it("dismisses top layer on Escape and ignores lower layers", () => {
        document.body.innerHTML = `
            <div id="lower"></div>
            <div id="upper"></div>
        `;
        const lowerDismiss = vi.fn();
        const upperDismiss = vi.fn();
        const lower = createDismissableLayer({
            getElement: () => document.getElementById("lower"),
            onDismiss: lowerDismiss,
        });
        const upper = createDismissableLayer({
            getElement: () => document.getElementById("upper"),
            onDismiss: upperDismiss,
        });
        lower.activate();
        upper.activate();

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(upperDismiss).toHaveBeenCalledWith("escape-key");
        expect(lowerDismiss).not.toHaveBeenCalled();

        upper.deactivate();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        expect(lowerDismiss).toHaveBeenCalledWith("escape-key");

        lower.dispose();
        upper.dispose();
    });

    it("dismisses on outside pointerdown", () => {
        document.body.innerHTML = `
            <div id="layer"><button id="inside">In</button></div>
            <button id="outside">Out</button>
        `;
        const onDismiss = vi.fn();
        const layer = createDismissableLayer({
            getElement: () => document.getElementById("layer"),
            onDismiss,
        });
        layer.activate();
        document
            .getElementById("outside")!
            .dispatchEvent(new Event("pointerdown", { bubbles: true }));
        expect(onDismiss).toHaveBeenCalledWith("outside-press");
        layer.dispose();
    });
});
