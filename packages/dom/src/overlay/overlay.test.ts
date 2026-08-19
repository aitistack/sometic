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

    it("restores scroll lock and document listeners after remount and double dispose", () => {
        const previousOverflow = document.body.style.overflow;
        let netDocumentListeners = 0;
        const originalAdd = document.addEventListener.bind(document);
        const originalRemove = document.removeEventListener.bind(document);
        document.addEventListener = ((...args: Parameters<typeof document.addEventListener>) => {
            netDocumentListeners += 1;
            originalAdd(...args);
        }) as typeof document.addEventListener;
        document.removeEventListener = ((
            ...args: Parameters<typeof document.removeEventListener>
        ) => {
            netDocumentListeners -= 1;
            originalRemove(...args);
        }) as typeof document.removeEventListener;

        try {
            for (let index = 0; index < 8; index += 1) {
                const content = document.createElement("div");
                content.tabIndex = -1;
                document.body.appendChild(content);
                const controller = createOverlayController({
                    getContent: () => content,
                    modal: true,
                    defaultOpen: false,
                    portalId: `overlay-leak-${index}`,
                });
                controller.openOverlay();
                expect(document.body.style.overflow).toBe("hidden");
                expect(document.getElementById(`overlay-leak-${index}`)).toBeTruthy();
                controller.dispose();
                controller.dispose();
                content.remove();
            }
            expect(document.body.style.overflow).toBe(previousOverflow);
            expect(netDocumentListeners).toBe(0);
        } finally {
            document.addEventListener = originalAdd;
            document.removeEventListener = originalRemove;
        }
    });
});
