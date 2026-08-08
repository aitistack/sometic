import { describe, expect, it } from "vitest";
import { createFocusTrap, getTabbableElements } from "./index.js";

describe("focus", () => {
    it("lists tabbable elements and skips disabled", () => {
        document.body.innerHTML = `
            <div id="root">
                <button id="a">A</button>
                <button id="b" disabled>B</button>
                <a id="c" href="#">C</a>
                <button id="d" tabindex="-1">D</button>
            </div>
        `;
        const root = document.getElementById("root")!;
        const tabbables = getTabbableElements(root).map((el) => el.id);
        expect(tabbables).toEqual(["a", "c"]);
    });

    it("traps tab focus and restores on deactivate", () => {
        document.body.innerHTML = `
            <button id="outside">Outside</button>
            <div id="dialog">
                <button id="first">First</button>
                <button id="last">Last</button>
            </div>
        `;
        const outside = document.getElementById("outside") as HTMLButtonElement;
        const dialog = document.getElementById("dialog")!;
        const first = document.getElementById("first") as HTMLButtonElement;
        const last = document.getElementById("last") as HTMLButtonElement;
        outside.focus();
        expect(document.activeElement).toBe(outside);

        const trap = createFocusTrap({ container: dialog });
        trap.activate();
        expect(document.activeElement).toBe(first);

        last.focus();
        const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
        document.dispatchEvent(event);
        expect(document.activeElement).toBe(first);

        trap.deactivate();
        expect(document.activeElement).toBe(outside);
        trap.dispose();
    });
});
