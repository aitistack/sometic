import { describe, expect, it } from "vitest";
import { createOverlayController } from "./index.js";

describe("overlay", () => {
    it("opens and closes without throwing", () => {
        const content = document.createElement("div");
        content.tabIndex = -1;
        document.body.appendChild(content);
        const controller = createOverlayController({
            getContent: () => content,
            modal: true,
            defaultOpen: false,
        });
        controller.openOverlay();
        expect(controller.open.get()).toBe(true);
        controller.closeOverlay();
        expect(controller.open.get()).toBe(false);
        controller.dispose();
        content.remove();
    });
});
