import { describe, expect, it, vi } from "vitest";
import { createDismissableLayer } from "./dismissable/index.js";
import { createFocusTrap } from "./focus/index.js";
import { createPortalRoot } from "./portal/index.js";
import { lockBodyScroll } from "./scroll-lock/index.js";

describe("overlay stack cleanup", () => {
    it("releases document listeners after activate/deactivate remount", () => {
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
            document.body.innerHTML = `
                <button id="outside">Outside</button>
                <div id="dialog">
                    <button id="first">First</button>
                    <button id="last">Last</button>
                </div>
            `;
            const dialog = document.getElementById("dialog")!;
            for (let index = 0; index < 6; index += 1) {
                const trap = createFocusTrap({ container: dialog });
                const dismiss = createDismissableLayer({
                    getElement: () => dialog,
                    onDismiss: vi.fn(),
                });
                trap.activate();
                dismiss.activate();
                trap.deactivate();
                trap.dispose();
                trap.dispose();
                dismiss.deactivate();
                dismiss.dispose();
                dismiss.dispose();
            }
            expect(netDocumentListeners).toBe(0);
        } finally {
            document.addEventListener = originalAdd;
            document.removeEventListener = originalRemove;
            document.body.innerHTML = "";
        }
    });

    it("restores body overflow and removes portal roots", () => {
        const previousOverflow = document.body.style.overflow;
        for (let index = 0; index < 6; index += 1) {
            const lock = lockBodyScroll();
            const portal = createPortalRoot({ id: `leak-portal-${index}` });
            portal.ensure();
            expect(document.getElementById(`leak-portal-${index}`)).toBeTruthy();
            lock.dispose();
            lock.dispose();
            portal.dispose();
            portal.dispose();
        }
        expect(document.body.style.overflow).toBe(previousOverflow);
        expect(document.querySelector("[id^='leak-portal-']")).toBeNull();
    });
});
