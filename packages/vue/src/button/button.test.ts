import { describe, expect, it } from "vitest";
import { createApp, h } from "vue";
import { Button } from "./index.js";

describe("Vue Button", () => {
    it("mounts a native button", () => {
        const host = document.createElement("div");
        document.body.appendChild(host);
        const app = createApp({
            render: () => h(Button, null, { default: () => "Go" }),
        });
        app.mount(host);
        expect(host.querySelector("button")?.textContent).toContain("Go");
        app.unmount();
        host.remove();
    });
});
