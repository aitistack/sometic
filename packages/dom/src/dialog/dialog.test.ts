import { describe, expect, it } from "vitest";
import { resolveDialog, createDialogController } from "./index.js";

describe("dialog", () => {
    it("resolves dialog attributes when open", () => {
        const view = resolveDialog({ open: true, titleId: "t1" });
        expect(view.attributes.role).toBe("dialog");
        expect(view.attributes["aria-modal"]).toBe("true");
        expect(view.attributes["data-state"]).toBe("open");
        expect(view.attributes["aria-labelledby"]).toBe("t1");
    });

    it("controls open state", () => {
        const content = document.createElement("div");
        document.body.appendChild(content);
        const controller = createDialogController({
            getContent: () => content,
            defaultOpen: false,
        });
        expect(controller.open.get()).toBe(false);
        controller.setOpen(true);
        expect(controller.open.get()).toBe(true);
        expect(controller.resolve().attributes["data-state"]).toBe("open");
        controller.setOpen(false);
        expect(controller.open.get()).toBe(false);
        controller.dispose();
        content.remove();
    });
});
