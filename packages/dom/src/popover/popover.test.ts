import { describe, expect, it } from "vitest";
import { createPopoverController, resolvePopover } from "./index.js";

describe("popover", () => {
    it("resolves popover attributes", () => {
        const view = resolvePopover({ open: true, placement: "bottom", x: 10, y: 20 });
        expect(view.attributes.role).toBe("dialog");
        expect(view.style.left).toBe("10px");
        expect(view.style.top).toBe("20px");
    });

    it("updates position from rects via elements", () => {
        const reference = document.createElement("button");
        const floating = document.createElement("div");
        reference.getBoundingClientRect = () =>
            ({
                x: 40,
                y: 40,
                width: 80,
                height: 20,
                top: 40,
                left: 40,
                right: 120,
                bottom: 60,
                toJSON() {
                    return {};
                },
            }) as DOMRect;
        floating.getBoundingClientRect = () =>
            ({
                x: 0,
                y: 0,
                width: 100,
                height: 40,
                top: 0,
                left: 0,
                right: 100,
                bottom: 40,
                toJSON() {
                    return {};
                },
            }) as DOMRect;
        document.body.append(reference, floating);
        const controller = createPopoverController({
            getContent: () => floating,
            placement: "bottom",
        });
        const result = controller.updatePosition(reference, floating);
        expect(result.y).toBeGreaterThan(40);
        expect(controller.resolve().attributes["data-placement"]).toBeTruthy();
        controller.dispose();
        reference.remove();
        floating.remove();
    });
});
