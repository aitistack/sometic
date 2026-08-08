import { describe, expect, it, vi } from "vitest";
import { bindHtmxButton, createHtmxBinderRoot, createHtmxStoreBind } from "./index.js";

describe("@sometic/htmx", () => {
    it("updates and disposes store bind", () => {
        const bind = createHtmxStoreBind({ count: 0 });
        bind.update((state) => ({ count: state.count + 1 }));
        expect(bind.get().count).toBe(1);
        bind.dispose();
    });

    it("rebinds after settle without stacking listeners", () => {
        const host = document.createElement("div");
        document.body.append(host);
        const button = document.createElement("button");
        button.setAttribute("data-sometic-button", "");
        host.append(button);

        const onPress = vi.fn();
        const root = createHtmxBinderRoot(host);
        root.register({
            selector: "[data-sometic-button]",
            bind: (element) => {
                if (!(element instanceof HTMLButtonElement)) {
                    return { disposed: true, dispose() {} };
                }
                return bindHtmxButton(element, () => ({ onPress }));
            },
        });

        button.click();
        expect(onPress).toHaveBeenCalledTimes(1);

        host.dispatchEvent(new Event("htmx:afterSettle", { bubbles: true }));
        button.click();
        expect(onPress).toHaveBeenCalledTimes(2);

        const replacement = document.createElement("button");
        replacement.setAttribute("data-sometic-button", "");
        button.replaceWith(replacement);
        host.dispatchEvent(new Event("htmx:afterSettle", { bubbles: true }));
        replacement.click();
        expect(onPress).toHaveBeenCalledTimes(3);
        button.click();
        expect(onPress).toHaveBeenCalledTimes(3);

        root.dispose();
        replacement.click();
        expect(onPress).toHaveBeenCalledTimes(3);
        host.remove();
    });
});
