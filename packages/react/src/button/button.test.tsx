import { describe, expect, it } from "vitest";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { Button } from "./index.js";
import { createElement } from "react";

describe("React Button", () => {
    it("renders a native button with data-slot", async () => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const root = createRoot(host);
        await act(async () => {
            root.render(createElement(Button, { classes: { root: "r" } }, "Save"));
        });
        const button = host.querySelector("button");
        expect(button?.getAttribute("data-slot")).toBe("root");
        expect(button?.textContent).toContain("Save");
        await act(async () => {
            root.unmount();
        });
        host.remove();
    });
});
